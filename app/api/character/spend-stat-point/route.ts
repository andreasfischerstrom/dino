import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { STATS, StatKey, STAT_MAX } from '@/lib/game-data'

const HP_PER_CONSTITUTION = 10  // from maxHp: 50 + constitution * 10

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
  if ((stats[stat as StatKey] || 0) >= STAT_MAX) return NextResponse.json({ error: 'Stat is already at maximum' }, { status: 400 })

  const newStats = { ...stats, [stat as StatKey]: (stats[stat as StatKey] || 0) + 1 }

  const update: Record<string, unknown> = {
    stats: newStats,
    stat_points: character.stat_points - 1,
  }

  if (stat === 'constitution') {
    // Always add exactly HP_PER_CONSTITUTION — correct regardless of what's currently stored in max_hp
    update.max_hp = character.max_hp + HP_PER_CONSTITUTION
    update.hp = Math.min(character.max_hp + HP_PER_CONSTITUTION, character.hp + HP_PER_CONSTITUTION)
  }

  await supabase.from('characters').update(update).eq('id', character.id)

  return NextResponse.json({ ok: true, newStats, statPointsLeft: character.stat_points - 1 })
}
