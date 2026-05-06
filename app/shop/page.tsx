import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GEAR } from '@/lib/game-data'
import ShopClient from '@/components/ShopClient'

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id, equipped')
    .eq('character_id', character.id)

  return <ShopClient character={character} gear={GEAR} inventory={inventory || []} />
}
