import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TAVERN_QUESTS } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questId, accepted } = await req.json()
  const quest = TAVERN_QUESTS.find(q => q.id === questId)
  if (!quest) return NextResponse.json({ error: 'Unknown quest' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, hp, max_hp, bones, xp')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  if (!accepted) return NextResponse.json({ ok: true })

  const bonesDelta = quest.bonesDelta ?? 0
  const hpDelta = quest.hpDelta ?? 0
  const xpDelta = quest.xpDelta ?? 0

  const newBones = Math.max(0, character.bones + bonesDelta)
  const newHp = Math.min(character.max_hp, Math.max(1, character.hp + hpDelta))
  const newXp = character.xp + xpDelta

  await supabase.from('characters').update({
    bones: newBones,
    hp: newHp,
    xp: newXp,
  }).eq('id', character.id)

  return NextResponse.json({ newBones, newHp, newXp })
}
