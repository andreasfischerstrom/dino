export type StatKey =
  | 'strength'
  | 'agility'
  | 'constitution'
  | 'ferocity'
  | 'hide'
  | 'stamina'
  | 'jaw'
  | 'cunning'
  | 'roar'

export interface StatDefinition {
  key: StatKey
  label: string
  description: string
  emoji: string
}

export const STATS: StatDefinition[] = [
  { key: 'strength',     label: 'Strength',     emoji: '💪', description: 'Raw damage output. Bigger number, bigger hurt.' },
  { key: 'agility',      label: 'Agility',       emoji: '⚡', description: 'Attack order and dodge chance. Fast dinos go first and hit less.' },
  { key: 'constitution', label: 'Constitution',  emoji: '❤️', description: 'Your total HP pool. More is better. Obviously.' },
  { key: 'ferocity',     label: 'Ferocity',      emoji: '🔥', description: 'Critical hit chance. Sometimes you just snap.' },
  { key: 'hide',         label: 'Hide',          emoji: '🛡️', description: 'Natural armor. Reduces incoming damage. Great scales, fewer scrapes.' },
  { key: 'stamina',      label: 'Stamina',       emoji: '🫁', description: 'Performance in long fights. Low stamina = growing tired after round 5.' },
  { key: 'jaw',          label: 'Jaw',           emoji: '🦷', description: 'Bite attack multiplier. Self-explanatory. Some jaws are better than others.' },
  { key: 'cunning',      label: 'Cunning',       emoji: '🧠', description: 'Counter-attack and trap chance. Intelligence is a weapon too, apparently.' },
  { key: 'roar',         label: 'Roar',          emoji: '📢', description: 'Pre-fight intimidation. Can rattle the opponent and reduce their effective Daring.' },
]

export type Stats = Record<StatKey, number>

export interface Species {
  id: string
  name: string
  tagline: string
  flavor: string
  emoji: string
  image: string
  baseStats: Partial<Stats>
  bonusPoints: number
}

export const SPECIES: Species[] = [
  {
    id: 'trex',
    name: 'T-Rex',
    tagline: 'Apex predator. Terrible at hugs.',
    flavor: 'The king of the Cretaceous. Short arms, enormous attitude. Compensates for all physical limitations with an absolutely unhinged bite.',
    emoji: '🦖',
    image: '/images/species/trex.png',
    baseStats: { strength: 2, ferocity: 1, agility: -2, cunning: -1 },
    bonusPoints: 15,
  },
  {
    id: 'velociraptor',
    name: 'Velociraptor',
    tagline: 'Smart. Fast. Deeply unhinged.',
    flavor: 'Smaller than the movies suggested. Makes up for it by being absolutely everywhere at once and having opinions about everything.',
    emoji: '🐆',
    image: '/images/species/velociraptor.png',
    baseStats: { agility: 2, cunning: 1, constitution: -2, hide: -1 },
    bonusPoints: 15,
  },
  {
    id: 'triceratops',
    name: 'Triceratops',
    tagline: 'A tank. With horns on its face.',
    flavor: 'Three horns. Excellent defense. Moves like a furniture delivery truck but hits like one too. The accountant of the dinosaur world — boring until it gores you.',
    emoji: '🦏',
    image: '/images/species/triceratops.png',
    baseStats: { hide: 2, constitution: 1, agility: -2, cunning: -1 },
    bonusPoints: 15,
  },
  {
    id: 'ankylosaurus',
    name: 'Ankylosaurus',
    tagline: 'Effectively a boulder with opinions.',
    flavor: 'Nearly impenetrable armor. A tail club that has ended careers. So slow that opponents sometimes get bored and lose. This is considered a strategy.',
    emoji: '🪨',
    image: '/images/species/ankylosaurus.png',
    baseStats: { hide: 3, constitution: 1, agility: -3, ferocity: -1 },
    bonusPoints: 15,
  },
  {
    id: 'spinosaurus',
    name: 'Spinosaurus',
    tagline: 'Aquatic. Mysterious. Confident about the fin.',
    flavor: 'Part fish, part killing machine, entirely certain that the sail on its back is cool actually. Has never explained why. Nobody asks twice.',
    emoji: '🐊',
    image: '/images/species/spinosaurus.png',
    baseStats: { strength: 1, stamina: 1, jaw: 1, roar: -1, cunning: -1 },
    bonusPoints: 15,
  },
  {
    id: 'pterodactyl',
    name: 'Pterodactyl',
    tagline: 'Technically not a dinosaur. Brings it up constantly.',
    flavor: 'Agile, clever, and insufferable at parties. Keeps a blog about pterosaur taxonomy. Hits like a wet fern but will absolutely dodge everything you throw.',
    emoji: '🦅',
    image: '/images/species/pterodactyl.png',
    baseStats: { agility: 2, cunning: 1, strength: -2, constitution: -1 },
    bonusPoints: 15,
  },
  {
    id: 'pachycephalosaurus',
    name: 'Pachycephalosaurus',
    tagline: 'Literally just headbutts things. Elite.',
    flavor: 'A 10-inch dome of solid bone on top of an already thick skull. Scientists believe it used this for combat. Scientists are correct. Has never once used words when a headbutt would do.',
    emoji: '🐏',
    image: '/images/species/pachycephalosaurus.png',
    baseStats: { strength: 2, ferocity: 1, cunning: -2, agility: -1 },
    bonusPoints: 15,
  },
  {
    id: 'stegosaurus',
    name: 'Stegosaurus',
    tagline: 'Spiked tail. Walnut-sized brain. Peak performance.',
    flavor: 'The plates on its back serve no known offensive function. The tail spikes serve a very clear offensive function. Focus on the tail.',
    emoji: '🦔',
    image: '/images/species/stegosaurus.png',
    baseStats: { hide: 1, constitution: 1, jaw: 1, cunning: -2, roar: -1 },
    bonusPoints: 15,
  },
]

export const BASE_STATS: Stats = {
  strength: 3,
  agility: 3,
  constitution: 3,
  ferocity: 3,
  hide: 3,
  stamina: 3,
  jaw: 3,
  cunning: 3,
  roar: 3,
}

export const STAT_POOL = 12

