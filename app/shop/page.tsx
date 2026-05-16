export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GEAR } from '@/lib/game-data'
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
        slot: dbItem.slot, statBonus: dbItem.stat_bonus, price: dbItem.price,
        levelReq: dbItem.level_req, flavor: dbItem.flavor, tier: dbItem.tier,
      }
    : generateDailyMarket(today).find(i => i.tier === tier)!

  return (
    <ShopClient
      character={character}
      gear={GEAR}
      inventory={inventory || []}
      blackMarketItem={blackMarketItem}
    />
  )
}
