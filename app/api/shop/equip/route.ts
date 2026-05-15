import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GEAR, maxHp, StatKey } from '@/lib/game-data'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gearId, equip } = await req.json()
  const item = GEAR.find(g => g.id === gearId)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id, stats, hp, max_hp')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  if (equip) {
    // Unequip same slot first
    const sameSlotIds = GEAR.filter(g => g.slot === item.slot).map(g => g.id)
    await supabase.from('inventory')
      .update({ equipped: false })
      .eq('character_id', character.id)
      .in('gear_id', sameSlotIds)
  }

  await supabase.from('inventory')
    .update({ equipped: equip })
    .eq('character_id', character.id)
    .eq('gear_id', gearId)

  // Recompute effective max HP from base stats + all currently equipped gear
  const { data: nowEquipped } = await supabase
    .from('inventory')
    .select('gear_id')
    .eq('character_id', character.id)
    .eq('equipped', true)

  const equippedGear = (nowEquipped || [])
    .map(i => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as typeof GEAR

  const gearConBonus = equippedGear.reduce((sum, g) => sum + ((g.statBonus.constitution as number) || 0), 0)
  const baseConstitution = ((character.stats as Record<StatKey, number>).constitution) || 0
  const newMaxHp = maxHp(baseConstitution + gearConBonus)
  const newHp = Math.min(character.hp, newMaxHp)

  await supabase.from('characters')
    .update({ max_hp: newMaxHp, hp: newHp })
    .eq('id', character.id)

  return NextResponse.json({ ok: true })
}
