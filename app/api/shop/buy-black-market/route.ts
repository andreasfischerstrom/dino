import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateDailyMarket } from '@/lib/black-market'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, bones, level, buffs, last_black_market_at')
    .eq('user_id', user.id)
    .single()
  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const today = new Date().toISOString().slice(0, 10)
  if (character.last_black_market_at === today) {
    return NextResponse.json({ error: "You've already made a deal today. Come back tomorrow." }, { status: 400 })
  }

  const tier: 1 | 2 | 3 = character.level >= 13 ? 3 : character.level >= 6 ? 2 : 1

  // DB first, seeded fallback
  const { data: dbItem } = await supabase
    .from('black_market')
    .select('*')
    .eq('date', today)
    .eq('tier', tier)
    .single()

  const item = dbItem
    ? { name: dbItem.name, statBonus: dbItem.stat_bonus as Record<string, number>, price: dbItem.price, levelReq: dbItem.level_req }
    : generateDailyMarket(today).find(i => i.tier === tier)!

  if (character.level < item.levelReq) {
    return NextResponse.json({ error: `Requires level ${item.levelReq}.` }, { status: 400 })
  }
  if (character.bones < item.price) {
    return NextResponse.json({ error: "Not enough bones." }, { status: 400 })
  }

  // Add stat bonuses as buffs — they'll be consumed in the next fight
  const existingBuffs = (character.buffs || []) as { stat: string; bonus: number; label: string }[]
  const newBuffs = [
    ...existingBuffs,
    ...Object.entries(item.statBonus)
      .filter(([, v]) => (v as number) !== 0)
      .map(([stat, bonus]) => ({ stat, bonus: bonus as number, label: item.name })),
  ]

  await supabase.from('characters').update({
    bones: character.bones - item.price,
    buffs: newBuffs,
    last_black_market_at: today,
  }).eq('id', character.id)

  return NextResponse.json({ ok: true, newBones: character.bones - item.price })
}
