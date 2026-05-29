import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TOWNS, getDenBuyCost, getDenUpgradeCost } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { upgrade } = await req.json()

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones, current_town, den_town, den_tier, alive')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) return NextResponse.json({ error: 'No living character.' }, { status: 400 })

  const currentTown = character.current_town as number ?? 1
  const denTown = character.den_town as number | null
  const denTier = character.den_tier as number | null

  if (upgrade) {
    // Upgrading existing den
    if (!denTown || !denTier) return NextResponse.json({ error: 'You don\'t own a Den.' }, { status: 400 })
    if (denTier >= 3) return NextResponse.json({ error: 'Already at max tier.' }, { status: 400 })
    const cost = getDenUpgradeCost(denTown, denTier)
    if (!cost) return NextResponse.json({ error: 'Cannot upgrade.' }, { status: 400 })
    if (character.bones < cost) return NextResponse.json({ error: `Not enough bones. Need ${cost.toLocaleString()}.` }, { status: 400 })
    await supabase.from('characters').update({
      bones: character.bones - cost,
      den_tier: denTier + 1,
    }).eq('id', character.id)
    return NextResponse.json({ ok: true, newTier: denTier + 1, newBones: character.bones - cost })
  }

  // Buying a new den
  if (denTown) return NextResponse.json({ error: 'Sell your current Den first.' }, { status: 400 })
  if (!TOWNS.find(t => t.id === currentTown)) return NextResponse.json({ error: 'Invalid town.' }, { status: 400 })
  const cost = getDenBuyCost(currentTown)
  if (character.bones < cost) return NextResponse.json({ error: `Not enough bones. Need ${cost.toLocaleString()}.` }, { status: 400 })

  await supabase.from('characters').update({
    bones: character.bones - cost,
    den_town: currentTown,
    den_tier: 1,
  }).eq('id', character.id)

  return NextResponse.json({ ok: true, newTier: 1, newBones: character.bones - cost })
}
