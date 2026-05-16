import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDailyMarket } from '@/lib/black-market'

const SUPABASE_URL = 'https://xxyewnkrulnmgtcshcfx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const today = new Date().toISOString().slice(0, 10)
  const items = generateDailyMarket(today)

  const rows = items.map(item => ({
    date: today,
    tier: item.tier,
    name: item.name,
    description: item.description,
    emoji: item.emoji,
    slot: item.slot,
    stat_bonus: item.statBonus,
    price: item.price,
    level_req: item.levelReq,
    flavor: item.flavor,
  }))

  const { error } = await supabase
    .from('black_market')
    .upsert(rows, { onConflict: 'date,tier' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, date: today, items: items.map(i => i.name) })
}

// Also allow GET for easy manual testing
export async function GET(req: Request) {
  return POST(req)
}
