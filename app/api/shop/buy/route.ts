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
    .select('id, bones, level')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })
  if (character.level < item.levelReq) return NextResponse.json({ error: `Requires level ${item.levelReq}` }, { status: 400 })
  if (character.bones < item.price) return NextResponse.json({ error: 'Not enough bones' }, { status: 400 })

  const { data: existing } = await supabase
    .from('inventory')
    .select('id')
    .eq('character_id', character.id)
    .eq('gear_id', gearId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already owned' }, { status: 400 })

  await supabase.from('inventory').insert({ character_id: character.id, gear_id: gearId, equipped: false })
  await supabase.from('characters').update({ bones: character.bones - item.price }).eq('id', character.id)

  return NextResponse.json({ ok: true })
}