export type DaringLevel = 'timid' | 'measured' | 'bold' | 'reckless' | 'unhinged'

export interface DaringOption {
  key: DaringLevel
  label: string
  description: string
  dmgMult: number
  dmgReceivedMult: number
  critBonus: number
}

export const DARING_OPTIONS: DaringOption[] = [
  { key: 'timid',    label: 'Timid',    description: 'Fight defensively. Survive first, win second.',  dmgMult: 0.85, dmgReceivedMult: 0.80, critBonus: -0.05 },
  { key: 'measured', label: 'Measured', description: 'Balanced. Boring. Effective.',                   dmgMult: 1.00, dmgReceivedMult: 1.00, critBonus: 0 },
  { key: 'bold',     label: 'Bold',     description: 'Commit to the attack. Consequences pending.',    dmgMult: 1.15, dmgReceivedMult: 1.15, critBonus: 0.03 },
  { key: 'reckless', label: 'Reckless', description: 'Maximum aggression. Minimum self-preservation.', dmgMult: 1.30, dmgReceivedMult: 1.30, critBonus: 0.10 },
  { key: 'unhinged', label: 'Unhinged', description: 'The crowd loves it. Your skeleton may not.',     dmgMult: 1.50, dmgReceivedMult: 1.50, critBonus: 0.15 },
]

export interface Mob {
  id: string
  name: string
  emoji: string
  description: string
  level: number
  stats: Stats
  xpReward: number
  bonesReward: [number, number]
  lootTable: string[]
  deathQuip: string
}

export const MOBS: Mob[] = [
  {
    id: 'baby_raptor',
    name: 'Baby Raptor',
    emoji: '🐣',
    description: 'A confused hatchling. It keeps tripping over its own feet.',
    level: 1,
    stats: { strength: 1, agility: 4, constitution: 2, ferocity: 1, hide: 1, stamina: 2, jaw: 1, cunning: 2, roar: 1 },
    xpReward: 20,
    bonesReward: [5, 15],
    lootTable: ['old_bone', 'small_claw'],
    deathQuip: 'It lets out a tiny squeak and tips over. You feel like a monster.',
  },
  {
    id: 'marsh_lizard',
    name: 'Marsh Lizard',
    emoji: '🦎',
    description: 'Big enough to be annoying, small enough to be embarrassing to lose to.',
    level: 2,
    stats: { strength: 2, agility: 3, constitution: 3, ferocity: 2, hide: 2, stamina: 3, jaw: 2, cunning: 1, roar: 1 },
    xpReward: 35,
    bonesReward: [10, 25],
    lootTable: ['small_claw', 'lizard_hide', 'old_bone'],
    deathQuip: 'It hisses one final time and retreats into a bush. You check the bush. It\'s gone.',
  },
  {
    id: 'armored_turtle',
    name: 'Armored Turtle',
    emoji: '🐢',
    description: 'Extremely defensive. Extremely patient. Extremely boring to fight.',
    level: 3,
    stats: { strength: 2, agility: 1, constitution: 6, ferocity: 1, hide: 6, stamina: 4, jaw: 2, cunning: 1, roar: 1 },
    xpReward: 50,
    bonesReward: [15, 35],
    lootTable: ['turtle_shell_shard', 'old_bone'],
    deathQuip: 'It slowly retracts into its shell and refuses to come out. You declare victory anyway.',
  },
  {
    id: 'rogue_pachyceph',
    name: 'Rogue Pachycephalosaurus',
    emoji: '🐏',
    description: 'Got kicked out of the herd for excessive headbutting. Has not changed its ways.',
    level: 4,
    stats: { strength: 5, agility: 3, constitution: 4, ferocity: 4, hide: 3, stamina: 3, jaw: 2, cunning: 1, roar: 2 },
    xpReward: 75,
    bonesReward: [20, 45],
    lootTable: ['dome_fragment', 'small_claw', 'old_bone'],
    deathQuip: 'It headbutts a rock out of spite and staggers off. The rock is also slightly damaged.',
  },
  {
    id: 'swamp_croc',
    name: 'Ancient Swamp Croc',
    emoji: '🐊',
    description: 'Old. Patient. Has been here longer than you and is deeply resentful about it.',
    level: 5,
    stats: { strength: 5, agility: 2, constitution: 5, ferocity: 3, hide: 5, stamina: 5, jaw: 6, cunning: 3, roar: 2 },
    xpReward: 100,
    bonesReward: [30, 60],
    lootTable: ['croc_scale', 'croc_tooth', 'lizard_hide'],
    deathQuip: 'It sinks slowly into the swamp. You get the feeling it will be back. It will be back.',
  },
  {
    id: 'alpha_raptor',
    name: 'Alpha Raptor',
    emoji: '🦖',
    description: 'Leader of the pack. The pack has abandoned it for unclear reasons.',
    level: 7,
    stats: { strength: 5, agility: 7, constitution: 5, ferocity: 5, hide: 3, stamina: 5, jaw: 4, cunning: 6, roar: 5 },
    xpReward: 150,
    bonesReward: [50, 90],
    lootTable: ['raptor_claw', 'alpha_fang', 'croc_scale'],
    deathQuip: 'It calls for backup. No backup comes. It calls again. Still nothing. It leaves with great dignity.',
  },
  {
    id: 'volcanic_rex',
    name: 'Volcanic Rex',
    emoji: '🌋',
    description: 'Lives near the volcano. Angry about it. Angry about everything.',
    level: 10,
    stats: { strength: 8, agility: 4, constitution: 8, ferocity: 7, hide: 5, stamina: 6, jaw: 8, cunning: 2, roar: 7 },
    xpReward: 250,
    bonesReward: [80, 150],
    lootTable: ['volcanic_fang', 'ember_scale', 'alpha_fang'],
    deathQuip: 'It collapses with a roar that shakes the ground. A nearby bird, safe at all times, watches judgmentally.',
  },
]

export type GearSlot = 'jaws' | 'claws' | 'body' | 'head' | 'tail' | 'accessory'

