import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { battleId } = await req.json()

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const { data: battle } = await supabase
    .from('battles')
    .select('id, challenger_id, challenged_id')
    .eq('id', battleId)
    .single()

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })

  if (battle.challenger_id === character.id) {
    await supabase.from('battles').update({ challenger_seen: true }).eq('id', battleId)
  } else if (battle.challenged_id === character.id) {
    await supabase.from('battles').update({ challenged_seen: true }).eq('id', battleId)
  } else {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
