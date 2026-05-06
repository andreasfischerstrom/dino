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

  return <TavernClient character={character} />
}