export const GEAR_SLOTS: { key: GearSlot; label: string; emoji: string; description: string }[] = [
  { key: 'jaws',      label: 'Jaws',      emoji: '🦷', description: 'Bite weapons and fang enhancements. One equipped at a time.' },
  { key: 'claws',     label: 'Claws',     emoji: '🤜', description: 'Strike weapons and gauntlets. One equipped at a time.' },
  { key: 'body',      label: 'Body',      emoji: '🛡️', description: 'Armor, hides, and plating. One equipped at a time.' },
  { key: 'head',      label: 'Head',      emoji: '🎭', description: 'Helmets, horns, and masks. One equipped at a time.' },
  { key: 'tail',      label: 'Tail',      emoji: '📌', description: 'Tail weapons and attachments. One equipped at a time.' },
  { key: 'accessory', label: 'Accessory', emoji: '💍', description: 'Charms, totems, and necklaces. One equipped at a time.' },
]

export interface GearTemplate {
  id: string
  name: string
  slot: GearSlot
  emoji: string
  description: string
  statBonus: Partial<Stats>
  price: number
  levelReq: number
}

export const GEAR: GearTemplate[] = [
  // ── Jaws (bite weapons, fang enhancements) ────────────────────────────────
  { id: 'sharpened_bone',      name: 'Sharpened Bone',       slot: 'jaws',      emoji: '🦴', levelReq: 1,  price: 30,  statBonus: { jaw: 1, strength: 1 },                  description: 'A bone. Someone sharpened it. The beginning of a dental strategy.' },
  { id: 'serrated_fang',       name: 'Serrated Fang',        slot: 'jaws',      emoji: '🦷', levelReq: 3,  price: 95,  statBonus: { jaw: 2, ferocity: 1 },                  description: 'A large tooth, serrated and mounted. Goes in and doesn\'t come out clean.' },
  { id: 'croc_jaw_weapon',     name: 'Croc Jaw',             slot: 'jaws',      emoji: '🐊', levelReq: 6,  price: 220, statBonus: { jaw: 3, strength: 2 },                  description: 'An actual crocodile jaw, mounted and wielded. Grubclaw considers this his masterwork.' },
  { id: 'volcanic_fang_blade', name: 'Volcanic Fang',        slot: 'jaws',      emoji: '🔥', levelReq: 8,  price: 300, statBonus: { jaw: 3, strength: 2, ferocity: 2 },     description: 'A tooth from a Volcanic Rex. Gets hotter during combat. This is not metaphorical.' },
  { id: 'apex_fang',           name: 'Apex Fang',            slot: 'jaws',      emoji: '💀', levelReq: 10, price: 500, statBonus: { jaw: 4, strength: 3, ferocity: 2 },     description: 'The largest fang Grubclaw has ever worked with. He won\'t say where it\'s from. You don\'t ask.' },

  // ── Claws (strike weapons, gauntlets) ─────────────────────────────────────
  { id: 'stone_club',          name: 'Stone Club',           slot: 'claws',     emoji: '🪨', levelReq: 1,  price: 40,  statBonus: { strength: 1, stamina: 1 },              description: 'A rock lashed to a stick. Heavy, slow, and deeply effective.' },
  { id: 'claw_gauntlet',       name: 'Claw Gauntlet',        slot: 'claws',     emoji: '🤜', levelReq: 2,  price: 65,  statBonus: { strength: 1, agility: 1 },              description: 'Claws mounted on a knuckle wrap. Fast and mean.' },
  { id: 'iron_claw',           name: 'Iron Claw',            slot: 'claws',     emoji: '🗡️', levelReq: 3,  price: 80,  statBonus: { strength: 2, agility: 1 },              description: 'Forged by Grubclaw himself. With three fingers. You can tell.' },
  { id: 'raptor_talon',        name: 'Raptor Talon',         slot: 'claws',     emoji: '⚔️', levelReq: 5,  price: 160, statBonus: { agility: 2, ferocity: 2, strength: 1 }, description: 'A dismounted raptor talon, sharpened to surgical precision. The raptor was unhappy about this.' },
  { id: 'bone_maul',           name: 'Bone Maul',            slot: 'claws',     emoji: '🏏', levelReq: 6,  price: 190, statBonus: { strength: 3, stamina: 1, agility: -1 }, description: 'Enormous. Slow. When it connects, debates end.' },
  { id: 'warlord_spear',       name: "Warlord's Spear",      slot: 'claws',     emoji: '🔱', levelReq: 9,  price: 380, statBonus: { strength: 3, agility: 1, ferocity: 2 }, description: 'A spear of unknown origin. The engraving suggests it has ended several careers.' },

  // ── Body (armor, hides, plating) ──────────────────────────────────────────
  { id: 'hide_wrap',           name: 'Hide Wrap',            slot: 'body',      emoji: '🧣', levelReq: 1,  price: 30,  statBonus: { hide: 1 },                              description: 'Dried lizard hide, wrapped around the torso. Stylish in a primitive sort of way.' },
  { id: 'mud_coating',         name: 'Hardened Mud Coat',    slot: 'body',      emoji: '🟫', levelReq: 1,  price: 45,  statBonus: { hide: 1, stamina: 1 },                  description: 'Baked mud applied in layers. Insulating. Itchy. Effective.' },
  { id: 'bone_plate',          name: 'Bone Plating',         slot: 'body',      emoji: '🦴', levelReq: 3,  price: 90,  statBonus: { hide: 2, constitution: 1 },             description: 'Actual bones, strapped on for protection. Effective and definitely not cursed.' },
  { id: 'shell_pauldrons',     name: 'Shell Pauldrons',      slot: 'body',      emoji: '🐢', levelReq: 3,  price: 100, statBonus: { hide: 2, stamina: 1 },                  description: 'Shoulder guards made from turtle shells. Grubclaw is proud of the craftsmanship.' },
  { id: 'raptor_hide',         name: 'Raptor Hide Vest',     slot: 'body',      emoji: '🐆', levelReq: 4,  price: 130, statBonus: { hide: 1, agility: 1, constitution: 1 }, description: 'Surprisingly light for its protection. The raptor was fast. The armor carries that energy.' },
  { id: 'croc_armor',          name: 'Croc Scale Armor',     slot: 'body',      emoji: '🐊', levelReq: 6,  price: 200, statBonus: { hide: 3, constitution: 2, agility: -1 }, description: 'Heavy. Smells faintly of swamp. The protection is worth it.' },
  { id: 'spine_plate',         name: 'Stego Spine Plate',    slot: 'body',      emoji: '🦔', levelReq: 7,  price: 260, statBonus: { hide: 3, ferocity: 1, constitution: 2 }, description: 'Plates from a Stegosaurus. Grubclaw added extra spikes. He didn\'t need to.' },
  { id: 'ember_plate',         name: 'Ember Plate',          slot: 'body',      emoji: '🌋', levelReq: 9,  price: 400, statBonus: { hide: 4, constitution: 2, ferocity: 1, agility: -1 }, description: 'Forged from volcanic scales. Hot to the touch. You get used to it.' },
  { id: 'rex_hide_armor',      name: 'Rex Hide Full Armor',  slot: 'body',      emoji: '🦖', levelReq: 10, price: 520, statBonus: { hide: 5, constitution: 3, agility: -1 }, description: 'Rex hide, bone-riveted, heat-treated. Grubclaw won\'t say how many fingers he lost making this.' },

  // ── Head (helmets, horns, masks) ──────────────────────────────────────────
  { id: 'war_paint',           name: 'War Paint',            slot: 'head',      emoji: '🎨', levelReq: 1,  price: 35,  statBonus: { roar: 1, ferocity: 1 },                 description: 'Made from berries and intimidation. Looks terrifying. Is terrifying.' },
  { id: 'war_horn',            name: 'War Horn',             slot: 'head',      emoji: '📯', levelReq: 4,  price: 140, statBonus: { roar: 2, ferocity: 1, strength: 1 },    description: 'Strapped to your head. Increases gore damage. Looks absolutely insane.' },
  { id: 'predator_mask',       name: 'Predator Mask',        slot: 'head',      emoji: '🎭', levelReq: 5,  price: 170, statBonus: { roar: 1, ferocity: 2, cunning: 1 },     description: 'A carved skull mask. The crowd always reacts. Your opponent usually does too.' },
  { id: 'warlord_crest',       name: "Warlord's Crest",      slot: 'head',      emoji: '👑', levelReq: 10, price: 450, statBonus: { roar: 3, ferocity: 2, cunning: 2 },     description: 'Worn by the greatest arena champions. Grubclaw found it. He will not say where.' },

  // ── Tail (tail weapons, attachments) ──────────────────────────────────────
  { id: 'tail_wrap',           name: 'Spiked Tail Wrap',     slot: 'tail',      emoji: '🌵', levelReq: 1,  price: 35,  statBonus: { strength: 1, cunning: 1 },              description: 'Spikes bound to the tail. More of a deterrent than a weapon. Still counts.' },
  { id: 'tail_spike',          name: 'Iron Tail Spike',      slot: 'tail',      emoji: '📌', levelReq: 4,  price: 120, statBonus: { strength: 2, cunning: 2 },              description: 'A hardened iron spike strapped to the tail. Hits things behind you. Counts double.' },
  { id: 'tail_blade',          name: 'Champion Tail Blade',  slot: 'tail',      emoji: '⚡', levelReq: 7,  price: 240, statBonus: { strength: 3, cunning: 2, stamina: 1 },  description: 'A sharpened plate bolted to the tail. Grubclaw\'s finest attachment work. Do not ask about the installation process.' },
  { id: 'stego_tailclub',      name: 'Stego Tail Club',      slot: 'tail',      emoji: '🔨', levelReq: 9,  price: 380, statBonus: { strength: 4, cunning: 2, ferocity: 1 }, description: 'A genuine Stegosaurus tail club. Repurposed. The Stegosaurus had some strong feelings about this.' },

  // ── Accessory (charms, totems, necklaces) ─────────────────────────────────
  { id: 'lucky_fossil',        name: 'Lucky Fossil',         slot: 'accessory', emoji: '🪨', levelReq: 1,  price: 20,  statBonus: { cunning: 1 },                           description: 'A fossil of something that clearly did NOT survive. Lucky.' },
  { id: 'sinew_brace',         name: 'Sinew Brace',          slot: 'accessory', emoji: '🪢', levelReq: 1,  price: 35,  statBonus: { stamina: 1, agility: 1 },               description: 'Tight wrapping around the limbs. Improves endurance and reaction time.' },
  { id: 'claw_sharpener',      name: 'Claw Sharpener',       slot: 'accessory', emoji: '💍', levelReq: 2,  price: 60,  statBonus: { jaw: 1, ferocity: 1 },                  description: 'A ring fitted with a whetstone edge. Your natural weapons stay sharp.' },
  { id: 'stamina_totem',       name: 'Stamina Totem',        slot: 'accessory', emoji: '🪆', levelReq: 4,  price: 120, statBonus: { stamina: 2, constitution: 1 },          description: 'A carved idol of a dinosaur not getting tired. Inspirational.' },
  { id: 'speed_anklet',        name: 'Swiftbone Anklet',     slot: 'accessory', emoji: '💨', levelReq: 4,  price: 110, statBonus: { agility: 2, cunning: 1 },               description: 'Lightweight bones strung around the ankle. Opponents notice the difference.' },
  { id: 'alpha_fang_necklace', name: 'Alpha Fang Necklace',  slot: 'accessory', emoji: '🦴', levelReq: 7,  price: 250, statBonus: { roar: 2, ferocity: 2, cunning: 1 },     description: 'A trophy fang on a sinew cord. Other dinosaurs notice it. They do not comment.' },
  { id: 'volcano_shard',       name: 'Volcano Shard Charm',  slot: 'accessory', emoji: '🌋', levelReq: 8,  price: 300, statBonus: { ferocity: 3, strength: 1, roar: 1 },    description: 'A fragment of cooled lava, somehow still warm. Makes the wearer angrier.' },
  { id: 'warlord_totem',       name: "Warlord's Totem",      slot: 'accessory', emoji: '⚔️', levelReq: 10, price: 420, statBonus: { stamina: 3, constitution: 2, cunning: 2 }, description: 'A carved totem carried by legendary fighters. The carvings depict things best not examined closely.' },
]

