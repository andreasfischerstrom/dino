import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { GEAR, GearTemplate, xpForLevel, maxHp, getDenPerks } from '@/lib/game-data'
import { simulateBattle, Fighter } from '@/lib/battle-engine'
import { applyGearAndBuffs } from '@/lib/stats'

const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HP_FLOOR = 0.30

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { minLevel, maxLevel, daring, surrenderAt } = await req.json()

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) return NextResponse.json({ error: 'No living character.' }, { status: 400 })

  const charLevel = character.level as number
  const hpPct = (character.hp as number) / (character.max_hp as number)
  if (hpPct < HP_FLOOR) {
    return NextResponse.json({ error: `Too wounded to queue. Heal to at least ${Math.ceil(HP_FLOOR * 100)}% HP first.` }, { status: 400 })
  }

  // Validate range bounds
  if (minLevel < charLevel - 5) {
    return NextResponse.json({ error: 'Cannot queue more than 5 levels below your own.' }, { status: 400 })
  }
  const clampedMinLevel = Math.max(1, minLevel)

  const resolvedMaxLevel = maxLevel === null ? 999 : Math.max(charLevel, maxLevel)

  // Purge expired entries
  await supabaseAdmin.from('matchmaking_queue').delete().lt('expires_at', new Date().toISOString())

  // Find the oldest matching queue entry (mutual range check)
  const { data: candidates } = await supabaseAdmin
    .from('matchmaking_queue')
    .select('*')
    .neq('character_id', character.id)
    .lte('min_level', charLevel)
    .gte('max_level', charLevel)
    .gte('character_level', clampedMinLevel)
    .lte('character_level', resolvedMaxLevel)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(10)

  const matchEntry = candidates?.[0] ?? null

  if (matchEntry) {
    // Fetch both characters fresh for live HP
    const { data: queuedChar } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('id', matchEntry.character_id)
      .single()

    if (!queuedChar?.alive) {
      // Matched character died — remove their entry and queue ourselves
      await supabaseAdmin.from('matchmaking_queue').delete().eq('id', matchEntry.id)
    } else {
      // Run the battle — queued player is A (was waiting), joiner is B
      async function getGear(characterId: string) {
        const { data: inv } = await supabaseAdmin
          .from('inventory')
          .select('gear_id')
          .eq('character_id', characterId)
          .eq('equipped', true)
        return ((inv || []) as { gear_id: string }[])
          .map(i => GEAR.find(g => g.id === i.gear_id))
          .filter(Boolean) as GearTemplate[]
      }

      const [aGear, bGear] = await Promise.all([getGear(queuedChar.id), getGear(character.id)])

      const aDenPerks = (queuedChar.den_town && queuedChar.den_tier)
        ? getDenPerks(queuedChar.den_town as number, queuedChar.den_tier as number) : {}
      const bDenPerks = (character.den_town && character.den_tier)
        ? getDenPerks(character.den_town as number, character.den_tier as number) : {}

      const aStats = applyGearAndBuffs(queuedChar.stats, aGear, queuedChar.buffs || [])
      const bStats = applyGearAndBuffs(character.stats, bGear, character.buffs || [])

      if (aDenPerks.ferocityBonus) aStats.strength = (aStats.strength || 0) + aDenPerks.ferocityBonus
      if (bDenPerks.ferocityBonus) bStats.strength = (bStats.strength || 0) + bDenPerks.ferocityBonus

      const aHomeBonus = (queuedChar.den_town && queuedChar.den_town === queuedChar.current_town)
        ? (aDenPerks.homeHpBonus ?? 0) : 0
      const bHomeBonus = (character.den_town && character.den_town === character.current_town)
        ? (bDenPerks.homeHpBonus ?? 0) : 0

      const fighterA: Fighter = {
        id: queuedChar.id, name: queuedChar.name, species: queuedChar.species,
        stats: aStats, daring: matchEntry.daring, surrenderAt: matchEntry.surrender_at,
        initialHp: Math.min(queuedChar.max_hp, queuedChar.hp + aHomeBonus),
      }
      const fighterB: Fighter = {
        id: character.id, name: character.name, species: character.species,
        stats: bStats, daring, surrenderAt,
        initialHp: Math.min(character.max_hp, character.hp + bHomeBonus),
      }

      // Consume buffs
      await Promise.all([
        supabaseAdmin.from('characters').update({ buffs: [] }).eq('id', queuedChar.id),
        supabaseAdmin.from('characters').update({ buffs: [] }).eq('id', character.id),
      ])

      const battle = simulateBattle(fighterA, fighterB)

      const aWon = battle.winner === 'a'
      const bWon = battle.winner === 'b'

      const aLevelAdv = (character.level as number) - (queuedChar.level as number)
      const bLevelAdv = (queuedChar.level as number) - (character.level as number)
      const aXpMult = Math.max(0.15, Math.min(3.0, 1 + aLevelAdv * 0.15))
      const bXpMult = Math.max(0.15, Math.min(3.0, 1 + bLevelAdv * 0.15))
      const aXpGap = xpForLevel(queuedChar.level + 1) - xpForLevel(queuedChar.level)
      const bXpGap = xpForLevel(character.level + 1) - xpForLevel(character.level)
      const aBase = Math.max(80, Math.round(aXpGap / 4))
      const bBase = Math.max(80, Math.round(bXpGap / 4))
      const aXpGain = aWon ? Math.max(50, Math.round(aBase * aXpMult)) : Math.max(10, Math.floor(aBase * aXpMult * 0.10))
      const bXpGain = bWon ? Math.max(50, Math.round(bBase * bXpMult)) : Math.max(10, Math.floor(bBase * bXpMult * 0.10))

      function newLevel(currentLevel: number, currentXp: number, xpGain: number) {
        const total = currentXp + xpGain
        let l = currentLevel
        while (xpForLevel(l + 1) <= total) l++
        return { level: l, xp: total }
      }

      const aNewHp = Math.max(battle.aAlive ? 1 : 0, battle.aFinalHp)
      const bNewHp = Math.max(battle.bAlive ? 1 : 0, battle.bFinalHp)
      const aProgress = newLevel(queuedChar.level, queuedChar.xp, aXpGain)
      const bProgress = newLevel(character.level, character.xp, bXpGain)
      const aLevelsGained = aProgress.level - queuedChar.level
      const bLevelsGained = bProgress.level - character.level
      const aNewMaxHp = aLevelsGained > 0 ? maxHp(aStats.constitution) : queuedChar.max_hp
      const bNewMaxHp = bLevelsGained > 0 ? maxHp(bStats.constitution) : character.max_hp
      const bonesBet = Math.floor(Math.min(queuedChar.bones, character.bones) * 0.1)
      const aNewBones = aWon ? queuedChar.bones + bonesBet : Math.max(0, queuedChar.bones - bonesBet)
      const bNewBones = bWon ? character.bones + bonesBet : Math.max(0, character.bones - bonesBet)
      const now = new Date().toISOString()

      await Promise.all([
        supabaseAdmin.from('characters').update({
          hp: Math.min(aNewHp, aNewMaxHp), max_hp: aNewMaxHp,
          alive: battle.aAlive, xp: aProgress.xp, level: aProgress.level,
          bones: aNewBones, wins: aWon ? queuedChar.wins + 1 : queuedChar.wins,
          losses: !aWon ? queuedChar.losses + 1 : queuedChar.losses,
          kills: !battle.bAlive ? queuedChar.kills + 1 : queuedChar.kills,
          last_regen_at: now,
          stat_points: (queuedChar.stat_points || 0) + Math.max(0, aLevelsGained) * 2,
        }).eq('id', queuedChar.id),
        supabaseAdmin.from('characters').update({
          hp: Math.min(bNewHp, bNewMaxHp), max_hp: bNewMaxHp,
          alive: battle.bAlive, xp: bProgress.xp, level: bProgress.level,
          bones: bNewBones, wins: bWon ? character.wins + 1 : character.wins,
          losses: !bWon ? character.losses + 1 : character.losses,
          kills: !battle.aAlive ? character.kills + 1 : character.kills,
          last_regen_at: now,
          stat_points: (character.stat_points || 0) + Math.max(0, bLevelsGained) * 2,
        }).eq('id', character.id),
        supabaseAdmin.from('matchmaking_queue').delete().eq('id', matchEntry.id),
      ])

      await supabaseAdmin.from('battles').insert({
        challenger_id: queuedChar.id,
        challenged_id: character.id,
        winner_id: battle.winner === 'a' ? queuedChar.id : battle.winner === 'b' ? character.id : null,
        events: battle.events,
        challenger_survived: battle.aAlive,
        challenged_survived: battle.bAlive,
        battle_result: {
          winner: battle.winner,
          matchmaking: true,
          a: {
            hpBefore: queuedChar.hp, hpAfter: Math.min(aNewHp, aNewMaxHp), maxHp: maxHp(aStats.constitution),
            xpBefore: queuedChar.xp, xpAfter: aProgress.xp, xpGained: aXpGain,
            bonesBefore: queuedChar.bones, bonesAfter: aNewBones, bonesDelta: aNewBones - queuedChar.bones,
            leveledUp: aProgress.level > queuedChar.level, survived: battle.aAlive,
          },
          b: {
            hpBefore: character.hp, hpAfter: Math.min(bNewHp, bNewMaxHp), maxHp: maxHp(bStats.constitution),
            xpBefore: character.xp, xpAfter: bProgress.xp, xpGained: bXpGain,
            bonesBefore: character.bones, bonesAfter: bNewBones, bonesDelta: bNewBones - character.bones,
            leveledUp: bProgress.level > character.level, survived: battle.bAlive,
          },
        },
        challenger_seen: false,
        challenged_seen: false,
      })

      return NextResponse.json({ matched: true })
    }
  }

  // No match — insert/update queue entry
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const { error: upsertError } = await supabaseAdmin.from('matchmaking_queue').upsert({
    character_id: character.id,
    character_level: charLevel,
    min_level: clampedMinLevel,
    max_level: resolvedMaxLevel,
    daring,
    surrender_at: surrenderAt,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  }, { onConflict: 'character_id' })

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  return NextResponse.json({ matched: false, queued: true })
}
