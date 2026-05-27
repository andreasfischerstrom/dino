import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TAVERN_QUESTS } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questId, choiceIndex } = await req.json()
  if (typeof choiceIndex !== 'number') return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })

  const quest = TAVERN_QUESTS.find(q => q.id === questId)
  if (!quest) return NextResponse.json({ error: 'Unknown quest' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, hp, max_hp, bones, xp, stats, current_town')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const currentTown = (character.current_town as number) ?? 1
  if ((quest.town ?? 1) !== currentTown) {
    return NextResponse.json({ error: 'That quest is not available in your town' }, { status: 400 })
  }

  const choice = quest.choices[choiceIndex]
  if (!choice) return NextResponse.json({ error: 'Invalid choice index' }, { status: 400 })

  // Check if stat requirement is met — use the better outcome if so
  let outcome = choice.outcome
  if (choice.statCheck) {
    const charStats = (character.stats as Record<string, number>) || {}
    const statValue = charStats[choice.statCheck.stat] || 0
    if (statValue >= choice.statCheck.threshold) {
      outcome = choice.statCheck.outcome
    }
  }

  const bonesDelta = outcome.bonesDelta ?? 0
  const hpDelta = outcome.hpDelta ?? 0
  const xpDelta = outcome.xpDelta ?? 0

  const newBones = Math.max(0, character.bones + bonesDelta)
  const newHp = Math.min(character.max_hp, Math.max(1, character.hp + hpDelta))
  const newXp = character.xp + xpDelta

  await supabase.from('characters').update({
    bones: newBones,
    hp: newHp,
    xp: newXp,
  }).eq('id', character.id)

  return NextResponse.json({ outcomeText: outcome.text, newBones, newHp, newXp, bonesDelta, hpDelta, xpDelta })
}
