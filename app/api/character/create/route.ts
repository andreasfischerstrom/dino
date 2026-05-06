import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SPECIES, BASE_STATS, StatKey } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user already has a living character
  const { data: existing } = await supabase.from('characters').select('id, alive').eq('user_id', user.id).single()
  if (existing?.alive) return NextResponse.json({ error: 'You already have a character. One dinosaur per customer.' }, { status: 400 })
  // Delete the dead character to make room for the new one
  if (existing) await supabase.from('characters').delete().eq('id', existing.id)

  const formData = await req.formData()
  const name = (formData.get('name') as string)?.trim()
  const speciesId = formData.get('species') as string
  const statsRaw = formData.get('stats') as string
  const imageFile = formData.get('image') as File | null

  if (!name || !speciesId || !statsRaw) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const species = SPECIES.find(s => s.id === speciesId)
  if (!species) return NextResponse.json({ error: 'Invalid species' }, { status: 400 })

  const distributed: Record<StatKey, number> = JSON.parse(statsRaw)
  const totalDistributed = Object.values(distributed).reduce((a, b) => a + b, 0)
  if (totalDistributed > 12) return NextResponse.json({ error: 'Too many points distributed' }, { status: 400 })

  // Compute final stats
  const finalStats: Record<StatKey, number> = {} as Record<StatKey, number>
  const keys: StatKey[] = ['strength', 'agility', 'constitution', 'ferocity', 'hide', 'stamina', 'jaw', 'cunning', 'roar']
  for (const key of keys) {
    finalStats[key] = Math.max(1, BASE_STATS[key] + (species.baseStats[key] || 0) + (distributed[key] || 0))
  }

  // Upload profile image if provided
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 2MB)' }, { status: 400 })
    }
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `${user.id}/profile.${ext}`
    const arrayBuffer = await imageFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('character-images')
      .upload(path, arrayBuffer, { contentType: imageFile.type, upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('character-images').getPublicUrl(path)
      imageUrl = publicUrl
    }
  }

  const { data: character, error } = await supabase.from('characters').insert({
    user_id: user.id,
    name,
    species: speciesId,
    stats: finalStats,
    hp: 50 + finalStats.constitution * 10,
    max_hp: 50 + finalStats.constitution * 10,
    level: 1,
    xp: 0,
    bones: 100,
    image_url: imageUrl,
    wins: 0,
    losses: 0,
    kills: 0,
    alive: true,
    daring: 'measured',
    surrender_at: 20,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ character })
}
