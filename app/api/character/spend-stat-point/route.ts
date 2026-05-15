import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { STATS, StatKey, maxHp } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stat } = await req.json()
  if (!STATS.find(s => s.key === stat)) return NextResponse.json({ error: 'Invalid stat' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, stats, stat_points, hp, max_hp')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })
  if (!character.stat_points || character.stat_points < 1) return NextResponse.json({ error: 'No stat points available' }, { status: 400 })

  const stats = character.stats as Record<StatKey, number>
  const newStats = { ...stats, [stat as StatKey]: (stats[stat as StatKey] || 0) + 1 }

  const update: Record<string, unknown> = {
    stats: newStats,
    stat_points: character.stat_points - 1,
  }

  if (stat === 'constitution') {
    const newMaxHp = maxHp(newStats.constitution)
    const hpIncrease = newMaxHp - character.max_hp
    update.max_hp = newMaxHp
    update.hp = Math.min(newMaxHp, character.hp + hpIncrease)
  }

  await supabase.from('characters').update(update).eq('id', character.id)

  return NextResponse.json({ ok: true, newStats, statPointsLeft: character.stat_points - 1 })
}
