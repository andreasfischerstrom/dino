import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MOBS, GEAR, SPECIES, DARING_OPTIONS, TOWNS } from '@/lib/game-data'
import TrainingClient from '@/components/TrainingClient'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')
  if (!character.alive) redirect('/obituary')

  // Get character's gear
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*, gear_id')
    .eq('character_id', character.id)
    .eq('equipped', true)

  const equippedGear = (inventory || []).map((i: { gear_id: string }) => GEAR.find(g => g.id === i.gear_id)).filter(Boolean)

  const currentTown = (character.current_town as number) ?? 1
  const townDef = TOWNS.find(t => t.id === currentTown) ?? TOWNS[0]
  const townMobs = MOBS.filter(m => (m.town ?? 1) === currentTown)

  return (
    <TrainingClient
      character={character}
      equippedGear={equippedGear}
      mobs={townMobs}
      species={SPECIES}
      daringOptions={DARING_OPTIONS}
      locationName={townDef.locations.training}
    />
  )
}
