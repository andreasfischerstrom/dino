import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengedId, daring, surrenderAt } = await req.json()

  const { data: character } = await supabase
    .from('characters')
    .select('id, alive')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) return NextResponse.json({ error: 'Dead dinos cannot challenge anyone.' }, { status: 400 })
  if (character.id === challengedId) return NextResponse.json({ error: 'You cannot challenge yourself. Tempting, but no.' }, { status: 400 })

  // Check for existing pending challenge between these two
  const { data: existing } = await supabase
    .from('challenges')
    .select('id')
    .eq('challenger_id', character.id)
    .eq('challenged_id', challengedId)
    .eq('status', 'pending')
    .single()

  if (existing) return NextResponse.json({ error: 'You already have a pending challenge against this fighter.' }, { status: 400 })

  const { error } = await supabase.from('challenges').insert({
    challenger_id: character.id,
    challenged_id: challengedId,
    challenger_daring: daring,
    challenger_surrender_at: surrenderAt,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
