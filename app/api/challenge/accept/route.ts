import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { GEAR, GearTemplate, StatKey, xpForLevel, maxHp, getDenPerks } from '@/lib/game-data'
import { simulateBattle, Fighter } from '@/lib/battle-engine'
import { applyGearAndBuffs } from '@/lib/stats'

// Admin client bypasses RLS — needed to update the attacker's character from the defender's session
const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId, daring, surrenderAt } = await req.json()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .eq('status', 'pending')
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found or already resolved.' }, { status: 400 })

  const { data: defender } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!defender?.alive) return NextResponse.json({ error: 'Your character is dead.' }, { status: 400 })
  if (defender.id !== challenge.challenged_id) return NextResponse.json({ error: 'This challenge is not for you.' }, { status: 403 })

  const { data: attacker } = await supabase
    .from('characters')
    .select('*')
    .eq('id', challenge.challenger_id)
    .single()

  if (!attacker?.alive) return NextResponse.json({ error: 'Your challenger is dead. Anticlimactic.' }, { status: 400 })

  async function getGearStats(characterId: string) {
    const { data: inv } = await supabase
      .from('inventory')
      .select('gear_id')
      .eq('character_id', characterId)
      .eq('equipped', true)
    const gear: GearTemplate[] = ((inv || []) as { gear_id: string }[])
      .map(i => GEAR.find(g => g.id === i.gear_id))
      .filter(Boolean) as GearTemplate[]
    return gear
  }

  const attackerGear = await getGearStats(attacker.id)
  const defenderGear = await getGearStats(defender.id)

  const attackerDenPerks = (attacker.den_town && attacker.den_tier)
    ? getDenPerks(attacker.den_town as number, attacker.den_tier as number)
    : {}
  const defenderDenPerks = (defender.den_town && defender.den_tier)
    ? getDenPerks(defender.den_town as number, defender.den_tier as number)
    : {}

  const attackerBaseStats = applyGearAndBuffs(attacker.stats, attackerGear, attacker.buffs || [])
  const defenderBaseStats = applyGearAndBuffs(defender.stats, defenderGear, defender.buffs || [])

  if (attackerDenPerks.ferocityBonus) {
    attackerBaseStats.strength = (attackerBaseStats.strength || 0) + attackerDenPerks.ferocityBonus
  }
  if (defenderDenPerks.ferocityBonus) {
    defenderBaseStats.strength = (defenderBaseStats.strength || 0) + defenderDenPerks.ferocityBonus
  }

  const defenderIsAtHome = !!(defender.den_town && defender.den_town === defender.current_town)
  const homeHpBonus = defenderIsAtHome ? (defenderDenPerks.homeHpBonus ?? 0) : 0

  const fighterA: Fighter = {
    id: attacker.id,
    name: attacker.name,
    species: attacker.species,
    stats: attackerBaseStats,
    daring: challenge.challenger_daring,
    surrenderAt: challenge.challenger_surrender_at,
    initialHp: attacker.hp,
  }

  const fighterB: Fighter = {
    id: defender.id,
    name: defender.name,
    species: defender.species,
    stats: defenderBaseStats,
    daring,
    surrenderAt,
    initialHp: Math.min(defender.max_hp, defender.hp + homeHpBonus),
  }

  // Consume both fighters' buffs
  await Promise.all([
    supabase.from('characters').update({ buffs: [] }).eq('id', attacker.id),
    supabase.from('characters').update({ buffs: [] }).eq('id', defender.id),
  ])

  const battle = simulateBattle(fighterA, fighterB)

  const aWon = battle.winner === 'a'
  const bWon = battle.winner === 'b'

  // XP rewards — scaled by level gap so farming low-levels is unrewarding
  // Winning as the underdog (vs higher level) gives bonus XP; winning as the favorite gives little
  const BASE_XP = 80
  const aLevelAdv = defender.level - attacker.level  // positive = attacker is the underdog
  const bLevelAdv = attacker.level - defender.level  // positive = defender is the underdog
  const aXpMult = Math.max(0.15, Math.min(3.0, 1 + aLevelAdv * 0.15))
  const bXpMult = Math.max(0.15, Math.min(3.0, 1 + bLevelAdv * 0.15))
  const aXpGain = aWon ? Math.round(BASE_XP * aXpMult) : Math.max(5, Math.floor(BASE_XP * aXpMult * 0.10))
  const bXpGain = bWon ? Math.round(BASE_XP * bXpMult) : Math.max(5, Math.floor(BASE_XP * bXpMult * 0.10))

  function newLevel(currentLevel: number, currentXp: number, xpGain: number) {
    const total = currentXp + xpGain
    let l = currentLevel
    while (xpForLevel(l + 1) <= total) l++
    return { level: l, xp: total }
  }

  const aMaxHp = maxHp(fighterA.stats.constitution)
  const bMaxHp = maxHp(fighterB.stats.constitution)

  // Battle started at real HP so aFinalHp/bFinalHp are already the correct post-battle values
  const aNewHp = Math.max(battle.aAlive ? 1 : 0, battle.aFinalHp)
  const bNewHp = Math.max(battle.bAlive ? 1 : 0, battle.bFinalHp)

  const aProgress = newLevel(attacker.level, attacker.xp, aXpGain)
  const bProgress = newLevel(defender.level, defender.xp, bXpGain)

  // Update max_hp on level-up (effective max including gear)
  const aLevelsGained = aProgress.level - attacker.level
  const bLevelsGained = bProgress.level - defender.level
  const aNewMaxHp = aLevelsGained > 0 ? maxHp(fighterA.stats.constitution) : attacker.max_hp
  const bNewMaxHp = bLevelsGained > 0 ? maxHp(fighterB.stats.constitution) : defender.max_hp

  // Bones transfer: winner gets some of loser's bones
  const bonesBet = Math.floor(Math.min(attacker.bones, defender.bones) * 0.1)
  const aNewBones = aWon ? attacker.bones + bonesBet : Math.max(0, attacker.bones - bonesBet)
  const bNewBones = bWon ? defender.bones + bonesBet : Math.max(0, defender.bones - bonesBet)

  const now = new Date().toISOString()

  await supabaseAdmin.from('characters').update({
    hp: Math.min(aNewHp, aNewMaxHp), max_hp: aNewMaxHp,
    alive: battle.aAlive, xp: aProgress.xp, level: aProgress.level,
    bones: aNewBones, wins: aWon ? attacker.wins + 1 : attacker.wins,
    losses: !aWon ? attacker.losses + 1 : attacker.losses,
    kills: !battle.bAlive ? attacker.kills + 1 : attacker.kills,
    last_regen_at: now,
    stat_points: (attacker.stat_points || 0) + Math.max(0, aLevelsGained) * 2,
  }).eq('id', attacker.id)

  await supabase.from('characters').update({
    hp: Math.min(bNewHp, bNewMaxHp), max_hp: bNewMaxHp,
    alive: battle.bAlive, xp: bProgress.xp, level: bProgress.level,
    bones: bNewBones, wins: bWon ? defender.wins + 1 : defender.wins,
    losses: !bWon ? defender.losses + 1 : defender.losses,
    kills: !battle.aAlive ? defender.kills + 1 : defender.kills,
    last_regen_at: now,
    stat_points: (defender.stat_points || 0) + Math.max(0, bLevelsGained) * 2,
  }).eq('id', defender.id)

  // Close challenge
  await supabase.from('challenges').update({ status: 'completed' }).eq('id', challengeId)

  // Save battle log with full result snapshot for replay
  const battleResult = {
    winner: battle.winner,
    a: {
      hpBefore: attacker.hp,
      hpAfter: Math.min(aNewHp, aNewMaxHp),
      maxHp: aMaxHp,
      xpBefore: attacker.xp,
      xpAfter: aProgress.xp,
      xpGained: aXpGain,
      bonesBefore: attacker.bones,
      bonesAfter: aNewBones,
      bonesDelta: aNewBones - attacker.bones,
      leveledUp: aProgress.level > attacker.level,
      survived: battle.aAlive,
    },
    b: {
      hpBefore: defender.hp,
      hpAfter: Math.min(bNewHp, bNewMaxHp),
      maxHp: bMaxHp,
      xpBefore: defender.xp,
      xpAfter: bProgress.xp,
      xpGained: bXpGain,
      bonesBefore: defender.bones,
      bonesAfter: bNewBones,
      bonesDelta: bNewBones - defender.bones,
      leveledUp: bProgress.level > defender.level,
      survived: battle.bAlive,
    },
  }

  await supabase.from('battles').insert({
    challenger_id: attacker.id,
    challenged_id: defender.id,
    winner_id: battle.winner === 'a' ? attacker.id : battle.winner === 'b' ? defender.id : null,
    events: battle.events,
    challenger_survived: battle.aAlive,
    challenged_survived: battle.bAlive,
    battle_result: battleResult,
    challenger_seen: false,  // challenger needs to watch the replay
    challenged_seen: true,   // defender is watching it live right now
  })

  return NextResponse.json({
    events: battle.events,
    result: {
      winner: battle.winner,
      xpGained: bXpGain,
      bonesGained: bWon ? bonesBet : -bonesBet,
      leveledUp: bProgress.level > defender.level,
      defenderAlive: battle.bAlive,
      attackerAlive: battle.aAlive,
      newHp: bNewHp,
    },
  })
}
