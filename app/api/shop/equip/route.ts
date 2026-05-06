import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GEAR } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gearId, equip } = await req.json()
  const item = GEAR.find(g => g.id === gearId)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  if (equip) {
    // Unequip same slot first
    const sameSlotIds = GEAR.filter(g => g.slot === item.slot).map(g => g.id)
    await supabase.from('inventory')
      .update({ equipped: false })
      .eq('character_id', character.id)
      .in('gear_id', sameSlotIds)
  }

  await supabase.from('inventory')
    .update({ equipped: equip })
    .eq('character_id', character.id)
    .eq('gear_id', gearId)

  return NextResponse.json({ ok: true })
}
