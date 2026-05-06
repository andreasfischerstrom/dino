import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TAVERN_ITEMS, StatKey } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await req.json()
  const item = TAVERN_ITEMS.find(i => i.id === itemId)
  if (!item) return NextResponse.json({ error: 'Unknown item' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, hp, max_hp, bones, xp, buffs, stats')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })
  if (character.bones < item.price) return NextResponse.json({ error: 'Not enough bones. Go fight something.' }, { status: 400 })

  // Check stat requirements
  if (item.statReq) {
    const charStats = character.stats as Record<StatKey, number>
    for (const [stat, minVal] of Object.entries(item.statReq)) {
      if ((charStats[stat as StatKey] || 0) < (minVal as number)) {
        return NextResponse.json({ error: `Requires ${stat} ≥ ${minVal}.` }, { status: 400 })
      }
    }
  }

  const updates: Record<string, unknown> = {
    bones: character.bones - item.price,
  }

  const currentBuffs: { stat: string; bonus: number; label: string }[] = character.buffs || []
  let newHp = character.hp
  let newXp = character.xp
  let newBuffs = [...currentBuffs]

  for (const effect of item.effects) {
    if (effect.type === 'heal') {
      newHp = Math.min(character.max_hp, character.hp + effect.amount)
      updates.hp = newHp
    } else if (effect.type === 'xp') {
      newXp = character.xp + effect.amount
      updates.xp = newXp
    } else if (effect.type === 'buff') {
      newBuffs = newBuffs.filter(b => !(b.stat === effect.stat && b.label === effect.label))
      newBuffs.push({ stat: effect.stat, bonus: effect.bonus, label: effect.label })
    }
  }

  updates.buffs = newBuffs

  await supabase.from('characters').update(updates).eq('id', character.id)

  return NextResponse.json({
    ok: true,
    newBones: character.bones - item.price,
    newHp,
    newXp,
    newBuffs,
  })
}
