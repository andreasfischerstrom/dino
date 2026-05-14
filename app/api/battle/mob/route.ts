import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MOBS, GEAR, GearTemplate, StatKey, xpForLevel, maxHp } from '@/lib/game-data'
import { simulateBattle, Fighter } from '@/lib/battle-engine'
import { applyGearAndBuffs } from '@/lib/stats'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mobId, daring = 'measured', surrenderAt = 20 } = await req.json()
  const mob = MOBS.find(m => m.id === mobId)
  if (!mob) return NextResponse.json({ error: 'Unknown mob' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character found' }, { status: 400 })
  if (!character.alive) return NextResponse.json({ error: 'Your character is dead. This is permanent.' }, { status: 400 })

  // Get equipped gear
  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id')
    .eq('character_id', character.id)
    .eq('equipped', true)

  const equippedGear: GearTemplate[] = (inventory || [])
    .map((i: { gear_id: string }) => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as GearTemplate[]

  const buffs = character.buffs || []
  const charStats = applyGearAndBuffs(character.stats as Record<StatKey, number>, equippedGear, buffs)

  // Consume buffs after fight
  await supabase.from('characters').update({ buffs: [] }).eq('id', character.id)

  const fighterA: Fighter = {
    id: character.id,
    name: character.name,
    species: character.species,
    stats: charStats,
    daring,
    surrenderAt,
    initialHp: character.hp,
    isMob: false,
  }

  const fighterB: Fighter = {
    id: mob.id,
    name: mob.name,
    species: mob.id,
    stats: mob.stats,
    daring: 'measured',
    surrenderAt: 0,
    isMob: true,
  }

  const battle = simulateBattle(fighterA, fighterB)

  // Apply results
  const won = battle.winner === 'a'
  const xpGained = won ? mob.xpReward : Math.floor(mob.xpReward * 0.3)
  const bonesGained = won
    ? Math.floor(Math.random() * (mob.bonesReward[1] - mob.bonesReward[0] + 1) + mob.bonesReward[0])
    : Math.floor(mob.bonesReward[0] * 0.2)

  const newXp = (character.xp || 0) + xpGained
  const newLevel = (() => { let l = character.level; while (xpForLevel(l + 1) <= newXp) l++; return l })()
  const leveledUp = newLevel > character.level
  const levelsGained = newLevel - character.level

  const characterDied = !battle.aAlive
  const newHp = characterDied ? 0 : Math.max(1, battle.aFinalHp)

  // Recalculate max_hp if leveled up (more points available conceptually, but stats unchanged)
  const newMaxHp = leveledUp ? maxHp(charStats.constitution) : character.max_hp

  await supabase.from('characters').update({
    xp: newXp,
    level: newLevel,
    bones: character.bones + bonesGained,
    hp: newHp,
    max_hp: newMaxHp,
    alive: !characterDied,
    wins: won ? character.wins + 1 : character.wins,
    losses: !won ? character.losses + 1 : character.losses,
    last_regen_at: new Date().toISOString(),
    stat_points: (character.stat_points || 0) + levelsGained,
  }).eq('id', character.id)

  return NextResponse.json({
    events: battle.events,
    result: {
      winner: battle.winner,
      xpGained,
      bonesGained,
      leveledUp,
      newHp,
      newLevel,
    },
  })
}
