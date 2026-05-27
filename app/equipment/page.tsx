export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GEAR, TOWNS } from '@/lib/game-data'
import EquipmentClient from '@/components/EquipmentClient'

export default async function EquipmentPage() {
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

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id, equipped')
    .eq('character_id', character.id)

  const currentTown = (character.current_town as number) ?? 1
  const townDef = TOWNS.find(t => t.id === currentTown) ?? TOWNS[0]
  // Show gear for this town, plus any gear the character already owns (even if from another town)
  const ownedIds = new Set((inventory || []).map((i: { gear_id: string }) => i.gear_id))
  const townGear = GEAR.filter(g => (g.town ?? 1) === currentTown || ownedIds.has(g.id))

  return (
    <EquipmentClient
      character={character}
      gear={townGear}
      inventory={inventory || []}
      shopName={townDef.locations.gear}
    />
  )
}
