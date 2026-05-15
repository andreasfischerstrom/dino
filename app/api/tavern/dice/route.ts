import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_BET = 300
const BASE_CATCH_CHANCE = 0.45
const CUNNING_REDUCTION_PER_POINT = 0.04

function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bet, cheat } = await req.json()

  if (!Number.isInteger(bet) || bet < 1 || bet > MAX_BET) {
    return NextResponse.json({ error: `Bet must be between 1 and ${MAX_BET} bones.` }, { status: 400 })
  }

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones, hp, max_hp, stats')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })
  if (character.bones < bet) return NextResponse.json({ error: "You don't have enough bones." }, { status: 400 })

  const cunning = (character.stats as Record<string, number>).cunning || 0
  const playerDice = rollDice(3)
  const houseDice = rollDice(3)
  const playerTotal = playerDice.reduce((s, d) => s + d, 0)
  const houseTotal = houseDice.reduce((s, d) => s + d, 0)
  const playerWinsRoll = playerTotal > houseTotal

  let caught = false
  let boneDelta = 0
  let hpDelta = 0
  let outcome: 'win' | 'loss' | 'cheat_win' | 'cheat_caught' | 'draw'

  if (playerTotal === houseTotal) {
    outcome = 'draw'
    boneDelta = 0
  } else if (cheat) {
    const catchChance = Math.max(0.05, BASE_CATCH_CHANCE - cunning * CUNNING_REDUCTION_PER_POINT)
    caught = Math.random() < catchChance
    if (caught) {
      const penalty = Math.ceil(bet * 1.2)
      boneDelta = -penalty
      hpDelta = -Math.floor(character.max_hp * 0.30)
      outcome = 'cheat_caught'
    } else {
      boneDelta = bet * 2  // 3x total = bet back + 2x profit
      outcome = 'cheat_win'
    }
  } else if (playerWinsRoll) {
    boneDelta = bet
    outcome = 'win'
  } else {
    boneDelta = -bet
    outcome = 'loss'
  }

  const newBones = Math.max(0, character.bones + boneDelta)
  const newHp = Math.max(1, character.hp + hpDelta)

  const update: Record<string, number> = { bones: newBones }
  if (hpDelta < 0) update.hp = newHp

  await supabase.from('characters').update(update).eq('id', character.id)

  return NextResponse.json({
    playerDice,
    houseDice,
    playerTotal,
    houseTotal,
    outcome,
    boneDelta,
    newBones,
    newHp: hpDelta < 0 ? newHp : undefined,
    catchChance: cheat ? Math.max(0.05, BASE_CATCH_CHANCE - cunning * CUNNING_REDUCTION_PER_POINT) : undefined,
  })
}
