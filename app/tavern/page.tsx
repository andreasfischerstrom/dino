export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TavernClient from '@/components/TavernClient'

export default async function TavernPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')

  const { data: investment } = await supabase
    .from('investments')
    .select('*')
    .eq('character_id', character.id)
    .eq('collected', false)
    .single()

  return <TavernClient character={character} investment={investment ?? null} />
}
