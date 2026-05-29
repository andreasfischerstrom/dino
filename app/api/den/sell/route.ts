import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDenSellValue } from '@/lib/game-data'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones, den_town, den_tier, alive')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) return NextResponse.json({ error: 'No living character.' }, { status: 400 })

  const denTown = character.den_town as number | null
  const denTier = character.den_tier as number | null

  if (!denTown || !denTier) return NextResponse.json({ error: 'You don\'t own a Den.' }, { status: 400 })

  const refund = getDenSellValue(denTown, denTier)

  await supabase.from('characters').update({
    bones: character.bones + refund,
    den_town: null,
    den_tier: null,
  }).eq('id', character.id)

  return NextResponse.json({ ok: true, refund, newBones: character.bones + refund })
}
