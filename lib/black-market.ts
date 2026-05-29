import { StatKey, GearSlot, GEAR_SLOTS } from './game-data'

export interface BlackMarketItem {
  name: string
  description: string
  emoji: string
  icon: string
  slot: GearSlot
  statBonus: Partial<Record<StatKey, number>>
  price: number
  levelReq: number
  flavor: string
  tier: number
}

// Word pools for name generation
const PREFIXES = [
  'Forbidden', 'Stolen', 'Cursed', 'Ancient', 'Contraband', 'Blood-Stained',
  'Hex-Carved', 'Smuggled', 'Condemned', 'Profane', 'Exiled', 'Outlawed',
  'Corrupted', 'Haunted', 'Unmarked', 'Black-Market', 'Illicit', 'Defiled',
]

const SLOT_NOUNS: Record<GearSlot, string[]> = {
  jaws:      ['Fang', 'Maw', 'Tooth', 'Bite', 'Jaw-Plate', 'Tusk'],
  claws:     ['Talon', 'Claw', 'Strike', 'Grip', 'Knuckle', 'Blade'],
  body:      ['Hide', 'Plate', 'Carapace', 'Shell', 'Coat', 'Mantle'],
  head:      ['Crown', 'Crest', 'Helm', 'Mask', 'Brand', 'Sigil'],
  tail:      ['Spike', 'Club', 'Lash', 'Barb', 'Coil', 'Flail'],
  accessory: ['Charm', 'Relic', 'Token', 'Shard', 'Totem', 'Fetish'],
}

const SUFFIXES = [
  'of the Fallen', 'of Ruin', 'from the Wastes', 'of No Return',
  'of the Condemned', 'of the Deep Scar', 'of Forgotten Kings',
  'of the Last Hunt', 'of the Bone Fields', 'of Dark Provenance',
  'from the Black Pit', 'of the Unmarked Grave',
]

const EMOJIS: Record<GearSlot, string[]> = {
  jaws:      ['🦷', '💀', '🐍', '⚡', '🩸'],
  claws:     ['🗡️', '⚔️', '🔪', '💀', '🩸'],
  body:      ['🛡️', '🦴', '🪬', '💀', '🌑'],
  head:      ['💀', '🎭', '🩸', '🌑', '⚡'],
  tail:      ['📌', '🩸', '⚡', '🔩', '💀'],
  accessory: ['💎', '🩸', '🌑', '💀', '🪬'],
}

const STAT_KEYS: StatKey[] = ['strength', 'agility', 'constitution', 'ferocity', 'hide', 'stamina', 'jaw', 'cunning', 'roar']

const FLAVORS = [
  'Grubclaw didn\'t ask where it came from. The seller didn\'t offer.',
  'No maker\'s mark. No history. Several good reasons for both.',
  'Previous owner no longer requires it. Details unavailable.',
  'Listed as "recovered goods." From what, exactly, is unclear.',
  'The stitching is someone else\'s. The smell is also someone else\'s.',
  'Grubclaw wrapped it in cloth before touching it. That\'s usually a sign.',
  'Origin unknown. Condition: concerning. Price: non-negotiable.',
  'There are scratches on the inside. From what is not immediately clear.',
  'Found in the lower tier storage. Nobody claims to have put it there.',
  'The seller was in a hurry. This tends to affect the price.',
]

function seededRng(seed: number) {
  return (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000
    return x - Math.floor(x)
  }
}

function pick<T>(arr: T[], rng: (i: number) => number, i: number): T {
  return arr[Math.floor(rng(i) * arr.length)]
}

function generateItem(dateStr: string, tier: 1 | 2 | 3): BlackMarketItem {
  const seed = dateStr.split('-').reduce((acc, n, i) => acc + parseInt(n) * Math.pow(100, 2 - i), 0) + tier * 7919
  const rng = seededRng(seed)

  const slots: GearSlot[] = ['jaws', 'claws', 'body', 'head', 'tail', 'accessory']
  const slot = pick(slots, rng, 0)

  const prefix = pick(PREFIXES, rng, 1)
  const noun = pick(SLOT_NOUNS[slot], rng, 2)
  const suffix = pick(SUFFIXES, rng, 3)
  const name = `${prefix} ${noun} ${suffix}`
  const emoji = pick(EMOJIS[slot], rng, 4)
  const flavor = pick(FLAVORS, rng, 5)

  // Per-tier stat budgets
  const tierConfig = {
    1: { numStats: 1, bonusMin: 1, bonusMax: 2, price: [40, 90],   levelReq: 1,  negativeChance: 0 },
    2: { numStats: 2, bonusMin: 2, bonusMax: 3, price: [120, 220], levelReq: 6,  negativeChance: 0.2 },
    3: { numStats: 2, bonusMin: 3, bonusMax: 5, price: [280, 480], levelReq: 13, negativeChance: 0.4 },
  }[tier]

  // Shuffle stat keys (seeded) and pick numStats of them
  const shuffled = [...STAT_KEYS].sort((a, b) => rng(STAT_KEYS.indexOf(a) + 10) - rng(STAT_KEYS.indexOf(b) + 10))
  const chosen = shuffled.slice(0, tierConfig.numStats)

  const statBonus: Partial<Record<StatKey, number>> = {}
  chosen.forEach((stat, i) => {
    const base = Math.floor(rng(20 + i) * (tierConfig.bonusMax - tierConfig.bonusMin + 1)) + tierConfig.bonusMin
    // Higher tiers can have one negative stat for a "cursed" tradeoff
    const isNegative = i > 0 && rng(30 + i) < tierConfig.negativeChance
    statBonus[stat] = isNegative ? -Math.floor(base / 2) : base
  })

  const [priceMin, priceMax] = tierConfig.price
  const price = Math.floor(rng(40) * (priceMax - priceMin)) + priceMin

  const description = `A ${slot} item of uncertain origin. ${Object.entries(statBonus)
    .map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`)
    .join(', ')}.`

  const icon = GEAR_SLOTS.find(s => s.key === slot)?.icon ?? 'game-icons:charm'
  return { name, description, emoji, icon, slot, statBonus, price, levelReq: tierConfig.levelReq, flavor, tier }
}

export function generateDailyMarket(dateStr: string): BlackMarketItem[] {
  return [
    generateItem(dateStr, 1),
    generateItem(dateStr, 2),
    generateItem(dateStr, 3),
  ]
}
