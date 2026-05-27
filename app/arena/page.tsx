export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SPECIES, DARING_OPTIONS, TOWNS, MOBS } from '@/lib/game-data'
import { generateDailyBoss, alreadyFoughtToday, todayUTC } from '@/lib/daily-boss'
import { getEquippedGear } from '@/lib/stats'
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

  const currentTown = (character.current_town as number) ?? 1
  const townDef = TOWNS.find(t => t.id === currentTown) ?? TOWNS[0]

  const [
    { data: inventory },
    { data: others },
    { data: incomingChallenges },
    { data: outgoingChallenges },
  ] = await Promise.all([
    supabase.from('inventory').select('gear_id, equipped').eq('character_id', character.id),
    supabase
      .from('characters')
      .select('id, name, species, level, wins, losses, kills, daring, surrender_at')
      .eq('alive', true)
      .eq('current_town', currentTown)
      .neq('user_id', user.id)
      .order('level', { ascending: false })
      .limit(20),
    supabase
      .from('challenges')
      .select('*, challenger:challenger_id(name, species, level)')
      .eq('challenged_id', character.id)
      .eq('status', 'pending'),
    supabase
      .from('challenges')
      .select('*, challenged:challenged_id(name, species, level)')
      .eq('challenger_id', character.id)
      .eq('status', 'pending'),
  ])

  const equippedGear = getEquippedGear(inventory || [])
  const townMobs = MOBS.filter(m => (m.town ?? 1) === currentTown)
  const dailyBoss = generateDailyBoss(todayUTC(), character.level)
  const foughtToday = alreadyFoughtToday(character.last_daily_at ?? null)
  const defaultTab = (incomingChallenges?.length ?? 0) > 0 ? 'duels' : 'fight'

  return (
    <ArenaClient
      character={character}
      equippedGear={equippedGear}
      mobs={townMobs}
      others={others || []}
      incomingChallenges={incomingChallenges || []}
      outgoingChallenges={outgoingChallenges || []}
      species={SPECIES}
      daringOptions={DARING_OPTIONS}
      dailyBoss={dailyBoss}
      foughtToday={foughtToday}
      locationName={townDef.locations.arena}
      defaultTab={defaultTab as 'fight' | 'duels'}
    />
  )
}
