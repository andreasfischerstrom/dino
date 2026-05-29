export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TOWNS, DEN_DATA, getDenUpgradeCost, getDenBuyCost, getDenSellValue, DEN_TIERS } from '@/lib/game-data'
import DenClient from '@/components/DenClient'

export default async function DenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones, hp, max_hp, kills, current_town, den_town, den_tier, alive, name')
    .eq('user_id', user.id)
    .single()

  if (!character?.alive) redirect('/town')

  const currentTown = (character.current_town as number) ?? 1
  const denTown = character.den_town as number | null
  const denTier = character.den_tier as number | null

  const currentTownDef = TOWNS.find(t => t.id === currentTown) ?? TOWNS[0]
  const denTownDef = denTown ? (TOWNS.find(t => t.id === denTown) ?? null) : null
  const denTownData = denTown ? (DEN_DATA[denTown] ?? null) : null
  const currentTownData = DEN_DATA[currentTown]

  const upgradeCost = denTown && denTier ? getDenUpgradeCost(denTown, denTier) : null
  const buyCost = getDenBuyCost(currentTown)
  const sellValue = denTown && denTier ? getDenSellValue(denTown, denTier) : 0

  return (
    <DenClient
      characterId={character.id as string}
      characterName={character.name as string}
      bones={character.bones as number}
      hp={character.hp as number}
      maxHp={character.max_hp as number}
      kills={character.kills as number}
      currentTown={currentTown}
      currentTownDef={currentTownDef}
      currentTownData={currentTownData}
      denTown={denTown}
      denTier={denTier}
      denTownDef={denTownDef}
      denTownData={denTownData}
      denTierName={denTier ? DEN_TIERS[denTier - 1] : null}
      upgradeCost={upgradeCost}
      buyCost={buyCost}
      sellValue={sellValue}
    />
  )
}
