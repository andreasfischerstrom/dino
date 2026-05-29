export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GEAR, TOWNS, GEAR_SLOTS } from '@/lib/game-data'
import { generateDailyMarket } from '@/lib/black-market'
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

  const currentTown = (character.current_town as number) ?? 1
  const townDef = TOWNS.find(t => t.id === currentTown) ?? TOWNS[0]
  const ownedIds = new Set((inventory || []).map((i: { gear_id: string }) => i.gear_id))
  const townGear = GEAR.filter(g => (g.town ?? 1) === currentTown || ownedIds.has(g.id))

  const today = new Date().toISOString().slice(0, 10)
  const tier = character.level >= 13 ? 3 : character.level >= 6 ? 2 : 1

  // Try DB first (populated by cron), fall back to seeded generation
  const { data: dbItem } = await supabase
    .from('black_market')
    .select('*')
    .eq('date', today)
    .eq('tier', tier)
    .single()

  const blackMarketItem = dbItem
    ? {
        name: dbItem.name, description: dbItem.description, emoji: dbItem.emoji,
        icon: GEAR_SLOTS.find(s => s.key === dbItem.slot)?.icon ?? 'game-icons:charm',
        slot: dbItem.slot, statBonus: dbItem.stat_bonus, price: dbItem.price,
        levelReq: dbItem.level_req, flavor: dbItem.flavor, tier: dbItem.tier,
      }
    : generateDailyMarket(today).find(i => i.tier === tier)!

  return (
    <ShopClient
      character={character}
      gear={townGear}
      inventory={inventory || []}
      blackMarketItem={blackMarketItem}
      locationName={townDef.locations.gear}
      keeperName={townDef.tavernKeeper}
    />
  )
}
