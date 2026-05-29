import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MOBS, GEAR, GearTemplate, StatKey, xpForLevel, maxHp, getDenPerks } from '@/lib/game-data'
import { simulateBattle, Fighter } from '@/lib/battle-engine'
import { applyGearAndBuffs } from '@/lib/stats'

function computeLevel(xp: number) {
  let l = 1
  while (xpForLevel(l + 1) <= xp) l++
  return l
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    mobId,
    daring = 'measured',
    surrenderAt = 20,
    // Recompute fields (present when player changed daring mid-battle)
    hpA: clientHpA,
    hpB: clientHpB,
    fromRound,
    originalXp,
    originalBones,
    originalLevel,
    originalStatPoints,
    previousWon,
  } = await req.json()

  const isRecompute = fromRound !== undefined

  const mob = MOBS.find(m => m.id === mobId)
  if (!mob) return NextResponse.json({ error: 'Unknown mob' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character found' }, { status: 400 })
  if (!character.alive) return NextResponse.json({ error: 'Your character is dead. This is permanent.' }, { status: 400 })

  const currentTown = (character.current_town as number) ?? 1
  if ((mob.town ?? 1) !== currentTown) return NextResponse.json({ error: 'That creature is not in your town' }, { status: 400 })

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id')
    .eq('character_id', character.id)
    .eq('equipped', true)

  const equippedGear: GearTemplate[] = (inventory || [])
    .map((i: { gear_id: string }) => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as GearTemplate[]

  // On initial call: apply buffs. On recompute: buffs already consumed.
  const buffs = isRecompute ? [] : (character.buffs || [])
  const charStats = applyGearAndBuffs(character.stats as Record<StatKey, number>, equippedGear, buffs)

  if (!isRecompute) {
    await supabase.from('characters').update({ buffs: [] }).eq('id', character.id)
  }

  const fighterA: Fighter = {
    id: character.id,
    name: character.name,
    species: character.species,
    stats: charStats,
    daring,
    surrenderAt,
    initialHp: isRecompute ? clientHpA : character.hp,
    isMob: false,
  }

  const fighterB: Fighter = {
    id: mob.id,
    name: mob.name,
    species: mob.id,
    stats: mob.stats,
    daring: 'measured',
    surrenderAt: 0,
    initialHp: isRecompute ? clientHpB : undefined,
    isMob: true,
  }

  const battle = simulateBattle(fighterA, fighterB, isRecompute ? { startRound: fromRound, skipIntro: true } : {})

  const won = battle.winner === 'a'
  const denPerks = (character.den_town && character.den_tier)
    ? getDenPerks(character.den_town as number, character.den_tier as number)
    : {}
  const baseXp = won ? mob.xpReward : Math.floor(mob.xpReward * 0.10)
  const baseBones = won
    ? Math.floor(Math.random() * (mob.bonesReward[1] - mob.bonesReward[0] + 1) + mob.bonesReward[0])
    : Math.floor(mob.bonesReward[0] * 0.2)
  const xpGained = Math.round(baseXp * (denPerks.xpMult ?? 1))
  const bonesGained = Math.round(baseBones * (denPerks.bonesMult ?? 1))

  const characterDied = !battle.aAlive
  const newHp = characterDied ? 0 : Math.max(1, battle.aFinalHp)

  if (isRecompute) {
    // Recompute: apply results relative to original pre-fight state
    const newXp = (originalXp ?? 0) + xpGained
    const newLevel = computeLevel(newXp)
    const levelsGained = newLevel - (originalLevel ?? character.level)
    const newMaxHp = newLevel > (originalLevel ?? character.level) ? maxHp(charStats.constitution) : character.max_hp
    const newStatPoints = (originalStatPoints ?? character.stat_points ?? 0) + Math.max(0, levelsGained) * 2

    // Reverse previous win/loss, apply new
    const baseWins = character.wins - (previousWon ? 1 : 0)
    const baseLosses = character.losses - (previousWon ? 0 : 1)

    await supabase.from('characters').update({
      xp: newXp,
      level: newLevel,
      bones: (originalBones ?? 0) + bonesGained,
      hp: newHp,
      max_hp: newMaxHp,
      alive: !characterDied,
      wins: baseWins + (won ? 1 : 0),
      losses: baseLosses + (won ? 0 : 1),
      last_regen_at: new Date().toISOString(),
      stat_points: newStatPoints,
    }).eq('id', character.id)

    return NextResponse.json({
      events: battle.events,
      result: {
        winner: battle.winner,
        xpGained,
        bonesGained,
        leveledUp: levelsGained > 0,
        newHp,
        newLevel,
      },
    })
  }

  // Initial call: apply results as before
  const newXp = (character.xp || 0) + xpGained
  const newLevel = computeLevel(newXp)
  const leveledUp = newLevel > character.level
  const levelsGained = newLevel - character.level
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
    stat_points: (character.stat_points || 0) + levelsGained * 2,
  }).eq('id', character.id)

  // Save to battle history (not for recomputes — already saved on initial call)
  const battleResult = {
    opponentType: 'mob' as const,
    opponentName: mob.name,
    winner: battle.winner,
    a: {
      hpBefore: character.hp,
      hpAfter: newHp,
      maxHp: maxHp(charStats.constitution),
      xpGained,
      bonesDelta: bonesGained,
      leveledUp,
      survived: !characterDied,
    },
  }
  await supabase.from('battles').insert({
    challenger_id: character.id,
    challenged_id: null,
    winner_id: won ? character.id : null,
    events: battle.events,
    challenger_survived: !characterDied,
    challenged_survived: true,
    battle_result: battleResult,
    challenger_seen: true,
    challenged_seen: true,
  })

  return NextResponse.json({
    events: battle.events,
    result: {
      winner: battle.winner,
      xpGained,
      bonesGained,
      leveledUp,
      newHp,
      newLevel,
      won,
    },
  })
}
