import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount } = await req.json()

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones')
    .eq('user_id', user.id)
    .single()
  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  if (!Number.isInteger(amount) || amount < 10) {
    return NextResponse.json({ error: 'Minimum deposit is 10 bones.' }, { status: 400 })
  }
  if (amount > character.bones) {
    return NextResponse.json({ error: "You don't have that many bones." }, { status: 400 })
  }

  // Check for existing active investment
  const { data: existing } = await supabase
    .from('investments')
    .select('id')
    .eq('character_id', character.id)
    .eq('collected', false)
    .single()
  if (existing) return NextResponse.json({ error: 'You already have an active investment. Wait for it to mature.' }, { status: 400 })

  const now = new Date()
  const matures_at = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  await supabase.from('investments').insert({
    character_id: character.id,
    amount,
    deposited_at: now.toISOString(),
    matures_at: matures_at.toISOString(),
    collected: false,
  })

  await supabase.from('characters')
    .update({ bones: character.bones - amount })
    .eq('id', character.id)

  return NextResponse.json({ ok: true, newBones: character.bones - amount, maturesAt: matures_at.toISOString() })
}
