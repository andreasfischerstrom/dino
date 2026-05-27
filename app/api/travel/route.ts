import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TOWNS } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { townId } = await req.json()
  if (typeof townId !== 'number') return NextResponse.json({ error: 'Invalid town' }, { status: 400 })

  const town = TOWNS.find(t => t.id === townId)
  if (!town) return NextResponse.json({ error: 'Unknown town' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, level, current_town, alive')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })
  if (!character.alive) return NextResponse.json({ error: 'Dead characters cannot travel' }, { status: 400 })
  if (character.level < town.levelReq) {
    return NextResponse.json({ error: `Requires level ${town.levelReq}` }, { status: 403 })
  }
  if (character.current_town === townId) {
    return NextResponse.json({ error: 'Already here' }, { status: 400 })
  }

  await supabase
    .from('characters')
    .update({ current_town: townId })
    .eq('id', character.id)

  return NextResponse.json({ townId, townName: town.name })
}
