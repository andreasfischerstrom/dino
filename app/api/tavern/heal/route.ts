import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, hp, max_hp, bones')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const hpMissing = character.max_hp - character.hp
  if (hpMissing <= 0) return NextResponse.json({ error: 'Already at full HP' }, { status: 400 })

  const cost = hpMissing * 2
  if (character.bones < cost) return NextResponse.json({ error: 'Not enough bones' }, { status: 400 })

  await supabase.from('characters').update({
    hp: character.max_hp,
    bones: character.bones - cost,
  }).eq('id', character.id)

  return NextResponse.json({ newBones: character.bones - cost })
}
