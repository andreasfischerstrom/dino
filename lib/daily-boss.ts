import { SPECIES, BASE_STATS, Stats } from './game-data'

const NAMES = [
  'Morgra', 'Vorrax', 'Skeld', 'Duma', 'Raksha', 'Torrak', 'Zephyn', 'Brulk',
  'Cyndra', 'Havok', 'Dravek', 'Sultar', 'Korrax', 'Vendra', 'Threx', 'Ossian',
  'Quelya', 'Brakk', 'Norryn', 'Ulvex',
]
const TITLES = [
  'the Inexorable', 'the Merciless', 'the Unbroken', 'the Ancient', 'the Bloodied',
  'the Unyielding', 'Bonebreaker', 'the Relentless', 'the Scarred', 'the Last',
  'of the Deep Scar', 'the Undying', 'the Feared', 'the Unkillable', 'of No Mercy',
]
const FLAVORS: ((name: string) => string)[] = [
  n => `${n} has not lost in this arena. The staff are beginning to suspect this is permanent.`,
  n => `${n} arrived three weeks ago without explanation. Nobody has asked questions. Nobody wants the answers.`,
  n => `The crowd goes quiet when ${n} enters. Not out of respect. Out of instinct.`,
  n => `${n} has broken more bones than the arena doctor can count. Several of them were the doctor's.`,
  n => `${n} is said to eat before every fight. Nobody knows what. Nobody has asked.`,
  n => `${n} fights for reasons unknown. Whatever they are, they appear to be sufficient motivation.`,
  n => `There is a betting pool on when ${n} will finally lose. It has been running for eleven days. Nobody has collected.`,
  n => `${n} once fought three consecutive bouts without sitting down. The third opponent was not fully recovered from the second.`,
]

function seededRng(seed: number) {
  return (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000
    return x - Math.floor(x)
  }
}

export interface DailyBoss {
  fullName: string
  species: string
  speciesEmoji: string
  speciesName: string
  level: number
  stats: Stats
  flavor: string
}

export function generateDailyBoss(dateStr: string, characterLevel: number): DailyBoss {
  const seed = dateStr.split('-').reduce((acc, n, i) => acc + parseInt(n) * Math.pow(100, 2 - i), 0)
  const rng = seededRng(seed)

  const name = NAMES[Math.floor(rng(0) * NAMES.length)]
  const title = TITLES[Math.floor(rng(1) * TITLES.length)]
  const fullName = `${name} ${title}`

  const speciesId = SPECIES[Math.floor(rng(2) * SPECIES.length)].id
  const speciesData = SPECIES.find(s => s.id === speciesId)!

  const bossLevel = characterLevel + 2

  // Start from base stats + species bonuses
  const stats: Stats = { ...BASE_STATS }
  for (const [k, v] of Object.entries(speciesData.baseStats)) {
    stats[k as keyof Stats] = Math.max(1, (stats[k as keyof Stats] || 0) + (v as number))
  }

  // Distribute boss level points randomly (seeded) — same logic a player would use levelling up
  const statKeys = Object.keys(stats) as (keyof Stats)[]
  let pointsLeft = bossLevel * 2
  let i = 10
  while (pointsLeft > 0) {
    const idx = Math.floor(rng(i++) * statKeys.length)
    stats[statKeys[idx]] = (stats[statKeys[idx]] || 0) + 1
    pointsLeft--
  }

  const flavor = FLAVORS[Math.floor(rng(30) * FLAVORS.length)](fullName)

  return { fullName, species: speciesId, speciesEmoji: speciesData.emoji, speciesName: speciesData.name, level: bossLevel, stats, flavor }
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function alreadyFoughtToday(lastDailyAt: string | null): boolean {
  if (!lastDailyAt) return false
  return lastDailyAt.slice(0, 10) === todayUTC()
}

export function nextResetMs(): number {
  const now = new Date()
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return tomorrow.getTime() - now.getTime()
}
