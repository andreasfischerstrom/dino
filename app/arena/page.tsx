export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SPECIES, DARING_OPTIONS } from '@/lib/game-data'
import { generateDailyBoss, alreadyFoughtToday, todayUTC } from '@/lib/daily-boss'
import ArenaClient from '@/components/ArenaClient'

export default async function ArenaPage() {
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

  const { data: others } = await supabase
    .from('characters')
    .select('id, name, species, level, wins, losses, kills, daring, surrender_at')
    .eq('alive', true)
    .neq('user_id', user.id)
    .order('level', { ascending: false })
    .limit(20)

  const { data: incomingChallenges } = await supabase
    .from('challenges')
    .select('*, challenger:challenger_id(name, species, level)')
    .eq('challenged_id', character.id)
    .eq('status', 'pending')

  const { data: outgoingChallenges } = await supabase
    .from('challenges')
    .select('*, challenged:challenged_id(name, species, level)')
    .eq('challenger_id', character.id)
    .eq('status', 'pending')

  const dailyBoss = generateDailyBoss(todayUTC(), character.level)
  const foughtToday = alreadyFoughtToday(character.last_daily_at ?? null)

  return (
    <ArenaClient
      character={character}
      others={others || []}
      incomingChallenges={incomingChallenges || []}
      outgoingChallenges={outgoingChallenges || []}
      species={SPECIES}
      daringOptions={DARING_OPTIONS}
      dailyBoss={dailyBoss}
      foughtToday={foughtToday}
    />
  )
}
