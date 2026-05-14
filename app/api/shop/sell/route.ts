import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GEAR } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gearId } = await req.json()
  const item = GEAR.find(g => g.id === gearId)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const { data: owned } = await supabase
    .from('inventory')
    .select('id')
    .eq('character_id', character.id)
    .eq('gear_id', gearId)
    .single()

  if (!owned) return NextResponse.json({ error: 'You don\'t own this item' }, { status: 400 })

  const sellPrice = Math.max(1, Math.floor(item.price * 0.25))

  await supabase.from('inventory').delete().eq('id', owned.id)
  await supabase.from('characters').update({ bones: character.bones + sellPrice }).eq('id', character.id)

  return NextResponse.json({ ok: true, sellPrice })
}
