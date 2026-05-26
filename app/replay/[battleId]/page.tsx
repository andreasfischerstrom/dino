export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SPECIES, xpForLevel, levelFromXp } from '@/lib/game-data'
import ReplayClient from '@/components/ReplayClient'

export default async function ReplayPage({ params }: { params: Promise<{ battleId: string }> }) {
  const { battleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: viewer } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!viewer) redirect('/create-character')

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single()

  if (!battle || !battle.battle_result) redirect('/town')

  const isChallenger = viewer.id === battle.challenger_id
  const isChallenged = viewer.id === battle.challenged_id
  if (!isChallenger && !isChallenged) redirect('/town')

  // Already seen — skip to appropriate page
  const alreadySeen = isChallenger ? battle.challenger_seen : battle.challenged_seen
  if (alreadySeen) redirect(viewer.alive ? '/town' : '/obituary')

  const userSide: 'a' | 'b' = isChallenger ? 'a' : 'b'
  const opponentId = isChallenger ? battle.challenged_id : battle.challenger_id

  const { data: opponent } = await supabase
    .from('characters')
    .select('id, name, image_url, species')
    .eq('id', opponentId)
    .single()

  const opponentSpecies = SPECIES.find(s => s.id === opponent?.species)
  const opponentImage = opponent?.image_url ?? opponentSpecies?.image ?? opponentSpecies?.emoji ?? '🦕'
  const opponentName = opponent?.name ?? 'Unknown'

  const result = battle.battle_result as {
    winner: string
    a: { hpBefore: number; hpAfter: number; maxHp: number; xpBefore: number; xpAfter: number; xpGained: number; bonesBefore: number; bonesAfter: number; bonesDelta: number; leveledUp: boolean; survived: boolean }
    b: { hpBefore: number; hpAfter: number; maxHp: number; xpBefore: number; xpAfter: number; xpGained: number; bonesBefore: number; bonesAfter: number; bonesDelta: number; leveledUp: boolean; survived: boolean }
  }

  const viewerResult = result[userSide]
  const viewerSpecies = SPECIES.find(s => s.id === viewer.species)
  const viewerImage = viewer.image_url ?? viewerSpecies?.image ?? viewerSpecies?.emoji ?? '🦕'

  const viewerSnapshot = {
    hp: viewerResult.hpBefore,
    maxHp: viewerResult.maxHp,
    xp: viewerResult.xpBefore,
    xpForNextLevel: xpForLevel(levelFromXp(viewerResult.xpBefore) + 1),
    bones: viewerResult.bonesBefore,
    image: viewerImage,
    name: viewer.name,
    level: levelFromXp(viewerResult.xpBefore),
    statPoints: viewer.stat_points ?? 0,
  }

  // localResult format expected by BattleViewer
  const battleResult = {
    winner: result.winner,
    xpGained: viewerResult.xpGained,
    bonesGained: viewerResult.bonesDelta,
    newHp: viewerResult.hpAfter,
    leveledUp: viewerResult.leveledUp,
    attackerAlive: result.a.survived,
    defenderAlive: result.b.survived,
  }

  return (
    <ReplayClient
      battleId={battle.id}
      events={battle.events}
      battleResult={battleResult}
      viewerSnapshot={viewerSnapshot}
      opponentName={opponentName}
      opponentImage={opponentImage}
      userSide={userSide}
      viewerSurvived={viewerResult.survived}
      opponentWasChallenger={isChallenged}
    />
  )
}