export function getSpeciesById(id: string): Species | undefined {
  return SPECIES.find(s => s.id === id)
}

export function computeStats(base: Stats, gear: GearTemplate[]): Stats {
  const result = { ...base }
  for (const item of gear) {
    for (const [key, val] of Object.entries(item.statBonus)) {
      result[key as StatKey] = (result[key as StatKey] || 0) + (val || 0)
    }
  }
  return result
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.6))
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function maxHp(constitution: number): number {
  return 50 + constitution * 10
}

export type TavernItemEffect =
  | { type: 'heal'; amount: number }
  | { type: 'xp'; amount: number }
  | { type: 'buff'; stat: StatKey; bonus: number; label: string }

export interface TavernItem {
  id: string
  name: string
  emoji: string
  description: string
  price: number
  effects: TavernItemEffect[]
  statReq?: Partial<Record<StatKey, number>>
  flavorText: string
}

export const TAVERN_ITEMS: TavernItem[] = [
  // ── Tier 1: No requirements ───────────────────────────────────────────────
  {
    id: 'healing_salve',
    name: 'Healing Salve',
    emoji: '🩹',
    description: 'Restores 35 HP immediately. Applied externally. Results vary.',
    price: 25,
    effects: [{ type: 'heal', amount: 35 }],
    flavorText: '"What\'s in it?" "Mud. Some berries. Focus on the healing."',
  },
  {
    id: 'fern_juice_large',
    name: 'Large Fern Juice',
    emoji: '🧃',
    description: 'Restores 60 HP immediately. The large size. Worth the dignity cost.',
    price: 45,
    effects: [{ type: 'heal', amount: 60 }],
    flavorText: 'Comes in a large leaf. You drink the whole leaf.',
  },
  {
    id: 'rage_berries',
    name: 'Rage Berries',
    emoji: '🍇',
    description: 'Eat before your next fight for +3 Strength. Tastes like anger.',
    price: 40,
    effects: [{ type: 'buff', stat: 'strength', bonus: 3, label: 'Rage Berries' }],
    flavorText: 'Side effects include: rage.',
  },
  {
    id: 'focus_fungus',
    name: 'Focus Fungus',
    emoji: '🍄',
    description: '+3 Cunning for your next fight. Do not ask where it was found.',
    price: 40,
    effects: [{ type: 'buff', stat: 'cunning', bonus: 3, label: 'Focus Fungus' }],
    flavorText: '"Found it near the swamp," says the vendor. "The glowing part is normal."',
  },
  {
    id: 'swift_tea',
    name: 'Swift Legs Tea',
    emoji: '🍵',
    description: '+3 Agility for your next fight. Brewed from roots and nervous energy.',
    price: 40,
    effects: [{ type: 'buff', stat: 'agility', bonus: 3, label: 'Swift Tea' }],
    flavorText: 'Makes your legs jittery. Channeled correctly, this is useful.',
  },
  {
    id: 'iron_hide_paste',
    name: 'Iron Hide Paste',
    emoji: '🪵',
    description: '+3 Hide for your next fight. Applied like paint. Smells like wet rock.',
    price: 40,
    effects: [{ type: 'buff', stat: 'hide', bonus: 3, label: 'Iron Hide Paste' }],
    flavorText: 'Hardens on contact with air. Do not apply to face.',
  },
  {
    id: 'stamina_brew',
    name: 'Stamina Brew',
    emoji: '⚗️',
    description: '+3 Stamina for your next fight. Thick. Brown. Difficult to describe further.',
    price: 40,
    effects: [{ type: 'buff', stat: 'stamina', bonus: 3, label: 'Stamina Brew' }],
    flavorText: 'The vendor says it\'s made from "old things." You decide that\'s enough information.',
  },
  {
    id: 'war_drum',
    name: 'Pre-Fight War Drum',
    emoji: '🥁',
    description: 'Someone drums on a hollow log for you. +3 Ferocity next fight. The crowd loves it.',
    price: 50,
    effects: [{ type: 'buff', stat: 'ferocity', bonus: 3, label: 'War Drum' }],
    flavorText: 'Available by appointment. Or just by asking loudly.',
  },
  {
    id: 'intimidation_practice',
    name: 'Intimidation Coaching',
    emoji: '😤',
    description: 'A retired arena veteran teaches you to roar properly. +3 Roar next fight.',
    price: 55,
    effects: [{ type: 'buff', stat: 'roar', bonus: 3, label: 'Intimidation Coaching' }],
    flavorText: '"From the gut," says the veteran. "No — deeper. DEEPER."',
  },
  {
    id: 'jaw_exercise',
    name: 'Jaw Strengthening Kit',
    emoji: '🦷',
    description: 'A rock on a string. You bite it. +3 Jaw next fight. Unconventional but effective.',
    price: 45,
    effects: [{ type: 'buff', stat: 'jaw', bonus: 3, label: 'Jaw Training' }],
    flavorText: 'The rock has bite marks from previous customers. This is either reassuring or concerning.',
  },
  {
    id: 'constitution_meal',
    name: "Healer's Meal",
    emoji: '🍖',
    description: 'A large, nutritious meal prepared by the healer. +2 Constitution next fight.',
    price: 60,
    effects: [{ type: 'buff', stat: 'constitution', bonus: 2, label: "Healer's Meal" }],
    flavorText: 'Technically medicine. Also technically a meal. Mostly medicine.',
  },
  {
    id: 'veterans_story',
    name: "Veteran's War Story",
    emoji: '📖',
    description: 'Buy an old gladiator a drink and listen to their stories. Gain 60 XP.',
    price: 70,
    effects: [{ type: 'xp', amount: 60 }],
    flavorText: '"And THAT\'s when I bit the referee. Now, where was I..." — two hours later',
  },

  // ── Tier 2: Single stat ≥ 7 required ──────────────────────────────────────
  {
    id: 'berserker_brew',
    name: 'Berserker Brew',
    emoji: '🩸',
    description: '+5 Strength +2 Ferocity next fight. For fighters who have committed to the bit.',
    price: 90,
    effects: [
      { type: 'buff', stat: 'strength', bonus: 5, label: 'Berserker Brew' },
      { type: 'buff', stat: 'ferocity', bonus: 2, label: 'Berserker Brew' },
    ],
    statReq: { strength: 7 },
    flavorText: 'Thick red liquid. You don\'t ask what\'s in it. You can feel it working immediately.',
  },
  {
    id: 'shadow_oil',
    name: 'Shadow Oil',
    emoji: '🌑',
    description: '+5 Agility +2 Cunning next fight. Applied to the joints. Feels wrong. Works great.',
    price: 90,
    effects: [
      { type: 'buff', stat: 'agility', bonus: 5, label: 'Shadow Oil' },
      { type: 'buff', stat: 'cunning', bonus: 2, label: 'Shadow Oil' },
    ],
    statReq: { agility: 7 },
    flavorText: 'The vendor applies it in the dark. This is apparently required.',
  },
  {
    id: 'tortoise_shell_tonic',
    name: 'Shell Hardener Tonic',
    emoji: '🐢',
    description: '+5 Hide +2 Constitution next fight. Your skin hardens. Temporarily. Probably.',
    price: 90,
    effects: [
      { type: 'buff', stat: 'hide', bonus: 5, label: 'Shell Tonic' },
      { type: 'buff', stat: 'constitution', bonus: 2, label: 'Shell Tonic' },
    ],
    statReq: { hide: 7 },
    flavorText: 'Made from a tortoise shell. The tortoise was not consulted.',
  },
  {
    id: 'endurance_elixir',
    name: 'Endurance Elixir',
    emoji: '💪',
    description: '+5 Stamina +3 Constitution next fight. For fights that go to round 15.',
    price: 90,
    effects: [
      { type: 'buff', stat: 'stamina', bonus: 5, label: 'Endurance Elixir' },
      { type: 'buff', stat: 'constitution', bonus: 3, label: 'Endurance Elixir' },
    ],
    statReq: { stamina: 7 },
    flavorText: '"Drink it slowly," says the healer. You drink it immediately. She sighs.',
  },
  {
    id: 'apex_jaw_grease',
    name: 'Apex Jaw Grease',
    emoji: '⚙️',
    description: '+5 Jaw +2 Strength next fight. Your bite force enters another category.',
    price: 95,
    effects: [
      { type: 'buff', stat: 'jaw', bonus: 5, label: 'Jaw Grease' },
      { type: 'buff', stat: 'strength', bonus: 2, label: 'Jaw Grease' },
    ],
    statReq: { jaw: 7 },
    flavorText: 'Technically a lubricant. Technically not for internal use. The vendor does not clarify.',
  },
  {
    id: 'bloodlust_ritual',
    name: 'Bloodlust Ritual',
    emoji: '🔥',
    description: '+5 Ferocity +3 Strength next fight. The ritual takes twelve minutes. Worth every second.',
    price: 100,
    effects: [
      { type: 'buff', stat: 'ferocity', bonus: 5, label: 'Bloodlust Ritual' },
      { type: 'buff', stat: 'strength', bonus: 3, label: 'Bloodlust Ritual' },
    ],
    statReq: { ferocity: 7 },
    flavorText: 'A shaman lights something on fire. You are briefly the fire. Then you are ready.',
  },
  {
    id: 'ancient_knowledge',
    name: 'Ancient Knowledge Scroll',
    emoji: '📜',
    description: '+5 Cunning +3 Agility next fight. You study the scroll. Somehow this works.',
    price: 100,
    effects: [
      { type: 'buff', stat: 'cunning', bonus: 5, label: 'Ancient Scroll' },
      { type: 'buff', stat: 'agility', bonus: 3, label: 'Ancient Scroll' },
    ],
    statReq: { cunning: 7 },
    flavorText: 'The scroll is very old. The handwriting is unreadable. A veteran translates, grudgingly.',
  },
  {
    id: 'monster_roar_ritual',
    name: 'Monster Roar Ritual',
    emoji: '📣',
    description: '+5 Roar +2 Ferocity next fight. Full ceremony. The tavern evacuates briefly.',
    price: 95,
    effects: [
      { type: 'buff', stat: 'roar', bonus: 5, label: 'Monster Roar' },
      { type: 'buff', stat: 'ferocity', bonus: 2, label: 'Monster Roar' },
    ],
    statReq: { roar: 7 },
    flavorText: 'The shaman plugs their ears first. This is a warning sign you choose to ignore.',
  },
  {
    id: 'champions_broth',
    name: "Champion's Healing Broth",
    emoji: '🍲',
    description: 'Full heal + +3 Constitution next fight. Req: Constitution ≥ 7.',
    price: 110,
    effects: [
      { type: 'heal', amount: 9999 },
      { type: 'buff', stat: 'constitution', bonus: 3, label: "Champion's Broth" },
    ],
    statReq: { constitution: 7 },
    flavorText: 'A full heal and a buff, for those who have invested accordingly. The bowl is enormous.',
  },

  // ── Tier 3: Two stat requirements ─────────────────────────────────────────
  {
    id: 'warlord_tonic',
    name: "Warlord's Tonic",
    emoji: '⚔️',
    description: '+6 Strength +4 Ferocity +2 Jaw next fight. Req: Strength ≥ 8 + Ferocity ≥ 8.',
    price: 160,
    effects: [
      { type: 'buff', stat: 'strength', bonus: 6, label: "Warlord's Tonic" },
      { type: 'buff', stat: 'ferocity', bonus: 4, label: "Warlord's Tonic" },
      { type: 'buff', stat: 'jaw', bonus: 2, label: "Warlord's Tonic" },
    ],
    statReq: { strength: 8, ferocity: 8 },
    flavorText: 'Only for those who have earned the right to drink it. The shaman checks your stats first.',
  },
  {
    id: 'phantom_stance',
    name: 'Phantom Stance Training',
    emoji: '👁️',
    description: '+6 Agility +4 Cunning +2 Ferocity next fight. Req: Agility ≥ 8 + Cunning ≥ 8.',
    price: 160,
    effects: [
      { type: 'buff', stat: 'agility', bonus: 6, label: 'Phantom Stance' },
      { type: 'buff', stat: 'cunning', bonus: 4, label: 'Phantom Stance' },
      { type: 'buff', stat: 'ferocity', bonus: 2, label: 'Phantom Stance' },
    ],
    statReq: { agility: 8, cunning: 8 },
    flavorText: 'An hour of training in total silence. The trainer communicates entirely through gestures.',
  },
  {
    id: 'ironback_ritual',
    name: 'Ironback Ritual',
    emoji: '🛡️',
    description: '+6 Hide +4 Constitution +2 Stamina next fight. Req: Hide ≥ 8 + Constitution ≥ 8.',
    price: 170,
    effects: [
      { type: 'buff', stat: 'hide', bonus: 6, label: 'Ironback Ritual' },
      { type: 'buff', stat: 'constitution', bonus: 4, label: 'Ironback Ritual' },
      { type: 'buff', stat: 'stamina', bonus: 2, label: 'Ironback Ritual' },
    ],
    statReq: { hide: 8, constitution: 8 },
    flavorText: 'They pour something hot on your scales. It hardens. You do not scream. Much.',
  },
  {
    id: 'apex_predator_rite',
    name: 'Apex Predator Rite',
    emoji: '🦷',
    description: '+6 Jaw +4 Ferocity +2 Strength next fight. Req: Jaw ≥ 8 + Ferocity ≥ 8.',
    price: 170,
    effects: [
      { type: 'buff', stat: 'jaw', bonus: 6, label: 'Apex Predator Rite' },
      { type: 'buff', stat: 'ferocity', bonus: 4, label: 'Apex Predator Rite' },
      { type: 'buff', stat: 'strength', bonus: 2, label: 'Apex Predator Rite' },
    ],
    statReq: { jaw: 8, ferocity: 8 },
    flavorText: 'A ritual for those whose mouth is their primary weapon. The ceremony involves a lot of biting.',
  },
  {
    id: 'terrifying_presence',
    name: 'Terrifying Presence Ritual',
    emoji: '💀',
    description: '+6 Roar +4 Cunning +2 Ferocity next fight. Req: Roar ≥ 8 + Cunning ≥ 7.',
    price: 175,
    effects: [
      { type: 'buff', stat: 'roar', bonus: 6, label: 'Terrifying Presence' },
      { type: 'buff', stat: 'cunning', bonus: 4, label: 'Terrifying Presence' },
      { type: 'buff', stat: 'ferocity', bonus: 2, label: 'Terrifying Presence' },
    ],
    statReq: { roar: 8, cunning: 7 },
    flavorText: 'The ritual involves both screaming and silence. The combination is the point.',
  },

  // ── Tier 4: Premium (high requirements) ───────────────────────────────────
  {
    id: 'grand_feast',
    name: 'Grand Pre-Fight Feast',
    emoji: '🎉',
    description: 'Full heal + +2 Strength + +2 Constitution next fight. Expensive. Worth it.',
    price: 180,
    effects: [
      { type: 'heal', amount: 9999 },
      { type: 'buff', stat: 'strength', bonus: 2, label: 'Grand Feast' },
      { type: 'buff', stat: 'constitution', bonus: 2, label: 'Grand Feast' },
    ],
    flavorText: 'The tavern puts on a spread. Other patrons watch jealously. You feel like a champion already.',
  },
  {
    id: 'legendary_roar_ceremony',
    name: 'Legendary Roar Ceremony',
    emoji: '🌩️',
    description: '+8 Roar +5 Ferocity next fight. Req: Roar ≥ 9 + Ferocity ≥ 8. Shake the arena.',
    price: 280,
    effects: [
      { type: 'buff', stat: 'roar', bonus: 8, label: 'Legendary Roar' },
      { type: 'buff', stat: 'ferocity', bonus: 5, label: 'Legendary Roar' },
    ],
    statReq: { roar: 9, ferocity: 8 },
    flavorText: 'The last fighter to complete this ceremony cracked a wall. The wall remains cracked.',
  },
  {
    id: 'death_grip_training',
    name: 'Death Grip Training',
    emoji: '💢',
    description: '+8 Jaw +5 Strength next fight. Req: Jaw ≥ 9 + Strength ≥ 9. Pure violence.',
    price: 320,
    effects: [
      { type: 'buff', stat: 'jaw', bonus: 8, label: 'Death Grip' },
      { type: 'buff', stat: 'strength', bonus: 5, label: 'Death Grip' },
    ],
    statReq: { jaw: 9, strength: 9 },
    flavorText: 'Four hours. A boulder. Several trainers. You bite the boulder until you feel it yield.',
  },
  {
    id: 'apex_phantom',
    name: 'Apex Phantom Method',
    emoji: '🌀',
    description: '+8 Agility +6 Cunning next fight. Req: Agility ≥ 10 + Cunning ≥ 9. Ghost mode.',
    price: 350,
    effects: [
      { type: 'buff', stat: 'agility', bonus: 8, label: 'Apex Phantom' },
      { type: 'buff', stat: 'cunning', bonus: 6, label: 'Apex Phantom' },
    ],
    statReq: { agility: 10, cunning: 9 },
    flavorText: 'A training method so advanced the trainer won\'t describe it. You learn by watching. Then you move like smoke.',
  },
  {
    id: 'champions_feast',
    name: "Champion's Full Preparation",
    emoji: '👑',
    description: 'Full heal + +5 Constitution + +4 Stamina next fight. Req: Constitution ≥ 9 + Stamina ≥ 8.',
    price: 300,
    effects: [
      { type: 'heal', amount: 9999 },
      { type: 'buff', stat: 'constitution', bonus: 5, label: "Champion's Prep" },
      { type: 'buff', stat: 'stamina', bonus: 4, label: "Champion's Prep" },
    ],
    statReq: { constitution: 9, stamina: 8 },
    flavorText: 'Reserved for those who have built their body for endurance. The healer looks genuinely impressed.',
  },
]

