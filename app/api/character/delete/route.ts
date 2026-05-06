import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character found' }, { status: 400 })

  await supabase.from('inventory').delete().eq('character_id', character.id)
  await supabase.from('loot_items').delete().eq('character_id', character.id)
  await supabase.from('challenges').delete().or(`challenger_id.eq.${character.id},challenged_id.eq.${character.id}`)
  await supabase.from('characters').delete().eq('id', character.id)

  return NextResponse.json({ ok: true })
}
