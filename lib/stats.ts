import { GEAR, GearTemplate, StatKey, Stats } from './game-data'

export interface GearBonus { [key: string]: number }
export interface ActiveBuff { stat: StatKey; bonus: number; label: string }

export function getEquippedGear(inventory: { gear_id: string; equipped: boolean }[]): GearTemplate[] {
  return inventory
    .filter(i => i.equipped)
    .map(i => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as GearTemplate[]
}

export function computeGearBonus(gear: GearTemplate[]): GearBonus {
  const bonus: GearBonus = {}
  for (const item of gear) {
    for (const [key, val] of Object.entries(item.statBonus)) {
      bonus[key] = (bonus[key] || 0) + (val || 0)
    }
  }
  return bonus
}

export function applyGearAndBuffs(
  base: Stats,
  gear: GearTemplate[],
  buffs: ActiveBuff[] = []
): Stats {
  const result = { ...base }
  const gearBonus = computeGearBonus(gear)
  for (const [key, val] of Object.entries(gearBonus)) {
    result[key as StatKey] = (result[key as StatKey] || 0) + val
  }
  for (const buff of buffs) {
    result[buff.stat] = (result[buff.stat] || 0) + buff.bonus
  }
  return result
}
