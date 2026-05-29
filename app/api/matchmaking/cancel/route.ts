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

  if (!character) return NextResponse.json({ error: 'No character.' }, { status: 400 })

  await supabase.from('matchmaking_queue').delete().eq('character_id', character.id)

  return NextResponse.json({ ok: true })
}
