import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TAVERN_ITEMS, StatKey, getDenPerks } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await req.json()
  const item = TAVERN_ITEMS.find(i => i.id === itemId)
  if (!item) return NextResponse.json({ error: 'Unknown item' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, hp, max_hp, bones, xp, buffs, stats, buffs_purchased, den_town, den_tier, current_town')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const isBuff = item.effects.some(e => e.type === 'buff')
  const currentBuffs: { stat: string; bonus: number; label: string }[] = character.buffs || []

  if (isBuff && currentBuffs.length >= 1) {
    return NextResponse.json({ error: 'You already have an active buff. Use it first.' }, { status: 400 })
  }

  const buffsPurchased = (character.buffs_purchased as number) || 0
  const denTownId = character.den_town as number | null
  const denTierId = character.den_tier as number | null
  const currentTown = character.current_town as number | null
  const denPerks = (denTownId && denTierId && denTownId === currentTown)
    ? getDenPerks(denTownId, denTierId)
    : {}
  const discountMult = 1 - (denPerks.tavernDiscount ?? 0)
  const basePrice = isBuff ? Math.round(item.price * (1 + buffsPurchased * 0.5)) : item.price
  const actualPrice = Math.round(basePrice * discountMult)

  if (character.bones < actualPrice) return NextResponse.json({ error: 'Not enough bones. Go fight something.' }, { status: 400 })

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
    bones: character.bones - actualPrice,
  }

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
  if (isBuff) updates.buffs_purchased = buffsPurchased + 1

  await supabase.from('characters').update(updates).eq('id', character.id)

  return NextResponse.json({
    ok: true,
    newBones: character.bones - actualPrice,
    newHp,
    newXp,
    newBuffs,
  })
}
