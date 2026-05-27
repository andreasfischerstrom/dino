import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GEAR, GearTemplate, xpForLevel, maxHp } from '@/lib/game-data'
import { simulateBattle, Fighter } from '@/lib/battle-engine'
import { applyGearAndBuffs } from '@/lib/stats'
import { generateDailyBoss, todayUTC, alreadyFoughtToday } from '@/lib/daily-boss'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) return NextResponse.json({ error: 'Dead characters cannot enter the Trial.' }, { status: 400 })
  if (alreadyFoughtToday(character.last_daily_at)) {
    return NextResponse.json({ error: 'You have already fought the Daily Trial today. Come back tomorrow.' }, { status: 400 })
  }

  const { data: inv } = await supabase
    .from('inventory')
    .select('gear_id')
    .eq('character_id', character.id)
    .eq('equipped', true)

  const playerGear: GearTemplate[] = ((inv || []) as { gear_id: string }[])
    .map(i => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as GearTemplate[]

  const today = todayUTC()
  const boss = generateDailyBoss(today, character.level)

  const fighterA: Fighter = {
    id: character.id,
    name: character.name,
    species: character.species,
    stats: applyGearAndBuffs(character.stats, playerGear, character.buffs || []),
    daring: 'bold',
    surrenderAt: 0,
    initialHp: character.hp,
  }

  const fighterB: Fighter = {
    id: 'daily-boss',
    name: boss.fullName,
    species: boss.species,
    stats: boss.stats,
    daring: 'bold',
    surrenderAt: 0,
    isMob: true,
  }

  // Consume player buffs
  await supabase.from('characters').update({ buffs: [] }).eq('id', character.id)

  const battle = simulateBattle(fighterA, fighterB)
  const won = battle.winner === 'a'

  // XP: large win reward, tiny consolation on loss
  const baseXp = character.level * 180 + 600
  const xpGained = won ? baseXp : Math.floor(baseXp * 0.10)

  // Bones: scales with HP remaining — clean win pays more
  const playerMaxHp = maxHp(fighterA.stats.constitution)
  const hpRemainingPct = battle.aFinalHp / playerMaxHp
  const baseBonesReward = character.level * 40 + 100
  const bonesGained = won
    ? Math.floor(baseBonesReward * (1 + hpRemainingPct * 0.5))
    : 0

  // HP damage carries over
  const hpLost = Math.max(0, playerMaxHp - battle.aFinalHp)
  const newHp = Math.max(battle.aAlive ? 1 : 0, character.hp - hpLost)

  function levelUp(currentLevel: number, currentXp: number, xpGain: number) {
    const total = currentXp + xpGain
    let l = currentLevel
    while (xpForLevel(l + 1) <= total) l++
    return { level: l, xp: total }
  }

  const progress = levelUp(character.level, character.xp, xpGained)
  const levelsGained = progress.level - character.level
  const newMaxHp = levelsGained > 0 ? maxHp(fighterA.stats.constitution) : character.max_hp
  const now = new Date().toISOString()

  await supabase.from('characters').update({
    hp: Math.min(newHp, newMaxHp),
    max_hp: newMaxHp,
    alive: battle.aAlive,
    xp: progress.xp,
    level: progress.level,
    bones: Math.max(0, character.bones + bonesGained),
    wins: won ? character.wins + 1 : character.wins,
    losses: !won ? character.losses + 1 : character.losses,
    last_regen_at: now,
    last_daily_at: now,
    stat_points: (character.stat_points || 0) + Math.max(0, levelsGained) * 2,
  }).eq('id', character.id)

  return NextResponse.json({
    events: battle.events,
    result: {
      winner: battle.winner,
      won,
      xpGained,
      bonesGained,
      leveledUp: progress.level > character.level,
      playerAlive: battle.aAlive,
      newHp,
    },
    boss: { name: boss.fullName, speciesEmoji: boss.speciesEmoji, speciesName: boss.speciesName },
  })
}