export interface TavernQuest {
  id: string
  prompt: string
  acceptLabel: string
  declineLabel: string
  acceptOutcome: string
  declineOutcome: string
  // positive = gain, negative = lose
  bonesDelta?: number
  hpDelta?: number
  xpDelta?: number
}

export const TAVERN_QUESTS: TavernQuest[] = [
  {
    id: 'drunk_bet',
    prompt: 'A heavily intoxicated Stegosaurus challenges you to an arm-wrestling contest. It has no arms. It is very confident anyway.',
    acceptLabel: 'Accept the challenge',
    declineLabel: 'Quietly walk away',
    acceptOutcome: 'You win by default. The Stegosaurus tips over. You find 30 bones in its unattended bag. Nobody saw anything.',
    declineOutcome: 'You walk away. The Stegosaurus calls you a coward. You do not engage. You are correct.',
    bonesDelta: 30,
  },
  {
    id: 'suspicious_meat',
    prompt: 'A cloaked figure offers you a piece of "mystery meat." It smells unusual. The figure is sweating more than seems appropriate.',
    acceptLabel: 'Eat the mystery meat',
    declineLabel: 'Decline politely',
    acceptOutcome: 'It tastes fine, actually. You feel strangely energised. +25 XP and a story you can tell later.',
    declineOutcome: 'You decline. The figure looks relieved. This was probably the right call.',
    xpDelta: 25,
  },
  {
    id: 'suspicious_meat_bad',
    prompt: 'A different cloaked figure — or possibly the same one — offers you another piece of "mystery meat." The smell is worse this time.',
    acceptLabel: 'Eat it anyway',
    declineLabel: 'Hard pass',
    acceptOutcome: 'That was a mistake. You spend the next hour regretting your choices. -20 HP.',
    declineOutcome: 'You decline. A nearby Raptor accepts it instead. It does not go well for the Raptor.',
    hpDelta: -20,
  },
  {
    id: 'lost_bones',
    prompt: 'An elderly Pterodactyl claims you dropped some bones earlier. They are holding 40 bones. You did not drop any bones.',
    acceptLabel: 'Take the bones — they\'re mine apparently',
    declineLabel: 'Refuse on principle',
    acceptOutcome: 'You take the bones. The Pterodactyl winks. You don\'t think about it too hard. +40 bones.',
    declineOutcome: 'You refuse. The Pterodactyl shrugs and pockets them again. You feel morally superior. It doesn\'t pay well.',
    bonesDelta: 40,
  },
  {
    id: 'bar_fight',
    prompt: 'Two Velociraptors are arguing loudly next to you. One of them accidentally elbows you. Both of them look at you.',
    acceptLabel: 'Get involved',
    declineLabel: 'Move to a different table',
    acceptOutcome: 'You throw one Raptor across the room. The other applauds. Everyone buys you a drink. +15 bones, but -10 HP.',
    declineOutcome: 'You relocate. The Raptors resolve their dispute by knocking over a table. You watch from a safe distance.',
    bonesDelta: 15,
    hpDelta: -10,
  },
  {
    id: 'gamble',
    prompt: 'A smooth-talking Ankylosaurus invites you to a game of "Bone Toss." The rules are unclear. The stakes are 50 bones.',
    acceptLabel: 'Toss some bones',
    declineLabel: 'Decline the gamble',
    acceptOutcome: 'You win. The Ankylosaurus accuses you of cheating. You did not cheat. You pocket 60 bones and leave quickly.',
    declineOutcome: 'You decline. The Ankylosaurus finds another victim immediately. You feel wise.',
    bonesDelta: 60,
  },
  {
    id: 'gamble_bad',
    prompt: 'The same Ankylosaurus is back, looking more confident this time. "Double or nothing," it says.',
    acceptLabel: 'Double or nothing',
    declineLabel: 'Not this time',
    acceptOutcome: 'You lose. Badly. -50 bones and your dignity. The Ankylosaurus was definitely cheating.',
    declineOutcome: 'You decline. The Ankylosaurus looks disappointed. You survived.',
    bonesDelta: -50,
  },
  {
    id: 'help_traveller',
    prompt: 'A lost young Triceratops asks for directions to the Bone Pit. You don\'t really know either, but it looks desperate.',
    acceptLabel: 'Make up some directions confidently',
    declineLabel: 'Admit you don\'t know',
    acceptOutcome: 'It believes you completely and leaves. Ten minutes later it returns having found the place. Grateful, it leaves you 25 bones.',
    declineOutcome: 'It thanks you for your honesty. You feel good about yourself. That\'s free.',
    bonesDelta: 25,
  },
  {
    id: 'spilled_drink',
    prompt: 'A large T-Rex bumps into you, spilling your drink. It stares at you. The bar goes quiet.',
    acceptLabel: 'Stare back',
    declineLabel: 'Laugh it off',
    acceptOutcome: 'Incredibly, it backs down. The crowd is impressed. You gain 20 XP for pure nerve.',
    declineOutcome: 'You laugh. It laughs. Crisis averted. You each buy the other a drink. -10 bones, but worth it.',
    xpDelta: 20,
  },
  {
    id: 'heist',
    prompt: 'A shady Raptor whispers that it knows where a merchant keeps a stash of bones unguarded. "50/50 split," it says.',
    acceptLabel: 'Join the heist',
    declineLabel: 'Want no part of this',
    acceptOutcome: 'The heist goes perfectly. You get 70 bones. The Raptor disappears with the other 70. You decide not to think about it.',
    declineOutcome: 'You decline. An hour later the Raptor is escorted out by arena security, covered in mud. Good call.',
    bonesDelta: 70,
  },
  {
    id: 'healer_advice',
    prompt: 'The tavern healer pulls you aside. "You look tired," they say. "I can patch you up quick for free. Experimental treatment."',
    acceptLabel: 'Accept the experimental treatment',
    declineLabel: 'Politely decline',
    acceptOutcome: 'It works surprisingly well. +30 HP. The healer seems as surprised as you are.',
    declineOutcome: 'You decline. The healer nods sagely. "Wise," they say. You\'re not sure if that\'s a compliment.',
    hpDelta: 30,
  },
  {
    id: 'fight_challenge',
    prompt: 'A small but extremely loud Pachycephalosaurus challenges you to a headbutting contest. You do not have a thick skull. It does.',
    acceptLabel: 'Accept the headbutt contest',
    declineLabel: 'Decline with dignity',
    acceptOutcome: 'You lose immediately and spectacularly. -25 HP. The crowd found it very entertaining. You do not.',
    declineOutcome: 'You decline. The Pachycephalosaurus finds someone else. You hear a loud crack from across the tavern. You made the right call.',
    hpDelta: -25,
  },
]
