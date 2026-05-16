import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const RETURN_RATE = 1.2

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones')
    .eq('user_id', user.id)
    .single()
  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const { data: investment } = await supabase
    .from('investments')
    .select('*')
    .eq('character_id', character.id)
    .eq('collected', false)
    .single()

  if (!investment) return NextResponse.json({ error: 'No active investment found.' }, { status: 400 })
  if (new Date(investment.matures_at) > new Date()) {
    return NextResponse.json({ error: 'Investment has not matured yet.' }, { status: 400 })
  }

  const returns = Math.floor(investment.amount * RETURN_RATE)

  await supabase.from('investments').update({ collected: true }).eq('id', investment.id)
  await supabase.from('characters').update({ bones: character.bones + returns }).eq('id', character.id)

  return NextResponse.json({ ok: true, returns, profit: returns - investment.amount, newBones: character.bones + returns })
}
