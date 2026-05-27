export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TOWNS } from '@/lib/game-data'
import MapClient from '@/components/MapClient'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('id, level, current_town, alive')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')
  if (!character.alive) redirect('/obituary')

  const currentTown = (character.current_town as number) ?? 1

  return (
    <MapClient
      towns={TOWNS}
      currentTown={currentTown}
      characterLevel={character.level as number}
    />
  )
}
