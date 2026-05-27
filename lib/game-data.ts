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
  { key: 'jaw',          label: 'Jaw',           emoji: '🦷', description: 'Critical hit multiplier. Does nothing on normal hits — but the higher your jaw, the more catastrophic your crits become. Pairs well with Ferocity.' },
  { key: 'cunning',      label: 'Cunning',       emoji: '🧠', description: 'Counter-attack and trap chance. Intelligence is a weapon too, apparently.' },
  { key: 'roar',         label: 'Roar',          emoji: '📢', description: 'Pre-fight intimidation. Can rattle the opponent and reduce their effective Daring.' },
]

export type Stats = Record<StatKey, number>

export interface SpeciesPassive {
  name: string
  description: string
}

export interface Species {
  id: string
  name: string
  tagline: string
  flavor: string
  emoji: string
  image: string
  baseStats: Partial<Stats>
  bonusPoints: number
  passive: SpeciesPassive
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
    bonusPoints: 5,
    passive: { name: 'Last Stand', description: 'When HP drops below 25%, deal 40% more damage.' },
  },
  {
    id: 'velociraptor',
    name: 'Velociraptor',
    tagline: 'Smart. Fast. Deeply unhinged.',
    flavor: 'Smaller than the movies suggested. Makes up for it by being absolutely everywhere at once and having opinions about everything.',
    emoji: '🐆',
    image: '/images/species/velociraptor.png',
    baseStats: { agility: 2, cunning: 1, constitution: -2, hide: -1 },
    bonusPoints: 5,
    passive: { name: 'Pack Tactics', description: 'Every 3rd consecutive hit (no misses) deals double damage.' },
  },
  {
    id: 'triceratops',
    name: 'Triceratops',
    tagline: 'A tank. With horns on its face.',
    flavor: 'Three horns. Excellent defense. Moves like a furniture delivery truck but hits like one too. The accountant of the dinosaur world — boring until it gores you.',
    emoji: '🦏',
    image: '/images/species/triceratops.png',
    baseStats: { hide: 2, constitution: 1, agility: -2, cunning: -1 },
    bonusPoints: 5,
    passive: { name: 'Brace', description: 'Once per fight, automatically halve an incoming hit that would deal more than 20% of max HP.' },
  },
  {
    id: 'ankylosaurus',
    name: 'Ankylosaurus',
    tagline: 'Effectively a boulder with opinions.',
    flavor: 'Nearly impenetrable armor. A tail club that has ended careers. So slow that opponents sometimes get bored and lose. This is considered a strategy.',
    emoji: '🪨',
    image: '/images/species/ankylosaurus.png',
    baseStats: { hide: 3, constitution: 1, agility: -3, ferocity: -1 },
    bonusPoints: 5,
    passive: { name: 'Thorns', description: 'When struck by a critical hit, the attacker takes 15% of that damage back.' },
  },
  {
    id: 'spinosaurus',
    name: 'Spinosaurus',
    tagline: 'Aquatic. Mysterious. Confident about the fin.',
    flavor: 'Part fish, part killing machine, entirely certain that the sail on its back is cool actually. Has never explained why. Nobody asks twice.',
    emoji: '🐊',
    image: '/images/species/spinosaurus.png',
    baseStats: { strength: 1, stamina: 1, jaw: 1, roar: -1, cunning: -1 },
    bonusPoints: 5,
    passive: { name: 'Momentum', description: '+10% damage per consecutive round with a successful hit, stacking up to 3×. Resets on miss.' },
  },
  {
    id: 'pterodactyl',
    name: 'Pterodactyl',
    tagline: 'Technically not a dinosaur. Brings it up constantly.',
    flavor: 'Agile, clever, and insufferable at parties. Keeps a blog about pterosaur taxonomy. Hits like a wet fern but will absolutely dodge everything you throw.',
    emoji: '🦅',
    image: '/images/species/pterodactyl.png',
    baseStats: { agility: 2, cunning: 1, strength: -2, constitution: -1 },
    bonusPoints: 5,
    passive: { name: 'Evasion', description: 'Once per fight, automatically dodge a hit that would drop HP below 20%.' },
  },
  {
    id: 'pachycephalosaurus',
    name: 'Pachycephalosaurus',
    tagline: 'Literally just headbutts things. Elite.',
    flavor: 'A 10-inch dome of solid bone on top of an already thick skull. Scientists believe it used this for combat. Scientists are correct. Has never once used words when a headbutt would do.',
    emoji: '🐏',
    image: '/images/species/pachycephalosaurus.png',
    baseStats: { strength: 2, ferocity: 1, cunning: -2, agility: -1 },
    bonusPoints: 5,
    passive: { name: 'Headbutt', description: 'First attack of every fight always hits and ignores all armor.' },
  },
  {
    id: 'stegosaurus',
    name: 'Stegosaurus',
    tagline: 'Spiked tail. Walnut-sized brain. Peak performance.',
    flavor: 'The plates on its back serve no known offensive function. The tail spikes serve a very clear offensive function. Focus on the tail.',
    emoji: '🦔',
    image: '/images/species/stegosaurus.png',
    baseStats: { hide: 1, constitution: 1, jaw: 1, cunning: -2, roar: -1 },
    bonusPoints: 5,
    passive: { name: 'Tail Club', description: 'Successful counter-attacks deal an additional 15 flat damage.' },
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

export const STAT_POOL = 5
export const STAT_MAX = 50

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
  image?: string
  description: string
  level: number
  stats: Stats
  xpReward: number
  bonesReward: [number, number]
  deathQuip: string
  town?: number
}

export interface TownDefinition {
  id: number
  name: string
  subtitle: string
  levelReq: number
  statFocus: StatKey[]
  description: string
  flavor: string
  mapPosition: { x: number; y: number }
  tavernKeeper: string
  keeperEmoji: string
  locations: {
    training: string
    arena: string
    tavern: string
    gear: string
  }
  banner: string
}

export const TOWNS: TownDefinition[] = [
  {
    id: 1,
    name: 'The Gulch',
    subtitle: 'The Frontier Arena',
    levelReq: 1,
    statFocus: ['strength', 'agility', 'constitution'],
    description: 'Where careers begin and most of them end. A mud-soaked pit at the edge of the known world, presided over by Grubclaw with three functioning fingers and no patience for excuses.',
    flavor: 'They say the soil around the arena is darker than it should be. Grubclaw says it\'s compost. Nobody argues with Grubclaw.',
    mapPosition: { x: 18, y: 72 },
    tavernKeeper: 'Grubclaw',
    keeperEmoji: '🦕',
    locations: { training: 'The Bone Pit', arena: 'The Colosseum', tavern: "Grubclaw's", gear: 'The Smithy' },
    banner: '/images/gulch-banner.png',
  },
  {
    id: 2,
    name: 'The Ashpit',
    subtitle: 'Volcanic Crater Arena',
    levelReq: 14,
    statFocus: ['ferocity', 'jaw', 'roar'],
    description: 'Built inside an active volcanic crater because someone decided geography was for cowards. Fighters who reach The Ashpit have survived enough to stop flinching. The ones who haven\'t don\'t last the first round.',
    flavor: 'The arena floor is warm. Not uncomfortably warm. Just warm enough that you never fully forget what\'s underneath it.',
    mapPosition: { x: 77, y: 20 },
    tavernKeeper: 'Scorcha',
    keeperEmoji: '🔥',
    locations: { training: 'The Slag Run', arena: 'The Caldera', tavern: "Scorcha's", gear: 'The Forge' },
    banner: '/images/ashpit-banner.png',
  },
  {
    id: 3,
    name: 'The Murkfen',
    subtitle: 'The Sunken Arena',
    levelReq: 28,
    statFocus: ['cunning', 'agility', 'stamina'],
    description: 'A fighting circuit carved into the deep swamp — platforms over dark water, fog that never fully lifts, and opponents who have spent years learning how to disappear into both. Speed and guile win here. Strength alone is just a slower way to drown.',
    flavor: 'The Murkfen has a rule: whatever falls into the water during a fight stays there. This applies to weapons, equipment, and fighters. Nobody disputes it.',
    mapPosition: { x: 73, y: 74 },
    tavernKeeper: 'Brine',
    keeperEmoji: '🐸',
    locations: { training: 'The Sinkhole', arena: 'The Bog Bowl', tavern: "Brine's", gear: 'The Murk Market' },
    banner: '/images/murkfen-banner.png',
  },
  {
    id: 4,
    name: 'The Hollow Crown',
    subtitle: 'The Summit Arena',
    levelReq: 42,
    statFocus: ['strength', 'constitution', 'hide'],
    description: 'The highest arena in the known world, built into a glacial peak where the air is thin and the standards are not. Only fighters who have proven themselves across multiple arenas reach the Hollow Crown. Most of them find it was worth the climb. The ones who don\'t don\'t get to say so.',
    flavor: 'The cold here is not weather. It\'s judgment.',
    mapPosition: { x: 33, y: 22 },
    tavernKeeper: 'Voryn',
    keeperEmoji: '🏔️',
    locations: { training: 'The Glacier Run', arena: 'The Hollow', tavern: "Voryn's", gear: 'The Vault' },
    banner: '/images/hollowcrown-banner.png',
  },
]

export const MOBS: Mob[] = [
  {
    id: 'baby_raptor',
    name: 'Baby Raptor',
    emoji: '🐣',
    image: '/images/mobs/baby_raptor.png',
    description: 'A confused hatchling. It keeps tripping over its own feet.',
    level: 1,
    stats: { strength: 1, agility: 4, constitution: 2, ferocity: 1, hide: 1, stamina: 2, jaw: 1, cunning: 2, roar: 1 },
    xpReward: 20,
    bonesReward: [5, 15],
    deathQuip: 'It lets out a tiny squeak and tips over. You feel like a monster.',
  },
  {
    id: 'marsh_lizard',
    name: 'Marsh Lizard',
    emoji: '🦎',
    image: '/images/mobs/marsh_lizard.png',
    description: 'Big enough to be annoying, small enough to be embarrassing to lose to.',
    level: 2,
    stats: { strength: 2, agility: 3, constitution: 3, ferocity: 2, hide: 2, stamina: 3, jaw: 2, cunning: 1, roar: 1 },
    xpReward: 35,
    bonesReward: [10, 25],
    deathQuip: 'It hisses one final time and retreats into a bush. You check the bush. It\'s gone.',
  },
  {
    id: 'armored_turtle',
    name: 'Armored Turtle',
    emoji: '🐢',
    image: '/images/mobs/armored_turtle.png',
    description: 'Extremely defensive. Extremely patient. Extremely boring to fight.',
    level: 3,
    stats: { strength: 2, agility: 1, constitution: 6, ferocity: 1, hide: 6, stamina: 4, jaw: 2, cunning: 1, roar: 1 },
    xpReward: 50,
    bonesReward: [15, 35],
    deathQuip: 'It slowly retracts into its shell and refuses to come out. You declare victory anyway.',
  },
  {
    id: 'rogue_pachyceph',
    name: 'Rogue Pachycephalosaurus',
    emoji: '🐏',
    image: '/images/mobs/rogue_pachyceph.png',
    description: 'Got kicked out of the herd for excessive headbutting. Has not changed its ways.',
    level: 4,
    stats: { strength: 5, agility: 3, constitution: 4, ferocity: 4, hide: 3, stamina: 3, jaw: 2, cunning: 1, roar: 2 },
    xpReward: 75,
    bonesReward: [20, 45],
    deathQuip: 'It headbutts a rock out of spite and staggers off. The rock is also slightly damaged.',
  },
  {
    id: 'swamp_croc',
    name: 'Ancient Swamp Croc',
    emoji: '🐊',
    image: '/images/mobs/swamp_croc.png',
    description: 'Old. Patient. Has been here longer than you and is deeply resentful about it.',
    level: 5,
    stats: { strength: 5, agility: 2, constitution: 5, ferocity: 3, hide: 5, stamina: 5, jaw: 6, cunning: 3, roar: 2 },
    xpReward: 100,
    bonesReward: [30, 60],
    deathQuip: 'It sinks slowly into the swamp. You get the feeling it will be back. It will be back.',
  },
  {
    id: 'feral_iguanodon',
    name: 'Feral Iguanodon',
    emoji: '🦕',
    image: '/images/mobs/feral_iguanodon.png',
    description: 'Once docile. Not anymore. Something happened in the jungle and it won\'t talk about it.',
    level: 6,
    stats: { strength: 6, agility: 4, constitution: 6, ferocity: 4, hide: 4, stamina: 6, jaw: 3, cunning: 3, roar: 3 },
    xpReward: 130,
    bonesReward: [40, 75],
    deathQuip: 'It staggers back into the treeline, muttering something about the jungle. You don\'t follow.',
  },
  {
    id: 'alpha_raptor',
    name: 'Alpha Raptor',
    emoji: '🦖',
    image: '/images/mobs/alpha_raptor.png',
    description: 'Leader of the pack. The pack has abandoned it for unclear reasons.',
    level: 7,
    stats: { strength: 5, agility: 7, constitution: 5, ferocity: 5, hide: 3, stamina: 5, jaw: 4, cunning: 6, roar: 5 },
    xpReward: 160,
    bonesReward: [55, 100],
    deathQuip: 'It calls for backup. No backup comes. It calls again. Still nothing. It leaves with great dignity.',
  },
  {
    id: 'armored_ankylosaurus',
    name: 'Armored Ankylosaurus',
    emoji: '🛡️',
    image: '/images/mobs/armored_ankylosaurus.png',
    description: 'A walking fortress with a tail club that has ended careers. Extremely rude about it.',
    level: 8,
    stats: { strength: 6, agility: 2, constitution: 10, ferocity: 4, hide: 10, stamina: 7, jaw: 2, cunning: 2, roar: 3 },
    xpReward: 190,
    bonesReward: [65, 115],
    deathQuip: 'Its tail hits the ground one final time — an accident — and it wanders off looking smug.',
  },
  {
    id: 'ceratosaurus',
    name: 'Ceratosaurus',
    emoji: '🦕',
    image: '/images/mobs/ceratosaurus.png',
    description: 'A horned predator with a chip on its shoulder. The horn is not metaphorical.',
    level: 9,
    stats: { strength: 7, agility: 5, constitution: 7, ferocity: 7, hide: 5, stamina: 6, jaw: 6, cunning: 4, roar: 5 },
    xpReward: 220,
    bonesReward: [75, 130],
    deathQuip: 'It charges one final time, misses by three feet, and collapses. Ferocious to the end.',
  },
  {
    id: 'volcanic_rex',
    name: 'Volcanic Rex',
    emoji: '🌋',
    image: '/images/mobs/volcanic_rex.png',
    description: 'Lives near the volcano. Angry about it. Angry about everything.',
    level: 10,
    stats: { strength: 8, agility: 4, constitution: 8, ferocity: 7, hide: 5, stamina: 6, jaw: 8, cunning: 2, roar: 7 },
    xpReward: 260,
    bonesReward: [90, 160],
    deathQuip: 'It collapses with a roar that shakes the ground. A nearby bird, safe at all times, watches judgmentally.',
  },
  {
    id: 'thunder_diplodocus',
    name: 'Thunder Diplodocus',
    emoji: '⚡',
    image: '/images/mobs/thunder_diplodocus.png',
    description: 'Each step shakes the earth. It doesn\'t know you\'re there yet. You\'ll want to run when it does.',
    level: 12,
    stats: { strength: 9, agility: 2, constitution: 12, ferocity: 5, hide: 7, stamina: 10, jaw: 3, cunning: 2, roar: 8 },
    xpReward: 320,
    bonesReward: [110, 190],
    deathQuip: 'It sways, slowly, then falls like a great tree. The resulting crater takes weeks to fill.',
  },
  {
    id: 'bone_stalker',
    name: 'Bone Stalker',
    emoji: '💀',
    image: '/images/mobs/bone_stalker.png',
    description: 'Nobody knows what it is exactly. It hunts alone. It smells like old grief.',
    level: 15,
    stats: { strength: 8, agility: 9, constitution: 8, ferocity: 9, hide: 6, stamina: 8, jaw: 7, cunning: 10, roar: 6 },
    xpReward: 400,
    bonesReward: [140, 240],
    deathQuip: 'It dissolves back into the shadows. A single bone is left behind. You don\'t pick it up.',
  },
  {
    id: 'dread_spinosaurus',
    name: 'Dread Spinosaurus',
    emoji: '🌊',
    image: '/images/mobs/dread_spinosaurus.png',
    description: 'Emerged from the deep delta. The fins on its back are sharp. Its patience is not.',
    level: 20,
    stats: { strength: 11, agility: 6, constitution: 11, ferocity: 10, hide: 8, stamina: 10, jaw: 10, cunning: 6, roar: 9 },
    xpReward: 550,
    bonesReward: [200, 320],
    deathQuip: 'It crashes into the water and vanishes. Somewhere downstream, something is scared.',
  },
  {
    id: 'elder_titanosaur',
    name: 'Elder Titanosaur',
    emoji: '🗿',
    image: '/images/mobs/elder_titanosaur.png',
    description: 'Ancient. Enormous. Has outlived every predator that ever tried this. They all tried this.',
    level: 25,
    stats: { strength: 12, agility: 1, constitution: 18, ferocity: 7, hide: 14, stamina: 15, jaw: 5, cunning: 4, roar: 10 },
    xpReward: 750,
    bonesReward: [280, 430],
    deathQuip: 'It kneels. Slowly. Deliberately. As if it chose this. Maybe it did. The earth shakes for a full minute.',
  },
  {
    id: 'primal_rex',
    name: 'Primal Rex',
    emoji: '👑',
    image: '/images/mobs/primal_rex.png',
    description: 'The apex. The original. Everything else is a lesser copy. It knows.',
    level: 30,
    stats: { strength: 15, agility: 8, constitution: 14, ferocity: 14, hide: 10, stamina: 13, jaw: 14, cunning: 8, roar: 14 },
    xpReward: 1000,
    bonesReward: [380, 580],
    deathQuip: 'It stares at you for a long moment. Then, slowly, it nods. Then it falls. The world feels different after.',
  },

  // ── Town 2 — The Ashpit ───────────────────────────────────────────────────
  {
    id: 'ember_raptor',
    name: 'Ember Raptor',
    emoji: '🔥',
    image: '/images/mobs/ember_raptor.png',
    description: 'Smaller than a standard raptor but runs hot — literally. The heat shimmer makes it hard to track.',
    level: 15,
    stats: { strength: 9, agility: 11, constitution: 8, ferocity: 10, hide: 6, stamina: 9, jaw: 7, cunning: 8, roar: 7 },
    xpReward: 400,
    bonesReward: [140, 250],
    deathQuip: 'It skids across the arena floor, trailing embers. The ash settles. The smell lingers for a week.',
    town: 2,
  },
  {
    id: 'ashback_ankylosaurus',
    name: 'Ashback Ankylosaurus',
    emoji: '🌋',
    image: '/images/mobs/ashback_ankylosaurus.png',
    description: 'Its shell is coated in hardened volcanic residue. It looks like a walking geological event. It fights like one too.',
    level: 20,
    stats: { strength: 11, agility: 3, constitution: 16, ferocity: 9, hide: 17, stamina: 12, jaw: 6, cunning: 4, roar: 9 },
    xpReward: 560,
    bonesReward: [200, 330],
    deathQuip: 'Its tail club hits the arena wall on the way down. The crater rim cracks. The judges note this on a form.',
    town: 2,
  },
  {
    id: 'lava_croc',
    name: 'Lava Croc',
    emoji: '🐊',
    image: '/images/mobs/lava_croc.png',
    description: 'Emerged from a lava tube nobody knew existed. Hot-blooded in every sense. Extremely annoyed about being here.',
    level: 25,
    stats: { strength: 13, agility: 7, constitution: 13, ferocity: 14, hide: 12, stamina: 11, jaw: 15, cunning: 7, roar: 10 },
    xpReward: 730,
    bonesReward: [270, 420],
    deathQuip: 'It snaps twice at nothing in particular and then sinks into stillness. The arena floor is inexplicably warmer beneath it.',
    town: 2,
  },
  {
    id: 'cinder_drake',
    name: 'Cinder Drake',
    emoji: '🦇',
    image: '/images/mobs/cinder_drake.png',
    description: 'A pterosaur that roosts in the vents above the crater. Whatever gases it\'s been breathing have done something to its temperament. Nothing good.',
    level: 30,
    stats: { strength: 12, agility: 16, constitution: 12, ferocity: 15, hide: 9, stamina: 13, jaw: 12, cunning: 12, roar: 14 },
    xpReward: 980,
    bonesReward: [370, 560],
    deathQuip: 'It spirals upward one final time — instinct — then folds and drops. The crowd watches it go without speaking.',
    town: 2,
  },
  {
    id: 'magma_spinosaurus',
    name: 'Magma Spinosaurus',
    emoji: '🌊',
    image: '/images/mobs/magma_spinosaurus.png',
    description: 'The sail on its back radiates heat. It arrived from the southern vents three seasons ago and has not cooled down since.',
    level: 38,
    stats: { strength: 17, agility: 9, constitution: 17, ferocity: 18, hide: 13, stamina: 16, jaw: 18, cunning: 10, roar: 16 },
    xpReward: 1150,
    bonesReward: [420, 660],
    deathQuip: 'It falls with a sound like a collapsing furnace. Steam rises from where it lands. The arena crew takes the long way around.',
    town: 2,
  },
  {
    id: 'inferno_rex',
    name: 'Inferno Rex',
    emoji: '👑',
    image: '/images/mobs/inferno_rex.png',
    description: 'The apex predator of The Ashpit. It has lived inside a volcanic caldera long enough to stop caring about anything that isn\'t on fire.',
    level: 45,
    stats: { strength: 22, agility: 11, constitution: 21, ferocity: 22, hide: 16, stamina: 19, jaw: 22, cunning: 11, roar: 22 },
    xpReward: 1400,
    bonesReward: [500, 800],
    deathQuip: 'It stares at you until the very end. Not in defeat. In acknowledgment. Then it closes its eyes and the arena finally goes quiet.',
    town: 2,
  },

  // ── Town 3 — The Murkfen ─────────────────────────────────────────────────
  {
    id: 'bog_stalker',
    name: 'Bog Stalker',
    emoji: '🐊',
    image: '/images/mobs/bog_stalker.png',
    description: 'Lurks beneath the surface until the moment it doesn\'t. Nobody has timed the transition successfully.',
    level: 28,
    stats: { strength: 14, agility: 17, constitution: 14, ferocity: 13, hide: 12, stamina: 18, jaw: 13, cunning: 19, roar: 10 },
    xpReward: 900,
    bonesReward: [340, 520],
    deathQuip: 'It sinks back into the bog from which it came. The surface closes over without a ripple. You check the water for a while just to be sure.',
    town: 3,
  },
  {
    id: 'murk_raptor',
    name: 'Murk Raptor',
    emoji: '🌿',
    image: '/images/mobs/murk_raptor.png',
    description: 'Smaller than the standard model, faster than seems fair. Spends more time invisible than visible. You fight mostly by sound.',
    level: 32,
    stats: { strength: 13, agility: 22, constitution: 13, ferocity: 15, hide: 14, stamina: 20, jaw: 14, cunning: 21, roar: 11 },
    xpReward: 1100,
    bonesReward: [420, 640],
    deathQuip: 'It vanishes into the fog on reflex. Then it collapses. The fog holds it up for a moment longer than seems physically possible, then doesn\'t.',
    town: 3,
  },
  {
    id: 'swamp_titan',
    name: 'Swamp Titan',
    emoji: '🌳',
    image: '/images/mobs/swamp_titan.png',
    description: 'Ancient. Slow. Has been standing here so long the moss doesn\'t know it\'s alive. It does not share this patience with opponents.',
    level: 36,
    stats: { strength: 18, agility: 12, constitution: 22, ferocity: 14, hide: 20, stamina: 24, jaw: 15, cunning: 16, roar: 13 },
    xpReward: 1350,
    bonesReward: [520, 790],
    deathQuip: 'It settles into the water slowly, like something returning home. The platform creaks under you for the first time, now that it\'s gone.',
    town: 3,
  },
  {
    id: 'fenripper',
    name: 'Fenripper',
    emoji: '💧',
    image: '/images/mobs/fenripper.png',
    description: 'Something that emerged from the deep water on its own terms three years ago and has been winning arena bouts since. Nobody knows what it is exactly. Brine knows but isn\'t saying.',
    level: 40,
    stats: { strength: 17, agility: 20, constitution: 18, ferocity: 17, hide: 17, stamina: 22, jaw: 18, cunning: 23, roar: 14 },
    xpReward: 1600,
    bonesReward: [620, 940],
    deathQuip: 'It stares at you with an expression that doesn\'t translate into anything you understand. Then it slides off the platform into the water. Something is very briefly visible beneath the surface. Then it isn\'t.',
    town: 3,
  },
  {
    id: 'phantom_croc',
    name: 'Phantom Croc',
    emoji: '👁️',
    image: '/images/mobs/phantom_croc.png',
    description: 'Fought in sixteen bouts in The Murkfen and won all of them. The trick, reportedly, is that it is never fully where you think it is.',
    level: 46,
    stats: { strength: 19, agility: 24, constitution: 20, ferocity: 19, hide: 19, stamina: 25, jaw: 20, cunning: 27, roar: 15 },
    xpReward: 2000,
    bonesReward: [780, 1200],
    deathQuip: 'It disappears before it finishes falling. The splash comes a second later, from the wrong direction. You decide to call that a win and move on.',
    town: 3,
  },
  {
    id: 'murk_sovereign',
    name: 'The Murk Sovereign',
    emoji: '👑',
    image: '/images/mobs/murk_sovereign.png',
    description: 'The fog doesn\'t gather around it by accident. The Bog Bowl has been its arena for six seasons. There are scratches on the keeper\'s booth from opponents who tried to climb out.',
    level: 58,
    stats: { strength: 22, agility: 28, constitution: 23, ferocity: 21, hide: 22, stamina: 29, jaw: 22, cunning: 32, roar: 17 },
    xpReward: 2400,
    bonesReward: [1050, 1600],
    deathQuip: 'The fog clears for exactly four seconds. You see it lying still on the platform. Then the fog comes back. When it clears again, you\'re alone. You will not be asking follow-up questions.',
    town: 3,
  },

  // ── Town 4 — The Hollow Crown ─────────────────────────────────────────────
  {
    id: 'glacier_bull',
    name: 'Glacier Bull',
    emoji: '🧊',
    image: '/images/mobs/glacier_bull.png',
    description: 'Has lived at altitude long enough that it doesn\'t notice the thin air. You will notice the thin air.',
    level: 42,
    stats: { strength: 26, agility: 10, constitution: 28, ferocity: 18, hide: 26, stamina: 24, jaw: 18, cunning: 12, roar: 18 },
    xpReward: 1400,
    bonesReward: [650, 980],
    deathQuip: 'It falls like a glacier calving — not fast, but with absolute commitment. The sound echoes off the peaks for longer than you\'d expect.',
    town: 4,
  },
  {
    id: 'summit_raptor',
    name: 'Summit Raptor',
    emoji: '🏔️',
    image: '/images/mobs/summit_raptor.png',
    description: 'Descended from a population that climbed this mountain several generations ago and decided not to come back down. Leaner, quieter, and substantially less forgiving than its lowland relatives.',
    level: 47,
    stats: { strength: 23, agility: 20, constitution: 24, ferocity: 20, hide: 22, stamina: 22, jaw: 20, cunning: 18, roar: 19 },
    xpReward: 1800,
    bonesReward: [820, 1240],
    deathQuip: 'It drops cleanly, without ceremony. It fought well and it knows it. You feel the altitude more, standing over it.',
    town: 4,
  },
  {
    id: 'ironscale_titan',
    name: 'Ironscale Titan',
    emoji: '🛡️',
    image: '/images/mobs/ironscale_titan.png',
    description: 'The cold at this altitude has done something to the scales. Something structural. Opponents have broken limbs on them. The Titan considers this an acceptable outcome for everyone involved.',
    level: 52,
    stats: { strength: 28, agility: 9, constitution: 32, ferocity: 17, hide: 33, stamina: 27, jaw: 19, cunning: 13, roar: 20 },
    xpReward: 2200,
    bonesReward: [1000, 1520],
    deathQuip: 'It stands for several seconds after it should have fallen. Then it goes down all at once, like a decision. The arena shakes once. Nothing more.',
    town: 4,
  },
  {
    id: 'peak_spinosaurus',
    name: 'Peak Spinosaurus',
    emoji: '⛰️',
    image: '/images/mobs/peak_spinosaurus.png',
    description: 'The sail on its back catches the wind at altitude and turns it into something weaponized. It has never fought anywhere lower than two thousand metres. It finds the very concept distasteful.',
    level: 57,
    stats: { strength: 30, agility: 14, constitution: 30, ferocity: 22, hide: 28, stamina: 29, jaw: 24, cunning: 17, roar: 24 },
    xpReward: 2800,
    bonesReward: [1250, 1900],
    deathQuip: 'The wind takes it a moment before it fully falls. Just for a moment. Then gravity reasserts its authority. You stand in the silence afterwards and your breathing is very loud.',
    town: 4,
  },
  {
    id: 'void_ankylosaurus',
    name: 'Void Ankylosaurus',
    emoji: '🌑',
    image: '/images/mobs/void_ankylosaurus.png',
    description: 'Its armor has been fused by cold and time into something closer to geology than biology. It has not lost a bout at the Hollow Crown. It does not intend to start.',
    level: 63,
    stats: { strength: 32, agility: 8, constitution: 36, ferocity: 19, hide: 38, stamina: 32, jaw: 20, cunning: 14, roar: 22 },
    xpReward: 3600,
    bonesReward: [1600, 2450],
    deathQuip: 'It takes a long time. When it finally goes still, the silence at the summit feels different — like something that was always going to happen has finally happened. Voryn nods once from the keeper\'s post.',
    town: 4,
  },
  {
    id: 'the_crown',
    name: 'The Crown',
    emoji: '👑',
    image: '/images/mobs/the_crown.png',
    description: 'Not a title. A name. It arrived at the Hollow Crown before Voryn did. It has never been given a species classification that satisfies the naturalists. It has never cared.',
    level: 70,
    stats: { strength: 38, agility: 13, constitution: 42, ferocity: 25, hide: 40, stamina: 36, jaw: 26, cunning: 18, roar: 27 },
    xpReward: 4500,
    bonesReward: [2000, 3200],
    deathQuip: 'It looks at you, at the end. Not surprised. Not disappointed. Something more like recognition. Then it closes its eyes and becomes part of the mountain.',
    town: 4,
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
  town?: number
}

export const GEAR: GearTemplate[] = [
  // ── Jaws (bite weapons, fang enhancements) ────────────────────────────────
  { id: 'sharpened_bone',      name: 'Sharpened Bone',       slot: 'jaws',      emoji: '🦴', levelReq: 1,  price: 75,   statBonus: { jaw: 1, strength: 1 },                  description: 'A bone. Someone sharpened it. The beginning of a dental strategy.' },
  { id: 'serrated_fang',       name: 'Serrated Fang',        slot: 'jaws',      emoji: '🦷', levelReq: 3,  price: 240,  statBonus: { jaw: 2, ferocity: 1 },                  description: 'A large tooth, serrated and mounted. Goes in and doesn\'t come out clean.' },
  { id: 'croc_jaw_weapon',     name: 'Croc Jaw',             slot: 'jaws',      emoji: '🐊', levelReq: 6,  price: 550,  statBonus: { jaw: 3, strength: 2 },                  description: 'An actual crocodile jaw, mounted and wielded. Grubclaw considers this his masterwork.' },
  { id: 'volcanic_fang_blade', name: 'Volcanic Fang',        slot: 'jaws',      emoji: '🔥', levelReq: 8,  price: 750,  statBonus: { jaw: 3, strength: 2, ferocity: 2 },     description: 'A tooth from a Volcanic Rex. Gets hotter during combat. This is not metaphorical.' },
  { id: 'apex_fang',           name: 'Apex Fang',            slot: 'jaws',      emoji: '💀', levelReq: 10, price: 1250, statBonus: { jaw: 4, strength: 3, ferocity: 2 },     description: 'The largest fang Grubclaw has ever worked with. He won\'t say where it\'s from. You don\'t ask.' },

  // ── Claws (strike weapons, gauntlets) ─────────────────────────────────────
  { id: 'stone_club',          name: 'Stone Club',           slot: 'claws',     emoji: '🪨', levelReq: 1,  price: 100,  statBonus: { strength: 1, stamina: 1 },              description: 'A rock lashed to a stick. Heavy, slow, and deeply effective.' },
  { id: 'claw_gauntlet',       name: 'Claw Gauntlet',        slot: 'claws',     emoji: '🤜', levelReq: 2,  price: 165,  statBonus: { strength: 1, agility: 1 },              description: 'Claws mounted on a knuckle wrap. Fast and mean.' },
  { id: 'iron_claw',           name: 'Iron Claw',            slot: 'claws',     emoji: '🗡️', levelReq: 3,  price: 200,  statBonus: { strength: 2, agility: 1 },              description: 'Forged by Grubclaw himself. With three fingers. You can tell.' },
  { id: 'raptor_talon',        name: 'Raptor Talon',         slot: 'claws',     emoji: '⚔️', levelReq: 5,  price: 400,  statBonus: { agility: 2, ferocity: 2, strength: 1 }, description: 'A dismounted raptor talon, sharpened to surgical precision. The raptor was unhappy about this.' },
  { id: 'bone_maul',           name: 'Bone Maul',            slot: 'claws',     emoji: '🏏', levelReq: 6,  price: 475,  statBonus: { strength: 3, stamina: 1, agility: -1 }, description: 'Enormous. Slow. When it connects, debates end.' },
  { id: 'warlord_spear',       name: "Warlord's Spear",      slot: 'claws',     emoji: '🔱', levelReq: 9,  price: 950,  statBonus: { strength: 3, agility: 1, ferocity: 2 }, description: 'A spear of unknown origin. The engraving suggests it has ended several careers.' },

  // ── Body (armor, hides, plating) ──────────────────────────────────────────
  { id: 'hide_wrap',           name: 'Hide Wrap',            slot: 'body',      emoji: '🧣', levelReq: 1,  price: 75,   statBonus: { hide: 1 },                              description: 'Dried lizard hide, wrapped around the torso. Stylish in a primitive sort of way.' },
  { id: 'mud_coating',         name: 'Hardened Mud Coat',    slot: 'body',      emoji: '🟫', levelReq: 1,  price: 115,  statBonus: { hide: 1, stamina: 1 },                  description: 'Baked mud applied in layers. Insulating. Itchy. Effective.' },
  { id: 'bone_plate',          name: 'Bone Plating',         slot: 'body',      emoji: '🦴', levelReq: 3,  price: 225,  statBonus: { hide: 2, constitution: 1 },             description: 'Actual bones, strapped on for protection. Effective and definitely not cursed.' },
  { id: 'shell_pauldrons',     name: 'Shell Pauldrons',      slot: 'body',      emoji: '🐢', levelReq: 3,  price: 250,  statBonus: { hide: 2, stamina: 1 },                  description: 'Shoulder guards made from turtle shells. Grubclaw is proud of the craftsmanship.' },
  { id: 'raptor_hide',         name: 'Raptor Hide Vest',     slot: 'body',      emoji: '🐆', levelReq: 4,  price: 325,  statBonus: { hide: 1, agility: 1, constitution: 1 }, description: 'Surprisingly light for its protection. The raptor was fast. The armor carries that energy.' },
  { id: 'croc_armor',          name: 'Croc Scale Armor',     slot: 'body',      emoji: '🐊', levelReq: 6,  price: 500,  statBonus: { hide: 3, constitution: 2, agility: -1 }, description: 'Heavy. Smells faintly of swamp. The protection is worth it.' },
  { id: 'spine_plate',         name: 'Stego Spine Plate',    slot: 'body',      emoji: '🦔', levelReq: 7,  price: 650,  statBonus: { hide: 3, ferocity: 1, constitution: 2 }, description: 'Plates from a Stegosaurus. Grubclaw added extra spikes. He didn\'t need to.' },
  { id: 'ember_plate',         name: 'Ember Plate',          slot: 'body',      emoji: '🌋', levelReq: 9,  price: 1000, statBonus: { hide: 4, constitution: 2, ferocity: 1, agility: -1 }, description: 'Forged from volcanic scales. Hot to the touch. You get used to it.' },
  { id: 'rex_hide_armor',      name: 'Rex Hide Full Armor',  slot: 'body',      emoji: '🦖', levelReq: 10, price: 1300, statBonus: { hide: 5, constitution: 3, agility: -1 }, description: 'Rex hide, bone-riveted, heat-treated. Grubclaw won\'t say how many fingers he lost making this.' },

  // ── Head (helmets, horns, masks) ──────────────────────────────────────────
  { id: 'war_paint',           name: 'War Paint',            slot: 'head',      emoji: '🎨', levelReq: 1,  price: 90,   statBonus: { roar: 1, ferocity: 1 },                 description: 'Made from berries and intimidation. Looks terrifying. Is terrifying.' },
  { id: 'war_horn',            name: 'War Horn',             slot: 'head',      emoji: '📯', levelReq: 4,  price: 350,  statBonus: { roar: 2, ferocity: 1, strength: 1 },    description: 'Strapped to your head. Increases gore damage. Looks absolutely insane.' },
  { id: 'predator_mask',       name: 'Predator Mask',        slot: 'head',      emoji: '🎭', levelReq: 5,  price: 425,  statBonus: { roar: 1, ferocity: 2, cunning: 1 },     description: 'A carved skull mask. The crowd always reacts. Your opponent usually does too.' },
  { id: 'warlord_crest',       name: "Warlord's Crest",      slot: 'head',      emoji: '👑', levelReq: 10, price: 1125, statBonus: { roar: 3, ferocity: 2, cunning: 2 },     description: 'Worn by the greatest arena champions. Grubclaw found it. He will not say where.' },

  // ── Tail (tail weapons, attachments) ──────────────────────────────────────
  { id: 'tail_wrap',           name: 'Spiked Tail Wrap',     slot: 'tail',      emoji: '🌵', levelReq: 1,  price: 90,   statBonus: { strength: 1, cunning: 1 },              description: 'Spikes bound to the tail. More of a deterrent than a weapon. Still counts.' },
  { id: 'tail_spike',          name: 'Iron Tail Spike',      slot: 'tail',      emoji: '📌', levelReq: 4,  price: 300,  statBonus: { strength: 2, cunning: 2 },              description: 'A hardened iron spike strapped to the tail. Hits things behind you. Counts double.' },
  { id: 'tail_blade',          name: 'Champion Tail Blade',  slot: 'tail',      emoji: '⚡', levelReq: 7,  price: 600,  statBonus: { strength: 3, cunning: 2, stamina: 1 },  description: 'A sharpened plate bolted to the tail. Grubclaw\'s finest attachment work. Do not ask about the installation process.' },
  { id: 'stego_tailclub',      name: 'Stego Tail Club',      slot: 'tail',      emoji: '🔨', levelReq: 9,  price: 950,  statBonus: { strength: 4, cunning: 2, ferocity: 1 }, description: 'A genuine Stegosaurus tail club. Repurposed. The Stegosaurus had some strong feelings about this.' },

  // ── Accessory (charms, totems, necklaces) ─────────────────────────────────
  { id: 'lucky_fossil',        name: 'Lucky Fossil',         slot: 'accessory', emoji: '🪨', levelReq: 1,  price: 50,   statBonus: { cunning: 1 },                           description: 'A fossil of something that clearly did NOT survive. Lucky.' },
  { id: 'sinew_brace',         name: 'Sinew Brace',          slot: 'accessory', emoji: '🪢', levelReq: 1,  price: 90,   statBonus: { stamina: 1, agility: 1 },               description: 'Tight wrapping around the limbs. Improves endurance and reaction time.' },
  { id: 'claw_sharpener',      name: 'Claw Sharpener',       slot: 'accessory', emoji: '💍', levelReq: 2,  price: 150,  statBonus: { jaw: 1, ferocity: 1 },                  description: 'A ring fitted with a whetstone edge. Your natural weapons stay sharp.' },
  { id: 'stamina_totem',       name: 'Stamina Totem',        slot: 'accessory', emoji: '🪆', levelReq: 4,  price: 300,  statBonus: { stamina: 2, constitution: 1 },          description: 'A carved idol of a dinosaur not getting tired. Inspirational.' },
  { id: 'speed_anklet',        name: 'Swiftbone Anklet',     slot: 'accessory', emoji: '💨', levelReq: 4,  price: 275,  statBonus: { agility: 2, cunning: 1 },               description: 'Lightweight bones strung around the ankle. Opponents notice the difference.' },
  { id: 'alpha_fang_necklace', name: 'Alpha Fang Necklace',  slot: 'accessory', emoji: '🦴', levelReq: 7,  price: 625,  statBonus: { roar: 2, ferocity: 2, cunning: 1 },     description: 'A trophy fang on a sinew cord. Other dinosaurs notice it. They do not comment.' },
  { id: 'volcano_shard',       name: 'Volcano Shard Charm',  slot: 'accessory', emoji: '🌋', levelReq: 8,  price: 750,  statBonus: { ferocity: 3, strength: 1, roar: 1 },    description: 'A fragment of cooled lava, somehow still warm. Makes the wearer angrier.' },
  { id: 'warlord_totem',       name: "Warlord's Totem",      slot: 'accessory', emoji: '⚔️', levelReq: 10, price: 1050, statBonus: { stamina: 3, constitution: 2, cunning: 2 }, description: 'A carved totem carried by legendary fighters. The carvings depict things best not examined closely.' },

  // ── Town 2 — The Ashpit ───────────────────────────────────────────────────
  { id: 'scorched_maw',        name: 'Scorched Maw',         slot: 'jaws',      emoji: '🔥', levelReq: 11, price: 1600, statBonus: { jaw: 4, ferocity: 3 },                         description: 'Fang-work coated in heat-treated volcanic resin. Bites don\'t just cut — they sear.', town: 2 },
  { id: 'obsidian_bite',       name: 'Obsidian Bite Brace',  slot: 'jaws',      emoji: '🌑', levelReq: 16, price: 2900, statBonus: { jaw: 5, ferocity: 3, roar: 2 },                 description: 'Obsidian shards fitted between existing teeth. Scorcha won\'t tell you how many fittings went wrong. The look on her face is its own answer.', town: 2 },
  { id: 'ashglass_knuckle',    name: 'Ashglass Knuckles',    slot: 'claws',     emoji: '🌋', levelReq: 12, price: 1750, statBonus: { strength: 3, ferocity: 3 },                     description: 'Fused volcanic glass over each knuckle. They look expensive because they are.', town: 2 },
  { id: 'cinder_gauntlet',     name: 'Cinder Gauntlet',      slot: 'claws',     emoji: '💢', levelReq: 18, price: 3400, statBonus: { strength: 4, ferocity: 3, stamina: 2 },         description: 'Forged in the pit itself. The heat never fully leaves them. Neither does the intent.', town: 2 },
  { id: 'volcanic_scale_vest', name: 'Volcanic Scale Vest',  slot: 'body',      emoji: '🌋', levelReq: 11, price: 1800, statBonus: { hide: 4, constitution: 3, ferocity: 1 },        description: 'Scales stripped from a lava croc, cured in ash and time. Heavy. Excellent.', town: 2 },
  { id: 'inferno_plate',       name: 'Inferno Plate',        slot: 'body',      emoji: '🔥', levelReq: 19, price: 4200, statBonus: { hide: 6, constitution: 4, ferocity: 2, agility: -1 }, description: 'Full chest plating from The Ashpit\'s own forge. Scorcha made three of these. One is still available. She won\'t say what happened to the others.', town: 2 },
  { id: 'ashpit_warcrown',     name: 'Ashpit Warcrown',      slot: 'head',      emoji: '👑', levelReq: 13, price: 2200, statBonus: { roar: 3, ferocity: 3 },                         description: 'A jagged crown of cooled lava-rock. It serves no structural purpose. The effect on opponents is purely psychological. It works.', town: 2 },
  { id: 'magma_visored_helm',  name: 'Magma Visor Helm',     slot: 'head',      emoji: '🎭', levelReq: 20, price: 4500, statBonus: { roar: 4, ferocity: 3, constitution: 2 },        description: 'A full helm with a visor slit that glows when the wearer gets angry. According to Scorcha, the glowing is "a feature."', town: 2 },
  { id: 'cinder_lash',         name: 'Cinder Lash',          slot: 'tail',      emoji: '🌪️', levelReq: 12, price: 1900, statBonus: { strength: 3, ferocity: 2, stamina: 2 },         description: 'A flexible volcanic-glass flail fitted to the tail. Leaves marks. Plural.', town: 2 },
  { id: 'eruption_tail_spike', name: 'Eruption Tail Spike',  slot: 'tail',      emoji: '🌋', levelReq: 17, price: 3200, statBonus: { strength: 5, ferocity: 3, roar: 1 },            description: 'A two-foot spike of hardened magma-rock bolted to the tail. Scorcha calls it "the full stop." You understand why.', town: 2 },
  { id: 'ember_shard_amulet',  name: 'Ember Shard Amulet',   slot: 'accessory', emoji: '🔥', levelReq: 11, price: 1650, statBonus: { ferocity: 3, roar: 2 },                         description: 'A fragment of active lava rock on a heat-tempered chain. It is warm against the skin. That\'s not a comfort thing. That\'s a warning thing.', town: 2 },
  { id: 'ashpit_brand_totem',  name: 'Ashpit Brand Totem',   slot: 'accessory', emoji: '🌑', levelReq: 18, price: 3600, statBonus: { ferocity: 3, jaw: 3, roar: 2 },                 description: 'Carved from basalt and branded with the mark of The Ashpit\'s most notorious past champions. Scorcha sells it reluctantly and won\'t say why.', town: 2 },

  // ── Town 3 — The Murkfen ─────────────────────────────────────────────────
  { id: 'mire_fang',           name: 'Mire Fang',             slot: 'jaws',      emoji: '🦷', levelReq: 22, price: 5500,  statBonus: { jaw: 4, cunning: 3 },                           description: 'A fang salvaged from the fen\'s deeper residents. She didn\'t tell you what it came from. The fang was apparently fine with leaving.', town: 3 },
  { id: 'venombarb_bite',      name: 'Venombarb Bite',        slot: 'jaws',      emoji: '💧', levelReq: 30, price: 9200,  statBonus: { jaw: 5, cunning: 4, agility: 2 },               description: '"What\'s the barb do?" you ask. Brine looks at you for a long moment. "Bites twice," she says. That is the entire explanation.', town: 3 },
  { id: 'swamp_knifehand',     name: 'Swamp Knifehand',       slot: 'claws',     emoji: '🌿', levelReq: 23, price: 6000,  statBonus: { agility: 4, cunning: 3 },                       description: 'Reed-fiber-wrapped bone blades, slim and quiet. They don\'t make a sound on entry. Brine says that\'s the point of them.', town: 3 },
  { id: 'fog_strike_talons',   name: 'Fog-Strike Talons',     slot: 'claws',     emoji: '🌫️', levelReq: 33, price: 10500, statBonus: { agility: 5, cunning: 4, stamina: 2 },           description: '"You\'ll want to strike before they see you," Brine explains. "These help with that." She does not clarify how.', town: 3 },
  { id: 'murk_weave_vest',     name: 'Murk-Weave Vest',       slot: 'body',      emoji: '🌿', levelReq: 22, price: 5800,  statBonus: { stamina: 4, agility: 3 },                       description: 'Woven from the reeds and hides of things that lived in the bog. Lighter than it looks. Moves like water. Brine wove it herself. She won\'t say when.', town: 3 },
  { id: 'siltscale_armor',     name: 'Siltscale Full Armor',  slot: 'body',      emoji: '🐊', levelReq: 34, price: 12000, statBonus: { stamina: 5, hide: 4, agility: 3, strength: -1 }, description: '"The scales come from the deep channel," Brine says. "Don\'t ask about the channel." You were about to ask about the channel.', town: 3 },
  { id: 'fogveil_hood',        name: 'Fogveil Hood',          slot: 'head',      emoji: '🌫️', levelReq: 24, price: 6500,  statBonus: { cunning: 4, agility: 3 },                       description: 'A hood treated with bog-smoke, rendered in a grey that matches the Murkfen mist exactly. "You\'re not invisible," Brine says. "You\'re just difficult to think about."', town: 3 },
  { id: 'murk_crown_helm',     name: 'Murk Crown Helm',       slot: 'head',      emoji: '🐸', levelReq: 36, price: 13500, statBonus: { cunning: 5, stamina: 4, agility: 2 },           description: 'Brine keeps it behind the counter and only brings it out when she thinks you\'re ready. She brought it out. You\'re apparently ready.', town: 3 },
  { id: 'bog_lash',            name: 'Bog Lash',              slot: 'tail',      emoji: '💧', levelReq: 23, price: 6200,  statBonus: { stamina: 3, cunning: 3, agility: 2 },           description: 'A weighted reed-and-bone tail flail that moves through fog like it isn\'t there. Which is the point. The target learns this at roughly the same moment.', town: 3 },
  { id: 'silt_sting',          name: 'Silt-Sting Spike',      slot: 'tail',      emoji: '🌿', levelReq: 35, price: 11500, statBonus: { stamina: 4, cunning: 4, strength: 2 },          description: '"It\'s coated," Brine tells you. "In what?" "In something from the channel." You don\'t press the channel question again.', town: 3 },
  { id: 'deep_channel_stone',  name: 'Deep Channel Stone',    slot: 'accessory', emoji: '💧', levelReq: 22, price: 5500,  statBonus: { cunning: 3, stamina: 3 },                       description: 'A smooth stone from the bottom of the Murkfen\'s deepest channel. Brine found it there years ago. She says it knows things. She says it quieter than she says other things.', town: 3 },
  { id: 'fenbinder_cord',      name: 'Fenbinder Cord',        slot: 'accessory', emoji: '🪢', levelReq: 32, price: 8500,  statBonus: { cunning: 4, agility: 4, stamina: 2 },           description: '"What does it bind?" you ask. Brine looks at the cord for a moment. "Distance," she says. "Between where you are and where you need to be." You tie it on. It feels correct.', town: 3 },

  // ── Town 4 — The Hollow Crown ─────────────────────────────────────────────
  { id: 'frost_fang',          name: 'Frost Fang',            slot: 'jaws',      emoji: '🧊', levelReq: 38, price: 16000, statBonus: { jaw: 5, strength: 4 },                          description: 'Pulled from a glacier fissure by Voryn. Edges ground to a finish that doesn\'t need describing. You will notice it in the first round.', town: 4 },
  { id: 'summit_shear',        name: 'Summit Shear',          slot: 'jaws',      emoji: '⛰️', levelReq: 46, price: 24000, statBonus: { jaw: 6, strength: 5, constitution: 2 },         description: 'Voryn places it on the counter without ceremony. "It has ended nine careers," Voryn says. "The owners are all alive. They retired voluntarily." A pause. "Mostly."', town: 4 },
  { id: 'glacial_strike',      name: 'Glacial Strike Claws',  slot: 'claws',     emoji: '🧊', levelReq: 38, price: 17000, statBonus: { strength: 5, constitution: 3 },                 description: 'Forged at altitude, tempered in melt water that has been cold for approximately twelve thousand years. Voryn says nothing about this. The cold says enough.', town: 4 },
  { id: 'ironpeak_gauntlet',   name: 'Ironpeak Gauntlet',     slot: 'claws',     emoji: '🏔️', levelReq: 47, price: 26000, statBonus: { strength: 6, constitution: 4, hide: 2 },        description: '"These are for the ones who are still fighting in the final rounds," Voryn says. It is unclear if this is a compliment or a requirement.', town: 4 },
  { id: 'glacierhide_vest',    name: 'Glacierhide Vest',      slot: 'body',      emoji: '🧊', levelReq: 39, price: 18000, statBonus: { hide: 6, constitution: 4 },                     description: 'Hide from something that lived above the snowline. It is very thick. Voryn says: "Cold makes things harder." This applies to the hide. Possibly also to Voryn.', town: 4 },
  { id: 'vault_plate',         name: 'Vault Plate',           slot: 'body',      emoji: '🏔️', levelReq: 48, price: 28000, statBonus: { hide: 7, constitution: 5, strength: 2, agility: -2 }, description: 'Full summit plating. Voryn keeps one set in stock at a time. Either you\'re ready or you aren\'t, and Voryn can tell the difference.', town: 4 },
  { id: 'cold_eye_visor',      name: 'Cold Eye Visor',        slot: 'head',      emoji: '❄️', levelReq: 38, price: 16500, statBonus: { constitution: 4, hide: 4 },                     description: '"It doesn\'t help you see better," Voryn says. "It helps you see clearly." There is a difference, apparently.', town: 4 },
  { id: 'summit_warcrown',     name: 'Summit Warcrown',       slot: 'head',      emoji: '👑', levelReq: 49, price: 30000, statBonus: { constitution: 5, hide: 5, strength: 3 },        description: '"You\'ve earned the right to it," Voryn says. That is the most words Voryn has used this season.', town: 4 },
  { id: 'glacier_tail_spike',  name: 'Glacier Tail Spike',    slot: 'tail',      emoji: '🧊', levelReq: 40, price: 19000, statBonus: { strength: 5, hide: 3, stamina: 2 },             description: 'Chiseled from a single spar of glacial ice-rock. Voryn says it won\'t shatter. Voryn does not make predictions lightly.', town: 4 },
  { id: 'peak_hammertail',     name: 'Peak Hammertail',       slot: 'tail',      emoji: '⛰️', levelReq: 50, price: 27000, statBonus: { strength: 7, constitution: 3, hide: 2 },        description: '"This ends fights," Voryn says, setting it on the counter. A long silence. "It has ended several that should have gone longer." This appears to be the sales pitch.', town: 4 },
  { id: 'altitude_sigil',      name: 'Altitude Sigil',        slot: 'accessory', emoji: '❄️', levelReq: 38, price: 16000, statBonus: { constitution: 4, hide: 3 },                     description: 'Every fighter at the Hollow Crown has seen one. Most are in the possession of people who have been here a while. Voryn sells it without comment.', town: 4 },
  { id: 'summit_mantle',       name: 'Summit Mantle',         slot: 'accessory', emoji: '🏔️', levelReq: 48, price: 25000, statBonus: { constitution: 5, hide: 4, strength: 2 },        description: '"The ones who fight here long enough stop needing it," Voryn says. "But it helps in the beginning." You put it on and feel the weight of the altitude less.', town: 4 },
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
  if (level <= 1) return 0
  return Math.floor(60 * Math.pow(level - 1, 2.3))
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

export interface QuestOutcome {
  text: string
  bonesDelta?: number
  hpDelta?: number
  xpDelta?: number
}

export interface QuestChoice {
  label: string
  outcome: QuestOutcome
  // If character's stat >= threshold, use this outcome instead
  statCheck?: {
    stat: StatKey
    threshold: number
    outcome: QuestOutcome
  }
}

export interface TavernQuest {
  id: string
  prompt: string
  // Shown as additional flavor if condition is met — evaluated client-side
  contextHint?: {
    lowHp?: boolean          // show if hp < 40% max
    stat?: StatKey
    statThreshold?: number   // show if character.stats[stat] >= threshold
    text: string
  }
  choices: QuestChoice[]
  town?: number
}

export const TAVERN_QUESTS: TavernQuest[] = [
  {
    id: 'drunk_wager',
    prompt: "A Stegosaurus at the bar, impressively drunk, challenges you to an arm-wrestling contest. It has no arms. It is somehow still very confident about this.",
    choices: [
      {
        label: "Accept the challenge",
        outcome: { text: "You win by default. The Stegosaurus tips over. You find 30 bones in its unattended pack. Nobody saw anything.", bonesDelta: 30 },
        statCheck: { stat: 'strength', threshold: 4, outcome: { text: "You win before it finishes explaining the rules. It tips over and its pack falls open. 45 bones. Nobody saw anything.", bonesDelta: 45 } },
      },
      {
        label: "Decline politely",
        outcome: { text: "You walk away. The Stegosaurus calls you a coward. You do not engage. You are correct." },
      },
    ],
  },
  {
    id: 'mystery_meat',
    prompt: "A cloaked figure offers you a piece of 'mystery meat.' It smells unusual. The figure is sweating more than seems appropriate for the temperature.",
    contextHint: { lowHp: true, text: "You're not at full health. This seems like a bad time to eat something unidentified." },
    choices: [
      {
        label: "Eat the mystery meat",
        outcome: { text: "It tastes like old boots soaked in something ambitious. Your body registers a formal complaint. -15 HP.", hpDelta: -15 },
        statCheck: { stat: 'constitution', threshold: 5, outcome: { text: "It tastes strange but your stomach handles it without argument. Whatever was in it, you absorb it cleanly. +20 XP.", xpDelta: 20 } },
      },
      {
        label: "Decline politely",
        outcome: { text: "You decline. The figure looks relieved. They shuffle off toward a Raptor who seems less cautious than you." },
      },
    ],
  },
  {
    id: 'bar_fight_raptors',
    prompt: "Two Velociraptors are arguing loudly next to you. One of them accidentally elbows you in the jaw. Both go quiet and look at you.",
    choices: [
      {
        label: "Get involved",
        outcome: { text: "You throw one Raptor across the room. The other immediately apologizes and leaves. You find 15 bones in the chaos. Your jaw disagrees with this outcome. -10 HP, +15 bones.", bonesDelta: 15, hpDelta: -10 },
        statCheck: { stat: 'strength', threshold: 5, outcome: { text: "You throw one Raptor without visible effort. The other freezes, then bolts. The barkeep slides you a drink on the house and you find 30 bones in the chaos. +30 bones.", bonesDelta: 30 } },
      },
      {
        label: "Move to a different table",
        outcome: { text: "You relocate. The Raptors resolve their dispute by smashing a table. You watch from safety." },
      },
      {
        label: "Stare until they leave",
        outcome: { text: "You say nothing. You just look at them. After an uncomfortable silence, both Raptors find somewhere else to be. +15 XP for pure nerve.", xpDelta: 15 },
        statCheck: { stat: 'roar', threshold: 4, outcome: { text: "You say nothing. The Raptors sense what you're capable of. They both leave quickly and one drops 20 bones on the way out. +20 bones.", bonesDelta: 20 } },
      },
    ],
  },
  {
    id: 'spilled_drink',
    prompt: "A large T-Rex, navigating the bar with its tiny arms, bumps into you and spills your drink. It turns and looks at you. The bar goes quiet.",
    choices: [
      {
        label: "Hold its gaze",
        outcome: { text: "You stare back. Sweat appears on the T-Rex. Then it nods slowly and buys you a replacement. The crowd exhales. +20 XP.", xpDelta: 20 },
        statCheck: { stat: 'ferocity', threshold: 5, outcome: { text: "You stare back with the kind of look that makes large things reconsider their choices. It buys your drink and leaves a 30-bone tip to make clear there are no hard feelings. +30 bones.", bonesDelta: 30 } },
      },
      {
        label: "Laugh it off",
        outcome: { text: "You laugh. It relaxes visibly. Crisis averted. It buys the next round." },
      },
      {
        label: "Demand it replace your drink",
        outcome: { text: "You demand a replacement. There is a long pause. Then it obliges, very carefully, watching you for the rest of the evening." },
        statCheck: { stat: 'roar', threshold: 5, outcome: { text: "You make your demand with authority. The T-Rex obliges instantly and knocks someone else's drink over backing away from you. +10 bones from the collateral confusion.", bonesDelta: 10 } },
      },
    ],
  },
  {
    id: 'ankylo_gamble',
    prompt: "A smooth-talking Ankylosaurus invites you to a card game. The table already has two other players. The Ankylosaurus is very relaxed. Too relaxed.",
    choices: [
      {
        label: "Join the game",
        outcome: { text: "You lose steadily for twenty minutes. -40 bones. The Ankylosaurus was definitely cheating. You have no proof.", bonesDelta: -40 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You spot the marked cards on the second hand. You play along just long enough to let them think they have you, then clean them out. +80 bones. The Ankylosaurus looks personally offended.", bonesDelta: 80 } },
      },
      {
        label: "Decline the game",
        outcome: { text: "You decline. The Ankylosaurus immediately pivots to the next creature at the bar. You watch them lose 40 bones in fifteen minutes." },
      },
    ],
  },
  {
    id: 'stray_bones',
    prompt: "You notice a cloth pouch under the table by your foot. It's heavy. Bones clinking inside. Nobody else seems to have noticed.",
    choices: [
      {
        label: "Pocket it quietly",
        outcome: { text: "You slide it into your pack without a sound. 50 bones. You do not make eye contact with anyone.", bonesDelta: 50 },
      },
      {
        label: "Ask if anyone lost it",
        outcome: { text: "You hold it up and ask. A nervous Iguanodon at the bar spins around, visibly relieved. It thanks you and presses 20 bones into your hand as a reward. +20 bones.", bonesDelta: 20 },
      },
      {
        label: "Check it for traps first",
        outcome: { text: "You examine it carefully before touching it. Nothing sinister — just 50 bones someone left behind. You take them.", bonesDelta: 50 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You examine it and spot a thread attached to a hook overhead — a setup to embarrass whoever picks it up. You pocket the 50 bones carefully and leave before anyone springs it. +50 bones, +15 XP.", bonesDelta: 50, xpDelta: 15 } },
      },
    ],
  },
  {
    id: 'tab_dispute',
    prompt: "The barkeep presents your tab. It's 30 bones more than you expected. Either they made a mistake or they're hoping you won't notice.",
    choices: [
      {
        label: "Pay without argument",
        outcome: { text: "You pay the full amount. The barkeep doesn't blink. Maybe it was a mistake. Maybe it wasn't. -30 bones.", bonesDelta: -30 },
      },
      {
        label: "Dispute it calmly",
        outcome: { text: "You point out the discrepancy. The barkeep stares at the numbers for a long time, then corrects it. 'Sorry, my mistake.' They do not look sorry." },
        statCheck: { stat: 'cunning', threshold: 3, outcome: { text: "You lay out the exact itemized breakdown from memory. The barkeep blinks twice, corrects the tab, and gives you a free drink out of what seems like genuine respect. +15 XP.", xpDelta: 15 } },
      },
    ],
  },
  {
    id: 'the_informant',
    prompt: "A hooded figure slides next to you. 'Fifty bones,' they whisper, 'and I'll tell you something about your next opponent that could save your life.' They know who you're fighting. You're not sure how.",
    contextHint: { stat: 'cunning', statThreshold: 4, text: "Something about their manner suggests they actually know what they're talking about." },
    choices: [
      {
        label: "Pay for the information",
        outcome: { text: "You hand over 50 bones. The information is vague but useful. You feel slightly more prepared going in. -50 bones, +30 XP.", bonesDelta: -50, xpDelta: 30 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You pay 50 bones and receive specific, actionable intelligence. You also notice the figure's ring — arena staff insignia. This information is very reliable. -50 bones, +50 XP.", bonesDelta: -50, xpDelta: 50 } },
      },
      {
        label: "Decline — you'll see for yourself",
        outcome: { text: "You wave them off. They shrug and slide toward the next fighter at the bar. You'll learn about your opponent the hard way." },
      },
    ],
  },
  {
    id: 'smugglers_package',
    prompt: "A panicked Pterodactyl drops a sealed package on your table. 'Hold this for two minutes, I swear I'll be right back.' It disappears into the crowd before you can respond. The package is moving slightly.",
    choices: [
      {
        label: "Hold it and mind your business",
        outcome: { text: "You hold it for ten minutes. The Pterodactyl never comes back. The package eventually stops moving. You leave it on the table and don't look back." },
      },
      {
        label: "Open it and see what's inside",
        outcome: { text: "It's a small lizard in a hat. It looks at you. You look at it. You set it on the floor and it walks away. This raises more questions than it answers." },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You open it carefully. Inside: a small lizard in a hat, sitting on 60 bones. The lizard has a note that says 'delivery fee.' You take the bones. The lizard walks away seemingly fine with this arrangement. +60 bones.", bonesDelta: 60 } },
      },
      {
        label: "Move away from it immediately",
        outcome: { text: "You slide it away from you and relocate. Whatever was in that package was not your problem and you made sure it stayed that way." },
      },
    ],
  },
  {
    id: 'fight_fixer',
    prompt: "A well-dressed Diplodocus pulls you aside. 'I represent certain interested parties,' it says quietly. 'There's 100 bones in it for you if your next fight ends in a loss. Controllable result, controllable income.' It slides a pouch across the table.",
    choices: [
      {
        label: "Take the money and lose as agreed",
        outcome: { text: "You take the 100 bones and throw the fight. It feels bad. The crowd is disappointed. You are disappointed. +100 bones, -25 XP.", bonesDelta: 100, xpDelta: -25 },
      },
      {
        label: "Refuse",
        outcome: { text: "You refuse. The Diplodocus sighs. 'Integrity. Fascinating.' It takes the pouch back and leaves." },
      },
      {
        label: "Take the money and win anyway",
        outcome: { text: "You take the 100 bones, win the fight, and enjoy the Diplodocus's expression from across the arena. Worth it. You may want to avoid this tavern for a while. +100 bones.", bonesDelta: 100 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You take the 100 bones, win decisively, and have already mapped three exits by the time the Diplodocus realizes what happened. You won't see them again. +100 bones, +25 XP.", bonesDelta: 100, xpDelta: 25 } },
      },
    ],
  },
  {
    id: 'suspicious_recruitment',
    prompt: "A recruiter with no identifying insignia offers you 80 bones to haul 'a cargo shipment' to the far edge of town. Tonight. No questions. Cash up front.",
    choices: [
      {
        label: "Take the job, no questions",
        outcome: { text: "You haul the cargo. It's heavy and smells strange. Nobody at the delivery end makes eye contact with you. You get 80 bones and do not ask what was in the crates. +80 bones.", bonesDelta: 80 },
      },
      {
        label: "Ask what's in the cargo first",
        outcome: { text: "'Supplies,' says the recruiter. 'For the settlement.' You ask which settlement. They say 'the usual one.' You decide this is not worth 80 bones." },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You ask detailed questions and watch the recruiter sweat. They raise the offer to 120 bones just to stop the interrogation. You take the job. The cargo is never explained. +120 bones.", bonesDelta: 120 } },
      },
    ],
  },
  {
    id: 'the_proposition',
    prompt: "A well-dressed Triceratops presents a 'once-in-a-season investment opportunity.' Your bones working for you. Guaranteed 200% returns in three days. Just needs a 100-bone deposit to get started.",
    choices: [
      {
        label: "Invest the 100 bones",
        outcome: { text: "You hand over 100 bones. Three days later you check the address they gave you. There is no such address. -100 bones.", bonesDelta: -100 },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. The Triceratops smoothly pivots to another creature at the bar. You watch them hand over bones ten minutes later. You did not make that mistake." },
        statCheck: { stat: 'cunning', threshold: 3, outcome: { text: "You decline and warn the creature next to you who was about to bite. They thank you and give you 20 bones for the tip. +20 bones.", bonesDelta: 20 } },
      },
    ],
  },
  {
    id: 'the_witness',
    prompt: "You see an arena official quietly palm a pouch of bones from a fighter before slipping them a folded piece of paper. The official glances around. Your eyes meet. You both know what you saw.",
    choices: [
      {
        label: "Look away and forget it",
        outcome: { text: "You study your drink with intense concentration. The official relaxes and leaves quickly. You keep your health and your ignorance." },
      },
      {
        label: "Approach the official quietly",
        outcome: { text: "You imply, politely, that silence costs something. The official's jaw tightens. They hand you 60 bones without a word. +60 bones.", bonesDelta: 60 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You outline your reasonable terms. The official recognizes a professional and pays 90 bones immediately. +90 bones.", bonesDelta: 90 } },
      },
      {
        label: "Report it to arena security",
        outcome: { text: "You report it. Security thanks you and says they'll 'look into it.' The official is still at the same post the next day. You got nothing except a cleaner conscience. +10 XP.", xpDelta: 10 },
      },
    ],
  },
  {
    id: 'debt_collector_mistake',
    prompt: "A nervous Iguanodon grabs your arm. 'Please, I just need two more days, I swear.' It is clearly mistaking you for someone the Iguanodon owes money to.",
    choices: [
      {
        label: "Play along as the debt collector",
        outcome: { text: "You collect 60 bones 'on account' and leave before anyone clarifies anything. +60 bones.", bonesDelta: 60 },
        statCheck: { stat: 'strength', threshold: 4, outcome: { text: "You look intimidating enough that the Iguanodon doesn't ask questions and pays 80 bones without negotiating. +80 bones.", bonesDelta: 80 } },
      },
      {
        label: "Tell it you're the wrong dinosaur",
        outcome: { text: "You correct the mistake. The Iguanodon looks confused, then horrified, then runs. The actual debt collector walks in thirty seconds later. You had excellent timing. +15 XP.", xpDelta: 15 },
      },
    ],
  },
  {
    id: 'collapsed_fighter',
    prompt: "A fighter you recognize from the arena collapses near your table. They're alive but badly hurt — clearly just came from a fight that didn't go well. The crowd is deciding whether to be involved.",
    choices: [
      {
        label: "Help them — get the healer",
        outcome: { text: "You drag them to the healer. The fighter recovers enough to press 30 bones into your hand before passing out again. +30 bones.", bonesDelta: 30 },
        statCheck: { stat: 'constitution', threshold: 4, outcome: { text: "You carry them to the healer without trouble and wait until they're stable. They come around, thank you clearly, and give you 50 bones and a name to call if you ever need a favor. +50 bones.", bonesDelta: 50 } },
      },
      {
        label: "Go through their pockets first, then get help",
        outcome: { text: "You find 40 bones and take them. Then you alert the healer. The fighter survives. They never know. You feel approximately medium about this. +40 bones.", bonesDelta: 40 },
      },
      {
        label: "Stay out of it",
        outcome: { text: "You watch from your seat. Eventually someone else handles it. The fighter survives. You gain nothing and lose nothing. Sometimes that's the day." },
      },
    ],
  },
  {
    id: 'missing_fighter_poster',
    prompt: "A flyer on the bar reads: 'Missing — Theron, Iguanodon, Level 4. Last seen near the Bone Pit. 50-bone reward.' You actually saw someone matching that description in the arena last week.",
    choices: [
      {
        label: "Report what you saw for the reward",
        outcome: { text: "You give your account to the contact on the flyer. They pay 50 bones immediately. Theron is found alive, hiding from a debt. Everyone is mostly relieved. +50 bones.", bonesDelta: 50 },
      },
      {
        label: "Ignore it",
        outcome: { text: "You leave the flyer alone. Someone else probably knows something too." },
      },
    ],
  },
  {
    id: 'lost_bones_return',
    prompt: "An elderly Pterodactyl taps you on the shoulder. 'You dropped these earlier,' it says, holding out 45 bones. You did not drop any bones. You have checked your pockets twice. The Pterodactyl's expression is completely sincere.",
    choices: [
      {
        label: "Accept the bones — they're yours apparently",
        outcome: { text: "You take them. The Pterodactyl winks once. You choose not to examine this further. +45 bones.", bonesDelta: 45 },
      },
      {
        label: "Refuse on principle",
        outcome: { text: "You refuse. The Pterodactyl shrugs and pockets them. You feel morally correct. That is the only thing you gained." },
      },
    ],
  },
  {
    id: 'fortune_teller',
    prompt: "An ancient Pterosaur in the corner has a sign: 'Futures Told. 20 Bones.' It meets your gaze across the room and nods as though it already knew you'd consider it.",
    choices: [
      {
        label: "Pay for a reading",
        outcome: { text: "It holds your claws and speaks for four uninterrupted minutes about blood, fire, and 'a turning that cannot be unturned.' You feel strange. -20 bones, +20 XP.", bonesDelta: -20, xpDelta: 20 },
      },
      {
        label: "Walk past",
        outcome: { text: "You walk past. As you leave the area, it says quietly behind you: 'The jaw decides it.' You spend the rest of the evening thinking about what that means." },
      },
    ],
  },
  {
    id: 'eating_wager',
    prompt: "A group of fighters bets you 60 bones you can't finish a bowl of Swamp Broth — the tavern's unofficial test of intestinal fortitude. It is grey. It smells like something geological.",
    contextHint: { stat: 'constitution', statThreshold: 5, text: "You've survived worse. Probably." },
    choices: [
      {
        label: "Accept the challenge",
        outcome: { text: "You finish it. Barely. Your body registers a long complaint. -20 HP, +60 bones.", bonesDelta: 60, hpDelta: -20 },
        statCheck: { stat: 'constitution', threshold: 5, outcome: { text: "You finish it without visible distress. The table goes quiet. You slide the empty bowl back. +60 bones, and nobody at this table will challenge you directly again. +60 bones, +20 XP.", bonesDelta: 60, xpDelta: 20 } },
      },
      {
        label: "Decline with dignity",
        outcome: { text: "You decline. Nobody pushes it. Possibly they respect you more for knowing your limits." },
      },
    ],
  },
  {
    id: 'arena_tip',
    prompt: "Just before you head back out, a stranger leans in. 'The fighter in the next bracket — she leads with a feint left. Every time. I've watched six of her fights.' They look like they know what they're talking about.",
    choices: [
      {
        label: "Thank them and remember it",
        outcome: { text: "You file it away. It may or may not be accurate, but it costs nothing. +15 XP for the preparation mindset.", xpDelta: 15 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You ask two follow-up questions and decide the tip is solid. You feel meaningfully more prepared. +30 XP.", xpDelta: 30 } },
      },
      {
        label: "Ignore it — you'll read the fight yourself",
        outcome: { text: "You nod politely and don't retain it. You prefer to see a fighter fresh." },
      },
    ],
  },
  {
    id: 'revenge_job',
    prompt: "A small, nervous Compsognathus wants you to 'have a word' with a Spinosaurus named Kreth who owes it money. It offers 70 bones. Kreth is at the bar right now. You look at Kreth. Kreth is large.",
    choices: [
      {
        label: "Take the job",
        outcome: { text: "You approach Kreth. After a tense moment it decides you're not worth the drama and pays what it owes. +70 bones, -15 HP from the tension.", bonesDelta: 70, hpDelta: -15 },
        statCheck: { stat: 'roar', threshold: 4, outcome: { text: "You approach Kreth and say three words. Kreth pays the debt, adds an extra 20 bones as a 'misunderstanding fee,' and finds a different seat. +90 bones.", bonesDelta: 90 } },
      },
      {
        label: "Ask what Kreth did first",
        outcome: { text: "The Compsognathus explains for twelve minutes. The story is complicated and both parties seem at fault. You decline involvement. Some situations are not worth 70 bones." },
        statCheck: { stat: 'cunning', threshold: 3, outcome: { text: "You hear the story, identify that the Compsognathus also owes Kreth something, and broker a settlement. Both pay you 25 bones each to avoid further arbitration. +50 bones.", bonesDelta: 50 } },
      },
      {
        label: "Decline entirely",
        outcome: { text: "You decline. The Compsognathus looks disappointed and asks someone else. Nobody else accepts either." },
      },
    ],
  },
  {
    id: 'unofficial_spar',
    prompt: "A young fighter — clearly newly arrived, still with the look of someone who hasn't been seriously hurt yet — squares up to you outside the bar entrance. 'Not official,' they say. 'Just want to see where I'm at.'",
    choices: [
      {
        label: "Spar with them",
        outcome: { text: "You go a few rounds. They're green but fast. You win comfortably. -10 HP from the effort. They thank you. +20 XP from the exchange.", hpDelta: -10, xpDelta: 20 },
        statCheck: { stat: 'ferocity', threshold: 4, outcome: { text: "You overwhelm them quickly enough that the lesson is very clear. They leave quieter and considerably more realistic about their prospects. +30 XP.", xpDelta: 30 } },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. They nod and go looking for someone else. You don't lose anything." },
      },
    ],
  },
  {
    id: 'overheard_rigging',
    prompt: "Two fighters are murmuring at the next table. '...just take a fall in round two and we both walk away richer.' They haven't noticed you can hear every word.",
    choices: [
      {
        label: "Report them to arena security",
        outcome: { text: "You report them. Security investigates and disqualifies one fighter. You receive an official 'thank you' worth 30 bones. +30 bones.", bonesDelta: 30 },
      },
      {
        label: "Find a way to profit from the information",
        outcome: { text: "You don't have a betting mechanism to hand. But you file the information away as useful intelligence. +20 XP for knowing.", xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You find a third party with both money and interest in the outcome, share the intelligence for a fee, and walk away with 70 bones before anything happens. +70 bones.", bonesDelta: 70 } },
      },
      {
        label: "Ignore it",
        outcome: { text: "You move tables. Whatever happens in that fight is between them and whoever bet on it." },
      },
    ],
  },
  {
    id: 'cursed_bone_vendor',
    prompt: "A vendor is selling 'an authentic cursed bone fragment' for 25 bones. It brings misfortune to enemies, they say. It also, they admit, 'sometimes just brings general misfortune.'",
    choices: [
      {
        label: "Buy the cursed bone",
        outcome: { text: "You buy it. That evening you stub a toe, spill a drink, and lose 15 bones in a dice game you weren't even playing. -40 bones total.", bonesDelta: -40 },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. Someone else buys it immediately. You make a note of their face." },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You can see it's a painted old rib. You explain this to the creature about to buy it. They thank you and give you 15 bones for the heads-up. +15 bones.", bonesDelta: 15 } },
      },
    ],
  },
  {
    id: 'experimental_treatment',
    prompt: "A medic who is definitely not the official tavern healer pulls you aside with a small vial. 'New compound,' they say. 'Either heals you significantly or does nothing. Early trials.'",
    contextHint: { lowHp: true, text: "You're hurt. The risk calculus on 'early trials' shifts somewhat when you need the HP." },
    choices: [
      {
        label: "Accept the treatment",
        outcome: { text: "Nothing happens for ten minutes. Then you feel considerably better. +35 HP.", hpDelta: 35 },
        statCheck: { stat: 'constitution', threshold: 5, outcome: { text: "Your body takes to it immediately. The medic takes notes with visible excitement. +50 HP.", hpDelta: 50 } },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. 'Early trials' are two words that have ended careers. The medic moves on to someone bolder." },
      },
    ],
  },
  {
    id: 'tattered_map',
    prompt: "A vendor is selling a hand-drawn map with 'BONES CACHE — DO NOT TELL' written at the top in large letters. The map costs 40 bones. It leads somewhere outside town.",
    choices: [
      {
        label: "Buy it at full price",
        outcome: { text: "You follow the map. The location is a hole in the ground containing 20 bones, a rock, and what appears to be a very old shoe. Net: -20 bones.", bonesDelta: -20 },
      },
      {
        label: "Haggle the price down first",
        outcome: { text: "You negotiate to 15 bones. The vendor caves immediately — a bad sign. The map leads to a hole with 20 bones in it. You are net positive, barely. +5 bones.", bonesDelta: 5 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You negotiate to 10 bones and get the vendor to swear on its accuracy. You follow the map to 60 bones buried under a marked stone. Apparently some maps are real. +50 bones.", bonesDelta: 50 } },
      },
      {
        label: "Pass — maps are never real",
        outcome: { text: "You walk past. Someone else buys it for full price and comes back an hour later looking annoyed." },
      },
    ],
  },
  {
    id: 'last_round',
    prompt: "The barkeep rings the bell. Last round of the evening. A stranger next to you slides over a drink: 'For the road. Strong stuff.' They are clearly already well past their own limit.",
    choices: [
      {
        label: "Accept and drink it",
        outcome: { text: "You drink it. They weren't wrong about the strength. -10 HP, but something in the evening feels earned. +20 XP.", hpDelta: -10, xpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 4, outcome: { text: "You drink it without visible difficulty. The stranger looks impressed and orders two more. You have a good evening and wake up feeling unreasonably fine. +20 XP.", xpDelta: 20 } },
      },
      {
        label: "Politely decline",
        outcome: { text: "You decline. The stranger shrugs and finishes it themselves. You head home clear-headed." },
      },
    ],
  },
  {
    id: 'tone_deaf_bard',
    prompt: "A Brachiosaurus is performing in the corner, playing a string instrument with its neck. The notes are not in any recognizable key. The tavern is suffering quietly.",
    choices: [
      {
        label: "Loudly express your opinion",
        outcome: { text: "You make your feelings known. The Brachiosaurus seems genuinely hurt and stops. The tavern exhales. Two regulars buy you drinks. +15 bones.", bonesDelta: 15 },
        statCheck: { stat: 'roar', threshold: 4, outcome: { text: "Your voice carries enough that the Brachiosaurus takes it as definitive professional feedback and packs up. The entire tavern thanks you quietly. +30 bones in grateful tips.", bonesDelta: 30 } },
      },
      {
        label: "Tip them to stop",
        outcome: { text: "You offer 10 bones to 'take a short break.' The Brachiosaurus accepts with dignity. -10 bones. The silence is worth it.", bonesDelta: -10 },
      },
      {
        label: "Move to a quieter corner",
        outcome: { text: "You find a seat further away. The music is still audible but less catastrophic from a distance." },
      },
    ],
  },
  {
    id: 'the_heist_rumor',
    prompt: "A shady Raptor slides next to you. 'I know where a merchant keeps a stash unguarded for two hours every evening,' it whispers. '50/50 split. Easy bones.' It seems confident. Raptors usually are.",
    choices: [
      {
        label: "Join the heist",
        outcome: { text: "You go. The stash is real. You get 60 bones. The Raptor takes its share and vanishes before you can ask the obvious questions. +60 bones.", bonesDelta: 60 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You go, spot a hidden guard the Raptor didn't mention, redirect them with a distraction, and come out with 90 bones. The Raptor bolted when it saw the guard so you keep its share too. +90 bones.", bonesDelta: 90 } },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. An hour later the Raptor is escorted past by arena security, covered in something. You made the right call." },
      },
    ],
  },
  {
    id: 'headbutt_contest',
    prompt: "A Pachycephalosaurus — compact, confident, skull like a boulder — challenges you to a headbutting contest. It is staring at your forehead with professional interest. This is its entire personality.",
    contextHint: { lowHp: true, text: "You're already down HP. This is an objectively terrible idea." },
    choices: [
      {
        label: "Accept the contest",
        outcome: { text: "You lose immediately and emphatically. -25 HP. The crowd found it very entertaining. You did not.", hpDelta: -25 },
        statCheck: { stat: 'constitution', threshold: 6, outcome: { text: "You absorb three rounds before the Pachycephalosaurus taps out — it has never had to tap out before. The crowd loses its mind. +50 bones, -10 HP.", bonesDelta: 50, hpDelta: -10 } },
      },
      {
        label: "Decline with dignity",
        outcome: { text: "You decline. The Pachycephalosaurus finds someone else immediately. Moments later you hear a sound like two rocks colliding. You made the correct choice." },
      },
    ],
  },

  // ── Town 2 — The Ashpit ───────────────────────────────────────────────────
  {
    id: 'ash_in_the_drink',
    prompt: "Your drink has a thin layer of ash on it. This is normal here. You're told to stir it. You're told this improves the flavor. The bartender — Scorcha — is watching to see what you do.",
    choices: [
      {
        label: "Stir it and drink it",
        outcome: { text: "You stir it and drink. It tastes like old fire and something older than fire. Scorcha nods once. +20 XP.", xpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 5, outcome: { text: "You drink it without flinching. Scorcha slides you a second one on the house. 'I like you,' she says. This is apparently rare. +30 XP.", xpDelta: 30 } },
      },
      {
        label: "Push it away",
        outcome: { text: "You push it away. Scorcha doesn't comment. She takes the drink back and charges you for it anyway." },
      },
    ],
    town: 2,
  },
  {
    id: 'heat_wager',
    prompt: "A veteran fighter challenges you: stand with your feet flat on the arena floor for ten seconds. No gear. No covering. The floor is, as always, warm. The fighter is betting 80 bones you'll hop.",
    choices: [
      {
        label: "Accept the wager",
        outcome: { text: "You last six seconds. -15 HP from the burn. The fighter looks satisfied. -80 bones. You stood longer than most, which is cold comfort.", bonesDelta: -80, hpDelta: -15 },
        statCheck: { stat: 'constitution', threshold: 7, outcome: { text: "You stand the full ten seconds without expression. The fighter pays the 80 bones without argument and does not make eye contact again. +80 bones.", bonesDelta: 80 } },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. The veteran moves on quickly, suggesting there are other targets. This is likely correct." },
      },
    ],
    town: 2,
  },
  {
    id: 'lava_tube_job',
    prompt: "A mercenary recruiter approaches. 'Easy scouting job. Down a lava tube, count the vents, come back.' The pay is 120 bones. The recruiter has notably no eyebrows.",
    contextHint: { stat: 'constitution', statThreshold: 6, text: "You've built enough durability that 'easy scouting down a lava tube' is merely concerning rather than fatal." },
    choices: [
      {
        label: "Take the job",
        outcome: { text: "You descend. The vents are counted. The exit is not where the map said. You find it. -20 HP from the heat, +120 bones from the job.", bonesDelta: 120, hpDelta: -20 },
        statCheck: { stat: 'constitution', threshold: 6, outcome: { text: "You descend, count the vents, find a secondary vent cluster the recruiter didn't know about, and report it separately for a bonus. +160 bones, -10 HP.", bonesDelta: 160, hpDelta: -10 } },
      },
      {
        label: "Ask how the recruiter lost their eyebrows",
        outcome: { text: "'Last scouting job,' they say. There is a long pause. You decline the assignment. The recruiter seems to expect this." },
      },
    ],
    town: 2,
  },
  {
    id: 'scorcha_test',
    prompt: "Scorcha points at a new fighter across the bar who is loudly claiming they don't fear the Ashpit. 'I give it a week,' she says. 'You give it a month. Bones on the table.' She's offering 50 bones if you're right.",
    choices: [
      {
        label: "Take the bet — a month",
        outcome: { text: "Two weeks in, the fighter vanishes. You both lose. Scorcha shrugs. 'Tie.' You're charged for both drinks anyway.", bonesDelta: -15 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You watch the fighter for two minutes and spot the tells — good footwork, bad eyes. You say 'ten days.' Scorcha raises an eyebrow. On day nine, the fighter retires. You collect 70 bones for precision. +70 bones.", bonesDelta: 70 } },
      },
      {
        label: "Side with Scorcha — a week",
        outcome: { text: "You agree: a week. You're both wrong. It's four days. Scorcha buys the round as a concession prize." },
      },
    ],
    town: 2,
  },
  {
    id: 'ash_burial_rumor',
    prompt: "An older fighter leans over and says quietly: 'They say there are bones under the pit. Old ones. Champions. You fight on top of them every time.' They seem to think this means something specific.",
    choices: [
      {
        label: "Ask what they mean",
        outcome: { text: "They explain a theory involving the volcanic rock, the former champions, and something they call 'the weight of what's underneath.' It is unsettling and probably not untrue. +25 XP.", xpDelta: 25 },
      },
      {
        label: "Buy them a drink and listen",
        outcome: { text: "You spend 20 bones on their drink and they talk for an hour. The story gets larger and stranger. By the end you're not sure if they're a historian or a prophet. -20 bones, +30 XP.", bonesDelta: -20, xpDelta: 30 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "You listen carefully and ask good questions. The story becomes a map of the arena's weak points — places where the floor gives slightly, where fighters have stumbled. Useful. -20 bones, +40 XP.", bonesDelta: -20, xpDelta: 40 } },
      },
      {
        label: "Ignore it",
        outcome: { text: "You look back at your drink. Some information is fine to not have." },
      },
    ],
    town: 2,
  },
  {
    id: 'mercenary_grudge',
    prompt: "A mercenary you don't recognize stares at you from across the bar with focused intensity. You've never met them. They clearly believe otherwise. They've been staring for fifteen minutes.",
    choices: [
      {
        label: "Approach them directly",
        outcome: { text: "You approach. They have the wrong fighter — someone with your coloring from two seasons back. They apologize, briefly, and buy you a drink to correct the energy. +10 XP.", xpDelta: 10 },
        statCheck: { stat: 'roar', threshold: 5, outcome: { text: "You approach with the kind of posture that says 'this conversation ends on my terms.' They immediately recognize the error and compensate with 40 bones and excessive courtesy. +40 bones.", bonesDelta: 40 } },
      },
      {
        label: "Stare back until something happens",
        outcome: { text: "Fifteen minutes becomes thirty. Eventually they look away first. You never find out what the original issue was. +15 XP for endurance.", xpDelta: 15 },
        statCheck: { stat: 'ferocity', threshold: 6, outcome: { text: "Fifteen minutes becomes twenty. Then they put 50 bones on the bar, slide them toward you without breaking eye contact, and leave. You take the bones. +50 bones.", bonesDelta: 50 } },
      },
    ],
    town: 2,
  },
  {
    id: 'volcanic_politics',
    prompt: "A magistrate from the volcanic settlement wants 'a word.' Ash management policies are in dispute. Half the Ashpit regulars are on each side. They want you to publicly take a position. You fight here. Both sides know your face.",
    contextHint: { stat: 'roar', statThreshold: 7, text: "Your voice carries weight in this arena. Whichever side you back will feel it." },
    choices: [
      {
        label: "Support the settlement magistrate",
        outcome: { text: "You make your position known. One faction applauds. The other avoids you for a week. The magistrate pays a consulting fee. +60 bones.", bonesDelta: 60 },
      },
      {
        label: "Stay neutral — this is above your pay grade",
        outcome: { text: "You decline to take a side. The magistrate is disappointed but professional. Both factions consider you approximately trustworthy. Probably the correct outcome.", xpDelta: 15 },
      },
      {
        label: "Take whoever's side pays more",
        outcome: { text: "You quietly auction your public endorsement. Both parties bid. You end up with 90 bones and a reputation that will absolutely come up again at the worst moment. +90 bones.", bonesDelta: 90 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: "You auction the endorsement, extract maximum value from each party, then publicly endorse the winner with a statement so neutral it technically satisfies both. +110 bones, +20 XP.", bonesDelta: 110, xpDelta: 20 } },
      },
    ],
    town: 2,
  },
  {
    id: 'crater_offering',
    prompt: "An old crater-priest stops you and hands you a small carved stone. 'Place it at the arena entrance before your next fight,' they say. 'The pit remembers who honors it.' They don't ask for payment. This somehow makes it worse.",
    choices: [
      {
        label: "Place the stone as instructed",
        outcome: { text: "You place the stone. Nothing visible happens. You feel obscurely better about the fight regardless. +20 XP.", xpDelta: 20 },
        statCheck: { stat: 'ferocity', threshold: 5, outcome: { text: "You place the stone. As you straighten up, something shifts in your posture — a readiness that wasn't there before. The pit, whatever it is, noticed. +25 XP, +15 HP.", xpDelta: 25, hpDelta: 15 } },
      },
      {
        label: "Pocket it — it might be valuable",
        outcome: { text: "You pocket it and have a perfectly average fight. A week later you find the stone in your pocket and feel strange. You leave it outside." },
      },
    ],
    town: 2,
  },
  {
    id: 'scorcha_debt',
    prompt: "Scorcha tells you a fighter owes her 150 bones 'for reasons.' She wants you to collect. 'I'll give you 40 for the errand,' she says, wiping the bar without looking up. This is not a request.",
    choices: [
      {
        label: "Collect the debt",
        outcome: { text: "You collect it. The fighter is grumpy about it. You are not sympathetic. +40 bones.", bonesDelta: 40 },
        statCheck: { stat: 'strength', threshold: 7, outcome: { text: "You collect it efficiently. The fighter considers their options, looks at you, and pays 160 instead of 150 to avoid follow-up questions. Scorcha gives you 45 for the extra ten. +45 bones.", bonesDelta: 45 } },
      },
      {
        label: "Ask what the debt is for first",
        outcome: { text: "'Doesn't matter,' Scorcha says. You believe her. You go collect it.", bonesDelta: 40 },
      },
      {
        label: "Decline — not your business",
        outcome: { text: "You decline. Scorcha looks at you for a long moment. 'Fine,' she says. The next drink she pours you is noticeably smaller. Some relationships are transactional." },
      },
    ],
    town: 2,
  },
  {
    id: 'smoke_hallucination',
    prompt: "The vent above the bar is leaking again. The smoke is thick and smells like minerals and something older. After twenty minutes you're not entirely sure the fighter across from you is real.",
    contextHint: { lowHp: true, text: "You're already hurt. Whatever's in that smoke is hitting differently." },
    choices: [
      {
        label: "Step outside for air",
        outcome: { text: "You step outside. The air is fresh by Ashpit standards, which is marginal. Your head clears. You feel fine. +15 XP.", xpDelta: 15 },
      },
      {
        label: "Stay and see what happens",
        outcome: { text: "You stay. By the third hour you have a strong opinion about the geological memory of the crater. By morning it has faded but something about the fight prep feels sharper. +30 XP, -20 HP.", xpDelta: 30, hpDelta: -20 },
        statCheck: { stat: 'constitution', threshold: 7, outcome: { text: "Your body filters most of it. What remains is a clarity about the arena that's hard to name. +35 XP, -5 HP.", xpDelta: 35, hpDelta: -5 } },
      },
    ],
    town: 2,
  },
  {
    id: 'rival_fighter_approach',
    prompt: "The best fighter in the Ashpit's current bracket sits down across from you uninvited. 'I've seen your fights,' they say. 'You're interesting. I want to be the one who ends that.' They seem genuinely complimentary about this.",
    choices: [
      {
        label: "Accept it as a compliment",
        outcome: { text: "You nod. They nod back. The conversation ends there. You both know what's coming and neither of you is uncomfortable with it. +20 XP.", xpDelta: 20 },
      },
      {
        label: "Tell them to book the fight officially",
        outcome: { text: "You direct them to the official scheduling. They smile. This was also the correct answer. +15 XP.", xpDelta: 15 },
        statCheck: { stat: 'roar', threshold: 6, outcome: { text: "You say it with enough weight that several people at nearby tables hear and go quiet. The rival pauses. Good. Let them think about it. +20 XP.", xpDelta: 20 } },
      },
      {
        label: "Return the threat",
        outcome: { text: "You tell them you've seen their fights too. The specificity of your observations visibly unsettles them. They leave. +25 XP.", xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: "You identify the one fight they nearly lost and name the round. They go still. Then they leave without another word. +30 XP.", xpDelta: 30 } },
      },
    ],
    town: 2,
  },
  {
    id: 'ashpit_betting_pool',
    prompt: "Someone is running an under-the-table betting pool on who survives the season. Your odds are listed at 4-to-1. You could bet on yourself. The organizer pretends not to notice you.",
    choices: [
      {
        label: "Bet 50 bones on yourself",
        outcome: { text: "You place the bet. Now you have financial motivation on top of professional motivation. -50 bones, +20 XP.", bonesDelta: -50, xpDelta: 20 },
        statCheck: { stat: 'ferocity', threshold: 6, outcome: { text: "You bet 50 bones and make sure the organizer sees your expression when you do it. The odds shift. People follow your lead. -50 bones, +25 XP.", bonesDelta: -50, xpDelta: 25 } },
      },
      {
        label: "Walk away from the pool entirely",
        outcome: { text: "You leave it alone. Betting on yourself is a motivation problem. Betting against yourself is a character problem. Walking away is the cleanest option." },
      },
    ],
    town: 2,
  },
  {
    id: 'eruption_scare',
    prompt: "The crater groans. This happens. Everyone in the Ashpit knows this happens. A newcomer at the bar stands up in a panic and knocks over three drinks. The veterans don't move. You are now being watched to see which category you fall into.",
    choices: [
      {
        label: "Don't move",
        outcome: { text: "You don't move. The veterans note this. The newcomer sits back down. You are served first next round. +20 XP.", xpDelta: 20 },
        statCheck: { stat: 'roar', threshold: 5, outcome: { text: "You don't move. You also, almost involuntarily, make a sound — not quite a word — that settles the room. Scorcha raises an eyebrow. +30 XP.", xpDelta: 30 } },
      },
      {
        label: "Steady the newcomer",
        outcome: { text: "You put a hand on their shoulder. 'It does that,' you say. They exhale. Scorcha gives you a small nod. +15 XP.", xpDelta: 15 },
      },
      {
        label: "Also flinch — you've been here a week",
        outcome: { text: "You flinch. It happens. Nobody says anything. They did the same thing when they first arrived. This will pass." },
      },
    ],
    town: 2,
  },
  {
    id: 'forgemaster_favor',
    prompt: "The Ashpit's equipment forger offers you a deal: work the bellows for two hours and she'll give you a 10% discount on all future gear. Two hours at the crater forge. Near the vents.",
    contextHint: { stat: 'stamina', statThreshold: 7, text: "You've built the kind of endurance where two hours at a forge is work, not ordeal." },
    choices: [
      {
        label: "Work the bellows",
        outcome: { text: "Two hours later you are done and extremely warm. The forger keeps her word. -20 HP, +25 XP.", hpDelta: -20, xpDelta: 25 },
        statCheck: { stat: 'stamina', threshold: 7, outcome: { text: "You work the full two hours without flagging. The forger extends the deal to 15% and offers a standing invitation. -10 HP, +30 XP.", hpDelta: -10, xpDelta: 30 } },
      },
      {
        label: "Negotiate for more",
        outcome: { text: "You counter-offer: three hours for 15%. She agrees. You work three hours. -30 HP, +30 XP.", hpDelta: -30, xpDelta: 30 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You counter for 20%. She pauses. Agrees. Then shows you a technique that reduces heat exposure. -15 HP, +40 XP.", hpDelta: -15, xpDelta: 40 } },
      },
      {
        label: "Decline — you pay full price",
        outcome: { text: "You decline. She doesn't push it. You will, in fact, pay full price." },
      },
    ],
    town: 2,
  },
  {
    id: 'pit_rat_infestation',
    prompt: "The Ashpit has pit rats. Volcanic variants — small, fast, immune to reasonable temperatures. They've gotten into the equipment storage. Scorcha is paying 5 bones per rat, no questions, bring the tail as proof.",
    choices: [
      {
        label: "Spend an hour hunting rats",
        outcome: { text: "You catch eleven in an hour. 55 bones. The eleventh one bites your ankle on the way out. -5 HP. +55 bones.", bonesDelta: 55, hpDelta: -5 },
        statCheck: { stat: 'agility', threshold: 6, outcome: { text: "You catch nineteen in the hour. 95 bones. One never touches you. You leave when Scorcha runs out of small coins. +95 bones.", bonesDelta: 95 } },
      },
      {
        label: "Set a trap and come back later",
        outcome: { text: "You return to find eight rats and a medium-sized thing that is definitely not a rat. 40 bones for the tails, handled separately. +40 bones.", bonesDelta: 40 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "Your trap is genuinely clever. You return to twenty-three rats. 115 bones. Scorcha asks if you can make a second trap. +115 bones.", bonesDelta: 115 } },
      },
      {
        label: "Ignore it — not your problem",
        outcome: { text: "You ignore it. The rats are not your problem. They will, however, be someone's problem. The tavern will be dealing with this for a while." },
      },
    ],
    town: 2,
  },
  {
    id: 'message_relay',
    prompt: "A fighter too injured to travel hands you a sealed message. 'Get it to the betting house on the east rim. 30 bones for the delivery, 30 more on return.' You look at the seal. The seal is melted ash. Unofficial.",
    choices: [
      {
        label: "Take the job",
        outcome: { text: "You deliver it. They pay on sight. The return payment waits at the bar. +60 bones.", bonesDelta: 60 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "On the way you note the east rim betting house's side entrance used for exactly these messages. Filed for later use. +60 bones, +20 XP.", bonesDelta: 60, xpDelta: 20 } },
      },
      {
        label: "Open the message first",
        outcome: { text: "You open it. It's a fight-throw instruction for someone named 'Vel.' You deliver it anyway. You collect 60 bones and never find out if Vel complied. +60 bones.", bonesDelta: 60 },
      },
      {
        label: "Decline",
        outcome: { text: "You decline. The injured fighter looks resigned. This also seems to have been expected." },
      },
    ],
    town: 2,
  },
  {
    id: 'ashpit_honor_code',
    prompt: "A crowd has formed around two fighters mid-argument. One is claiming the other landed an illegal hit in their last bout. Scorcha is watching from the bar to see if anyone handles this before it turns structural.",
    choices: [
      {
        label: "Step in and arbitrate",
        outcome: { text: "You get between them. Both pause. You make a ruling — neither satisfying nor wrong. Both fighters accept it because you said it. +20 XP.", xpDelta: 20 },
        statCheck: { stat: 'roar', threshold: 6, outcome: { text: "You step in with enough presence that both fighters stop mid-sentence. Your ruling is brief and final. Scorcha hands you 30 bones over the bar. +30 bones, +25 XP.", bonesDelta: 30, xpDelta: 25 } },
      },
      {
        label: "Stay out of it",
        outcome: { text: "You stay out of it. The argument escalates briefly, then resolves badly for the table. Scorcha handles it herself." },
      },
      {
        label: "Take the side of whoever looks more right",
        outcome: { text: "You assess and pick a side. You're correct. The other fighter backs down. +20 XP, and you've made one new ally and one new enemy.", xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You pick the correct side with specific reference to the rule. The wronged fighter later hands you 25 bones in quiet gratitude. +25 bones, +20 XP.", bonesDelta: 25, xpDelta: 20 } },
      },
    ],
    town: 2,
  },
  {
    id: 'ash_healer',
    prompt: "The Ashpit's healer offers you a 'volcanic recovery treatment.' Hot ash pressed against injuries. It sounds terrible. They claim it works faster than conventional healing. They also have no eyebrows.",
    contextHint: { lowHp: true, text: "You're hurt. The eyebrow situation is not ideal evidence, but you're hurt." },
    choices: [
      {
        label: "Accept the treatment",
        outcome: { text: "It feels exactly as bad as it sounds. Then, ten minutes later, you feel significantly better. +30 HP.", hpDelta: 30 },
        statCheck: { stat: 'constitution', threshold: 6, outcome: { text: "Your body responds well. The healer says 'interesting' three times. +45 HP.", hpDelta: 45 } },
      },
      {
        label: "Use the standard healer instead",
        outcome: { text: "You use the standard healing options. Conventional. Effective. You still have eyebrows afterward. This feels like a win." },
      },
    ],
    town: 2,
  },
  {
    id: 'fallen_champion_relics',
    prompt: "A vendor is selling 'authentic relics of Ashpit champions.' Teeth, scale fragments, claw shards — each with a story card. 40 bones per piece. Scorcha walks past the display and says nothing, which is telling.",
    choices: [
      {
        label: "Buy a relic",
        outcome: { text: "You buy a tooth with an attached story. Whether true or not is unclear. You feel slightly better going into your next fight. -40 bones, +15 XP.", bonesDelta: -40, xpDelta: 15 },
      },
      {
        label: "Ask Scorcha about the vendor",
        outcome: { text: "Scorcha refills a glass for three seconds, then says: 'Bones are real. Stories might be.' You buy one. -40 bones, +15 XP.", bonesDelta: -40, xpDelta: 15 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: "You cross-reference two story cards and find the same name on both. You get two relics for 40 bones by politely noting the inconsistency. -40 bones, +25 XP.", bonesDelta: -40, xpDelta: 25 } },
      },
      {
        label: "Walk past",
        outcome: { text: "You walk past. Someone's history, someone's teeth. Neither your business." },
      },
    ],
    town: 2,
  },
  {
    id: 'the_old_fighter',
    prompt: "The oldest fighter you've seen at the Ashpit is sitting alone with a drink, staring at the arena floor through the window. They've been there for two hours. They haven't touched the drink.",
    choices: [
      {
        label: "Sit down beside them",
        outcome: { text: "You sit. They don't look up. After a while they say: 'It goes faster than you think.' Then they drink. Then they leave. +25 XP.", xpDelta: 25 },
      },
      {
        label: "Ask how many fights they've won",
        outcome: { text: "They name a number. Then add: 'Counts the losses too. That's the only honest count.' -20 bones for buying their next drink. +30 XP.", bonesDelta: -20, xpDelta: 30 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: "They name wins, losses, then say: 'The ones I quit before the other one killed me don't show up on the board. Those are mine.' +35 XP.", xpDelta: 35 } },
      },
      {
        label: "Leave them to it",
        outcome: { text: "You leave them to it. Whatever they're looking at, it belongs to them." },
      },
    ],
    town: 2,
  },

  // ── Town 3 Tavern Quests — Brine's ──────────────────────────────────────────

  {
    id: 'murkfen_fog_bet',
    prompt: 'Brine sets your drink down without looking at you. "Fog\'s thick tonight," she says. "Thicker than usual. Something\'s moving around in the outer bog. Two fighters already put money on what it is. Care to wager?" She slides a bone pouch onto the counter.',
    town: 3,
    choices: [
      {
        label: 'Put 30 bones on \'large predator\'',
        outcome: { text: 'Whatever it was stays in the fog. Brine collects the wagers at dawn. Nobody guessed right. -30 bones.', bonesDelta: -30 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: 'You listened to the displacement in the water before betting. You guessed correctly. Brine pays out 75 bones without a word. +75 bones.', bonesDelta: 75 } },
      },
      {
        label: 'Decline the wager',
        outcome: { text: 'You decline. Brine nods once. "Smart," she says. This is the most approval she\'s offered anyone this evening.' },
      },
    ],
  },
  {
    id: 'murkfen_fallen_fighter',
    prompt: 'A fighter comes through the door soaking wet from the neck down. They\'re alive. They\'re also not saying anything about why they\'re wet. They sit at the bar and order a drink. Brine fills it without asking. She glances at you.',
    contextHint: { lowHp: true, text: 'You know the feeling. Whatever happened to them out there, you don\'t want to follow.' },
    town: 3,
    choices: [
      {
        label: 'Ask them what happened',
        outcome: { text: 'They look at you for a long moment. "Platform three," they say. Then they finish their drink and go to bed. You think about platform three. +15 XP for the intelligence, for all the good it does you.', xpDelta: 15 },
      },
      {
        label: 'Buy them a second drink',
        outcome: { text: 'They accept it. After the second drink, they tell you there\'s an opening in the platforms over the south channel. They show you on a rough map and you memorize it. +25 XP.', xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: 'You buy the drink and ask exactly the right question at exactly the right moment. They tell you everything. The south-channel platform has a blind spot. You file that away. +25 XP, +30 bones from a small side bet you immediately place using this information.', xpDelta: 25, bonesDelta: 30 } },
      },
      {
        label: 'Leave them alone',
        outcome: { text: 'You let them sit in peace. Brine refills their drink on the house. You look at the fog through the window and wonder about platform three.' },
      },
    ],
  },
  {
    id: 'murkfen_information_sale',
    prompt: '"You want information or a drink?" Brine asks. You didn\'t ask for either. She\'s watching you like this is already a transaction. "Twenty bones for the information. Drink\'s fifteen. Both together is thirty."',
    town: 3,
    choices: [
      {
        label: 'Buy the information',
        outcome: { text: '"Your next opponent leads with their left," Brine says. "And they panic in fog." That\'s twenty bones well spent. -20 bones, +25 XP.', bonesDelta: -20, xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: '"Your next opponent leads left and panics in fog," Brine says. You ask a follow-up. She answers it. And the one after that. Thirty bones gets you a full tactical picture. -20 bones, +40 XP.', bonesDelta: -20, xpDelta: 40 } },
      },
      {
        label: 'Buy the drink',
        outcome: { text: 'It\'s something warm and dark and it tastes like the bog smells, but in a way you eventually come to terms with. -15 bones. No information. Brine watches the door.', bonesDelta: -15 },
      },
      {
        label: 'Buy both',
        outcome: { text: 'Brine gives you the information and the drink simultaneously. She has clearly done this before. -30 bones, +25 XP.', bonesDelta: -30, xpDelta: 25 },
      },
    ],
  },
  {
    id: 'murkfen_water_sound',
    prompt: 'Something bumps against the underside of the floorboards beneath your feet. Once. Then again. Then silence. The fireflies above the bar don\'t react. Brine doesn\'t look up from the counter. The fighter next to you has quietly moved their feet off the floor.',
    contextHint: { lowHp: true, text: 'You\'re already not at full health. Whatever\'s under the floor seems aware of that somehow.' },
    town: 3,
    choices: [
      {
        label: 'Look through the floor crack',
        outcome: { text: 'You see water. Dark water. Something moves in it that is not small. You put your feet back on the floor and don\'t look again. -10 HP from the shock of it.', hpDelta: -10 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: 'You look carefully. It\'s large, yes. But it\'s also navigating around the support posts — it\'s done this before and it\'s not interested in the floor. You go back to your drink with more information and the same number of limbs. +20 XP.', xpDelta: 20 } },
      },
      {
        label: 'Move tables',
        outcome: { text: 'You relocate without drawing attention to yourself. Brine nods slightly. The bumping stops after a few minutes. Whatever it was continued on.' },
      },
      {
        label: 'Ask Brine what that was',
        outcome: { text: '"Channel thing," Brine says. "It comes through sometimes." A pause. "It\'s fine." The pause before \'fine\' was longer than you would have preferred.' },
      },
    ],
  },
  {
    id: 'murkfen_lost_gear',
    prompt: 'A fighter at the next table is describing, with some distress, how their tail weapon fell into the water during a bout. "The rule," Brine says from the bar, without looking up. The fighter looks like they know the rule. They\'re hoping someone will help them retrieve it anyway.',
    town: 3,
    choices: [
      {
        label: 'Offer to dive for it — for a fee',
        outcome: { text: 'You negotiate 60 bones and go in. The water is cold and dark and something briefly surfaces near you that you decide not to look at directly. You find the weapon. You get the bones. +60 bones, -15 HP.', bonesDelta: 60, hpDelta: -15 },
        statCheck: { stat: 'agility', threshold: 7, outcome: { text: 'You negotiate 60 bones, go in fast, retrieve the weapon before anything notices, and surface clean. The fighter is impressed. You are briefly very cold. +60 bones, +15 XP.', bonesDelta: 60, xpDelta: 15 } },
      },
      {
        label: 'Remind them of the rule',
        outcome: { text: '"Whatever falls in stays there," you say. The fighter already knew. Brine refills your drink.' },
      },
      {
        label: 'Go in without negotiating first',
        outcome: { text: 'You retrieve it out of straightforward helpfulness. The fighter is grateful and gives you 30 bones. You are also wet. +30 bones, -10 HP.', bonesDelta: 30, hpDelta: -10 },
      },
    ],
  },
  {
    id: 'murkfen_fog_stranger',
    prompt: 'A fighter you\'ve never seen before sits across from you out of the fog. They don\'t order anything. They look at you with the calm of someone who has been watching you for longer than this conversation has been happening. "You fight tomorrow," they say. It\'s not a question.',
    contextHint: { stat: 'cunning', statThreshold: 5, text: 'Something about their posture — the way they already know where the exits are — suggests this isn\'t casual.' },
    town: 3,
    choices: [
      {
        label: 'Ask who they are',
        outcome: { text: 'They smile. "Someone who has watched you fight." They leave as quietly as they arrived. You don\'t hear the door. +15 XP for unresolved paranoia.', xpDelta: 15 },
      },
      {
        label: 'Tell them nothing and wait',
        outcome: { text: 'You say nothing and watch them. They watch you. After ninety seconds they nod, apparently satisfied, and walk back into the fog. You feel like you just passed some kind of test.', xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: 'You stay completely still and watch their eyes. They\'re timing your reactions. You give them nothing and they eventually leave. Brine tells you they asked about you an hour ago. You file that away. +30 XP, +25 bones from Brine who seems to appreciate the performance.', xpDelta: 30, bonesDelta: 25 } },
      },
      {
        label: 'Get up and follow when they leave',
        outcome: { text: 'You follow them to the door. The fog is complete. There is no sound of footsteps. There is nothing. You go back inside and tell Brine. She says: "That\'s happened before." She does not elaborate.', xpDelta: 10 },
      },
    ],
  },
  {
    id: 'murkfen_bug_cloud',
    prompt: 'A cloud of large bog insects drifts through the propped-open door. Most patrons ignore them. One lands on your drink. Brine swats it away without looking. Another lands on the fighter beside you, who doesn\'t react at all. They may be asleep. Or something else.',
    town: 3,
    choices: [
      {
        label: 'Check if the fighter beside you is okay',
        outcome: { text: 'They\'re asleep. Deeply asleep. You find 25 bones that fell from their pack while they were out. They look fine. Probably fine. +25 bones.', bonesDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 4, outcome: { text: 'You check their pulse. Asleep, deeply, from something in their drink probably. You find 40 bones from their open pack and also a small note with their fight schedule. Useful. +40 bones, +20 XP.', bonesDelta: 40, xpDelta: 20 } },
      },
      {
        label: 'Cover your drink and wait it out',
        outcome: { text: 'You wait. The cloud drifts on. Your drink is intact. You consider this a complete victory.' },
      },
    ],
  },
  {
    id: 'murkfen_firefly_jar',
    prompt: 'A child — or something very small wearing a hat — offers to sell you a sealed jar of Murkfen fireflies for 15 bones. "They make good light," it says. Brine watches from the bar with an expression you can\'t fully read.',
    town: 3,
    choices: [
      {
        label: 'Buy the jar',
        outcome: { text: 'The fireflies light up your pack warmly for three days before escaping through a gap in the seam. They were good light while they lasted. -15 bones, +15 XP for the experience.', bonesDelta: -15, xpDelta: 15 },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. The figure finds someone else. You navigate the direct path and arrive on time, wet from the fog.' },
      },
      {
        label: 'Ask Brine if you should buy it',
        outcome: { text: '"Up to you," Brine says. "They\'re real fireflies." A pause. "The hat is also real." You buy it. -15 bones. The fireflies are, as advertised, real.', bonesDelta: -15 },
      },
    ],
  },
  {
    id: 'murkfen_arena_rumor',
    prompt: 'Two fighters at the bar are arguing about whether the Bog Bowl\'s east platform has a weak plank. One says yes. One says they\'re thinking of the west platform. Brine listens to both of them without contributing. She glances at you.',
    contextHint: { stat: 'cunning', statThreshold: 4, text: 'Brine\'s glance means something. You\'re fairly sure she knows which platform is actually compromised.' },
    town: 3,
    choices: [
      {
        label: 'Ask Brine directly',
        outcome: { text: '"East," she says, then goes back to wiping the counter. Information acquired. +20 XP.', xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: '"East," she says. Then, quietly: "Third plank from the post. Test it before you commit weight." She charges you 10 bones for the specificity. -10 bones, +30 XP.', bonesDelta: -10, xpDelta: 30 } },
      },
      {
        label: 'Side with one of the arguing fighters',
        outcome: { text: 'You back the east platform theory. The fighter on the west side doesn\'t concede but goes quiet. Later you find out you were right. +15 XP.', xpDelta: 15 },
      },
      {
        label: 'Let them argue',
        outcome: { text: 'They argue for another twenty minutes and reach no conclusion. The plank continues to be where it is.' },
      },
    ],
  },
  {
    id: 'murkfen_night_visitor',
    prompt: 'Something large moves past the window in the fog, briefly occluding the light from outside. It takes four seconds to pass. Four seconds is very long. It does not stop. Nobody in Brine\'s says anything. Brine refills a glass.',
    contextHint: { lowHp: true, text: 'You are not at full health. Whatever that was is very large. The wall between you and it is very thin.' },
    town: 3,
    choices: [
      {
        label: 'Ask what that was',
        outcome: { text: '"It comes through sometimes," Brine says. "At night." You wait for more. She doesn\'t add any. +10 XP for your continued existence.', xpDelta: 10 },
      },
      {
        label: 'Watch until it\'s gone, then say nothing',
        outcome: { text: 'You watch the window until you\'re sure it\'s past. Then you go back to your drink. Brine slides you a small bonus portion without being asked. +20 HP from the extra food.', hpDelta: 20 },
        statCheck: { stat: 'stamina', threshold: 7, outcome: { text: 'You keep your composure so completely that the fighter two seats down visibly relaxes, taking their cue from you. Brine notices and tops up your drink for free. +25 HP, +15 XP.', hpDelta: 25, xpDelta: 15 } },
      },
    ],
  },
  {
    id: 'murkfen_deal_in_reeds',
    prompt: 'A hooded figure — deep hood, fog-damp — slides a small bundle wrapped in reeds to you. "Fifty bones," they murmur. "Opens one door that\'s been locked." Brine is watching from the far end of the bar. She doesn\'t intervene.',
    town: 3,
    choices: [
      {
        label: 'Buy the bundle',
        outcome: { text: 'You buy it. Inside: a key and a wet piece of paper with a map to a storage locker beneath the eastern walkway. Inside the locker: 90 bones. Net outcome positive. -50 bones, +90 bones.', bonesDelta: 40 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: 'You buy it and examine the map carefully before committing. You also check the key for a counterfeit stamp. It\'s legitimate. The locker has 120 bones and a piece of gear nobody claimed. -50 bones, +120 bones, +20 XP.', bonesDelta: 70, xpDelta: 20 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. The figure nods, takes the bundle back, and drifts out into the fog. Brine gives you a look that might be approval. Hard to say.' },
      },
      {
        label: 'Ask what\'s inside first',
        outcome: { text: '"A key," the figure says. "For something worth more than fifty bones." That\'s not very specific. You decline. The figure doesn\'t seem surprised.' },
      },
    ],
  },
  {
    id: 'murkfen_stamina_challenge',
    prompt: 'A seasoned bog-fighter challenges you to hold a fighting stance on one of the narrow training posts over the dark water for five minutes without falling. "The water\'s not dangerous tonight," she says. She says \'tonight\' specifically.',
    contextHint: { lowHp: true, text: 'If you fall while already injured, the water won\'t improve the situation.' },
    town: 3,
    choices: [
      {
        label: 'Accept the challenge',
        outcome: { text: 'You last three minutes and forty seconds before losing your footing. The water is cold. You climb out. The fighter gives you 20 bones for the attempt. -15 HP, +20 bones.', hpDelta: -15, bonesDelta: 20 },
        statCheck: { stat: 'stamina', threshold: 7, outcome: { text: 'You last the full five minutes. The fighter looks at you with professional respect and pays 60 bones. "Same time tomorrow," she says. +60 bones, +20 XP.', bonesDelta: 60, xpDelta: 20 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. She doesn\'t push it. You watch her hold the post for eight minutes to make sure you understood what you were declining.' },
      },
    ],
  },
  {
    id: 'murkfen_fog_gambit',
    prompt: 'Brine places a small carved stone tile on the counter in front of you. "Arena token," she says. "Good for one unrecorded bout in the Bog Bowl after closing. No records. No witnesses. The winner takes what the loser brought in." She slides it over. "Fifty bones to enter."',
    town: 3,
    choices: [
      {
        label: 'Pay the 50 bones and take the token',
        outcome: { text: 'The bout is in near-total fog. Your opponent is fast. You win, barely. Their entry fee: 80 bones. Net gain after the buy-in. -50 bones, +80 bones.', bonesDelta: 30 },
        statCheck: { stat: 'agility', threshold: 8, outcome: { text: 'The fog is nothing to you. You find your opponent by sound and end it quickly. Their entry fee: 80 bones. You leave before Brine closes up. -50 bones, +80 bones, +25 XP.', bonesDelta: 30, xpDelta: 25 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. Brine takes the token back without comment. A fighter three stools down picks it up ten minutes later. You don\'t see them again that evening.' },
      },
    ],
  },
  {
    id: 'murkfen_the_guide',
    prompt: 'A small, damp figure offers to guide you through the outer bog for 30 bones. "Short cut to the east platform," it says. "Dry the whole way." It does not look like it has ever been dry. Brine shrugs when you look at her.',
    town: 3,
    choices: [
      {
        label: 'Pay for the guide',
        outcome: { text: 'The route is wet. You arrive at the east platform from an angle you didn\'t know existed and wouldn\'t have found alone. You also arrive 20 minutes faster. -30 bones, +20 XP for the route knowledge.', bonesDelta: -30, xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: 'You pay the 30 bones and spend the route memorizing landmarks. You now know three unmarked approaches to the arena. -30 bones, +30 XP, and a genuine tactical advantage.', bonesDelta: -30, xpDelta: 30 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. The figure finds someone else. You navigate the direct path and arrive on time, wet from the fog.' },
      },
    ],
  },
  {
    id: 'murkfen_debt',
    prompt: 'A fighter pulls you aside urgently. They owe 100 bones to someone who is, apparently, in the building right now. They need a loan. Just until after the next bout, they promise. They\'re sweating. The person they owe money to is a large Spinosaurus by the door.',
    town: 3,
    choices: [
      {
        label: 'Lend them the 100 bones',
        outcome: { text: 'You lend the bones. After their next bout they repay 90. "Sorry," they say. "Arena cut." -10 bones total. They seem like they mean to pay the rest back.', bonesDelta: -10 },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. They look panicked, then resigned. They go talk to the Spinosaurus directly. You watch this from a safe distance. It\'s fine. Mostly.' },
      },
      {
        label: 'Offer to negotiate with the Spinosaurus yourself',
        outcome: { text: 'You approach the Spinosaurus and outline a settlement schedule on the fighter\'s behalf. The Spinosaurus is surprisingly amenable. The fighter gives you 30 bones for the mediation. +30 bones, +15 XP.', bonesDelta: 30, xpDelta: 15 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: 'You negotiate efficiently and identify that the Spinosaurus actually overcharged on interest. You get the original debt cut to 60 bones and secure the fighter a 2-week window. They pay you 50 bones and look genuinely stunned. +50 bones, +25 XP.', bonesDelta: 50, xpDelta: 25 } },
      },
    ],
  },
  {
    id: 'murkfen_old_token',
    prompt: 'You find an old, corroded arena token at the bottom of your drink — it must have been sitting in the glass. It has a symbol you don\'t recognize. Brine leans over and looks at it. Something in her face changes, very slightly. "Haven\'t seen one of those in a while," she says.',
    town: 3,
    choices: [
      {
        label: 'Ask Brine what it is',
        outcome: { text: '"Old Bog Bowl token. Before my time." A pause. "It might still be honored. Might not." She looks at it once more. "Keep it." +20 XP for the history.', xpDelta: 20 },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: 'Brine explains, in the most words she\'s used tonight, that it\'s a token from the original Murkfen circuit. She then asks the question no one at this bar ever gets asked: if you want to know what it\'s actually worth. She pays you 80 bones for it. +80 bones.', bonesDelta: 80 } },
      },
      {
        label: 'Pocket it and say nothing',
        outcome: { text: 'You pocket it. Brine watches you do this. She says nothing. You feel like you may have made a choice, though you\'re not sure what it was.' },
      },
    ],
  },
  {
    id: 'murkfen_patrol',
    prompt: 'An arena patrol officer, alone, stops at your table and places a form in front of you. "We\'re tracking fighter movement in the outer bog after dark. Did you use the south walkway last night?" You did not. You did use the east walkway, which is technically not what they asked about.',
    town: 3,
    choices: [
      {
        label: 'Answer truthfully — you used the east walkway',
        outcome: { text: 'The officer makes a note and thanks you. You get a small official token for cooperating, worth 20 bones at the arena office. +20 bones.', bonesDelta: 20 },
      },
      {
        label: 'Say you didn\'t use any walkway',
        outcome: { text: 'The officer nods and leaves. Technically accurate. No consequences, no reward.' },
        statCheck: { stat: 'cunning', threshold: 5, outcome: { text: 'The officer nods and leaves. You also notice they left the patrol schedule face-up on the table. You read it before they come back for it. +20 XP for the intelligence.', xpDelta: 20 } },
      },
      {
        label: 'Ask why they want to know',
        outcome: { text: '"Missing fighter," they say. "East bog, last night." They look at you carefully. You look back. They write something on the form and leave. +10 XP for the information.', xpDelta: 10 },
      },
    ],
  },
  {
    id: 'murkfen_waiting_predator',
    prompt: 'Brine leans across the counter at closing time when the bar has mostly emptied. "Something is in the water under the south platform," she says. "It\'s been there for three days. Before you use that platform tomorrow — you should know." She doesn\'t say what it is. She turns back to cleaning the counter.',
    contextHint: { lowHp: true, text: 'You\'re not at full strength. \'Something in the water\' is not a comfortable sentence.' },
    town: 3,
    choices: [
      {
        label: 'Thank her and ask for more detail',
        outcome: { text: '"Big," she says. "Quiet. Patient." She pauses. "It\'s probably not interested in you." The word \'probably\' is doing a lot of work. +25 XP for the warning.', xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 6, outcome: { text: 'You ask the right follow-up questions and Brine answers all of them. By the time you leave you know the creature\'s likely territory, its feeding pattern, and two approaches to the south platform that avoid its sightlines. +30 XP, and significantly improved survival odds.', xpDelta: 30 } },
      },
      {
        label: 'Pay her for the warning',
        outcome: { text: 'You slide 20 bones across the counter. She looks at them. "Wasn\'t a sale," she says. She takes them anyway. -20 bones, +30 XP.', bonesDelta: -20, xpDelta: 30 },
      },
    ],
  },
  {
    id: 'murkfen_cunning_test',
    prompt: 'A veteran Murkfen fighter, deeply still and watchful, slides a small box to the center of the table. "Open it without lifting the lid," they say. "Take what\'s inside without removing it. And tell me what\'s in it before you open it." They fold their arms. "It\'s a test. Yes, it matters."',
    contextHint: { stat: 'cunning', statThreshold: 6, text: 'This is the kind of challenge that\'s actually an interview.' },
    town: 3,
    choices: [
      {
        label: 'Attempt it',
        outcome: { text: 'You try three approaches. The box stays closed but you hear something small shift inside. Eventually the veteran opens it: a small mirror. "You showed me exactly who you are," they say. "That\'s the test." +25 XP.', xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 7, outcome: { text: 'You tilt the box toward the window, read the shadow displacement, deduce a small reflective object, and say "mirror" before touching it. The veteran\'s expression doesn\'t change but their eyes do. "Come find me before your next bout," they say. They give you 70 bones and a fighting tip worth more. +70 bones, +30 XP.', bonesDelta: 70, xpDelta: 30 } },
      },
      {
        label: 'Decline the test',
        outcome: { text: 'You decline. The veteran nods once. "That\'s an answer too," they say, and take the box back. You are not sure whether you passed or failed.' },
      },
    ],
  },
  {
    id: 'murkfen_last_rounds',
    prompt: 'Last call at Brine\'s. The fog has come all the way to the door. One other fighter is still at the bar — someone you\'ll face in the arena tomorrow. You\'ve both noticed. Neither of you has acknowledged it. Brine sets down two drinks without being asked.',
    town: 3,
    choices: [
      {
        label: 'Acknowledge it — drink together',
        outcome: { text: 'You raise the drink. They raise theirs. No words. You both understand. +20 XP. Tomorrow will be what it is.', xpDelta: 20 },
      },
      {
        label: 'Leave without finishing the drink',
        outcome: { text: 'You stand up and go. They watch you leave. Brine says nothing. The fog closes behind you on the walkway. You sleep well. +15 XP for the discipline.', xpDelta: 15 },
        statCheck: { stat: 'stamina', threshold: 6, outcome: { text: 'You leave, sleep well, and arrive to the arena tomorrow rested and clear-headed. The other fighter has dark circles. Preparation is a fight you already won. +15 XP, +20 bones from feeling like yourself.', xpDelta: 15, bonesDelta: 20 } },
      },
      {
        label: 'Start a conversation',
        outcome: { text: 'You talk for an hour about the Murkfen, about other arenas, about a fighter you both once saw do something remarkable. Nothing tactical is shared. You both understood the terms. +15 XP for the human moment, or whatever passes for it here.', xpDelta: 15 },
      },
    ],
  },

  // ── Town 4 Tavern Quests — Voryn's ──────────────────────────────────────────

  {
    id: 'hollowcrown_arrival',
    prompt: 'You walk into Voryn\'s for the first time. The room is cold and very quiet. Stone walls. One fire. Voryn watches you from behind the bar. There is one kind of drink. A veteran fighter across the room looks you over once and then looks away. Voryn says: "It\'s warm." They mean the drink.',
    town: 4,
    choices: [
      {
        label: 'Order the drink',
        outcome: { text: 'It\'s warm. It\'s a single variety of something brewed from what grows at altitude. It tastes like endurance. -15 bones, +20 XP for completing the ascent.', bonesDelta: -15, xpDelta: 20 },
      },
      {
        label: 'Look around the room first',
        outcome: { text: 'You take in the room. Three fighters with histories written on them. One empty stool that feels like it belongs to someone. Voryn waits. You order the drink. -15 bones. +15 XP.', bonesDelta: -15, xpDelta: 15 },
        statCheck: { stat: 'cunning', threshold: 8, outcome: { text: 'You read the room completely before ordering. The fighter in the corner was champion here three seasons ago. The empty stool hasn\'t been filled since someone didn\'t come back. You file all of it. -15 bones, +25 XP.', bonesDelta: -15, xpDelta: 25 } },
      },
    ],
  },
  {
    id: 'hollowcrown_thin_air',
    prompt: 'You woke up this morning and the altitude hit you harder than yesterday. Everything is slower. Your chest is tighter. A veteran at the bar watches you work through it and says, without malice: "Takes three weeks. You\'re in week one." They don\'t offer help. They don\'t need to.',
    contextHint: { lowHp: true, text: 'The thin air is compounding. You\'re already not at full strength.' },
    town: 4,
    choices: [
      {
        label: 'Ask the veteran how they adapted',
        outcome: { text: '"Slowly," they say. "And then suddenly." They go back to their drink. +20 XP for the most useful two words you\'ll hear this week.', xpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 10, outcome: { text: '"Slowly, then suddenly," they say. Then they look at your build and add: "You\'re ahead of schedule." This is the most encouragement anyone offers in Voryn\'s. +20 XP, +30 HP from the confidence alone.', xpDelta: 20, hpDelta: 30 } },
      },
      {
        label: 'Push through and train anyway',
        outcome: { text: 'You train through the altitude. It\'s hard. You complete it. -15 HP from the exertion, +25 XP from the adaptation.', hpDelta: -15, xpDelta: 25 },
      },
      {
        label: 'Rest for the day',
        outcome: { text: 'You rest. This is the correct choice. Nobody here judges it. The altitude is a real thing. +20 HP.', hpDelta: 20 },
      },
    ],
  },
  {
    id: 'hollowcrown_the_stool',
    prompt: 'The corner stool in Voryn\'s is empty. It\'s always empty. You\'ve been here a week and nobody has sat on it. You ask Voryn. Voryn is quiet for a moment. "It belonged to a fighter named Galn," Voryn says. "They\'re not coming back." A pause. "They won\'t need it but it stays there."',
    town: 4,
    choices: [
      {
        label: 'Ask what happened to Galn',
        outcome: { text: '"Won the championship," Voryn says. "Retired to the lowlands. Never came back up." Another pause. "Kept their word about one thing at least." You do not ask what the other thing was. +20 XP.', xpDelta: 20 },
      },
      {
        label: 'Say nothing and go back to your drink',
        outcome: { text: 'You look at the stool once more and go back to your drink. Voryn seems to appreciate the silence. The fire pops once. +15 XP.', xpDelta: 15 },
        statCheck: { stat: 'constitution', threshold: 9, outcome: { text: 'You sit with the story and let it settle. Voryn refills your drink without charging you for the second round. "You\'ll do," they say. Highest praise in Voryn\'s. +15 XP, +20 bones.', xpDelta: 15, bonesDelta: 20 } },
      },
      {
        label: 'Sit on the stool',
        outcome: { text: 'You sit on it. Nobody says anything. After a moment, Voryn places a drink in front of you. "Good," Voryn says. You\'re not sure if that\'s an endorsement or a test result. +20 XP.', xpDelta: 20 },
      },
    ],
  },
  {
    id: 'hollowcrown_reputation_talk',
    prompt: 'A veteran fighter you\'ve seen in the Hollow sits next to you and says, without introduction: "I\'ve watched you fight twice. You\'re strong. You\'re getting stronger." A pause. "You haven\'t fought anyone up here with patience yet." Another pause. "I have patience."',
    contextHint: { stat: 'constitution', statThreshold: 9, text: 'They are looking at your constitution specifically. They fight long.' },
    town: 4,
    choices: [
      {
        label: 'Accept if they\'re offering a bout',
        outcome: { text: 'They are. It\'s unofficial and unglamorous. They fight slowly and very long. You win, eventually. -20 HP. +40 XP. You both understand each other better afterward.', hpDelta: -20, xpDelta: 40 },
        statCheck: { stat: 'constitution', threshold: 10, outcome: { text: 'You outlast them in a bout that has the whole bar watching by the end. They stand up, nod once, and tell you something specific about your next official opponent. +40 XP, +50 bones from the informal audience who had thoughts on the outcome.', xpDelta: 40, bonesDelta: 50 } },
      },
      {
        label: 'Ask what they want',
        outcome: { text: '"To fight someone worth fighting," they say. "Let me know when you\'re ready." They go back to their drink. +15 XP for the honest assessment.', xpDelta: 15 },
      },
    ],
  },
  {
    id: 'hollowcrown_cold_ration',
    prompt: 'Voryn slides a small wrapped parcel in front of you. "Fighter prep ration," Voryn says. "Made for altitude." It\'s standard procedure here, apparently. "Twelve bones." They don\'t elaborate on what\'s in it. They rarely elaborate on anything.',
    town: 4,
    choices: [
      {
        label: 'Buy the ration',
        outcome: { text: 'It\'s dense, cold-adapted, and tasteless in a purposeful way. You feel meaningfully better within the hour. -12 bones, +30 HP.', bonesDelta: -12, hpDelta: 30 },
        statCheck: { stat: 'constitution', threshold: 9, outcome: { text: 'Your constitution processes the altitude-specific nutrition efficiently. You feel excellent. -12 bones, +40 HP, +10 XP.', bonesDelta: -12, hpDelta: 40, xpDelta: 10 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'Voryn takes it back without comment. You feel the altitude more acutely the next morning. This may or may not be related.' },
      },
    ],
  },
  {
    id: 'hollowcrown_honor_challenge',
    prompt: 'A fighter you defeated in the Hollow two days ago sits across from you. They have a formal challenge token — an old tradition, apparently. At the Hollow Crown, you can accept a rematch under sanctioned rules or decline once without stigma. Twice, apparently, means something.',
    town: 4,
    choices: [
      {
        label: 'Accept the rematch',
        outcome: { text: 'You fight again. They\'ve adjusted. You win more narrowly. -15 HP, +35 XP. They shake your hand afterward, which Voryn notes with something that might be approval.', hpDelta: -15, xpDelta: 35 },
        statCheck: { stat: 'strength', threshold: 11, outcome: { text: 'You accept and dominate the rematch with the same approach, refined. They accept the result with good grace and buy the next round. -15 HP, +35 XP, +25 bones.', hpDelta: -15, xpDelta: 35, bonesDelta: 25 } },
      },
      {
        label: 'Decline the once-allowable decline',
        outcome: { text: 'You use your one sanctioned refusal. They nod. Honor intact on both sides. You feel the altitude tonight.' },
      },
    ],
  },
  {
    id: 'hollowcrown_old_record',
    prompt: 'Voryn places a worn ledger on the bar. "Fighter records. Open to anyone." The top record is very old — forty-two consecutive wins in the Hollow, by someone named Crel. Nobody near that record is alive today. Voryn watches you read it.',
    contextHint: { stat: 'strength', statThreshold: 10, text: 'Your strength is noted in the room. The record was set by someone built the same way.' },
    town: 4,
    choices: [
      {
        label: 'Ask about Crel',
        outcome: { text: '"Retired at the peak," Voryn says. "Full health. Own terms." A pause. "The last fighter to do that." +25 XP for the perspective.', xpDelta: 25 },
        statCheck: { stat: 'cunning', threshold: 8, outcome: { text: 'You ask the right questions and Voryn answers them all. Crel\'s record involved a tactical pattern you can actually use. +25 XP, +30 bones from a bet you then place based on the insight.', xpDelta: 25, bonesDelta: 30 } },
      },
      {
        label: 'Close the ledger and say nothing',
        outcome: { text: 'You close it. Voryn takes it back. You both understand something was communicated. +15 XP.', xpDelta: 15 },
      },
    ],
  },
  {
    id: 'hollowcrown_the_cold_test',
    prompt: 'An older fighter — someone who\'s been at the summit since before this iteration of the arena was built — asks you to spend one hour outside at night, in the cold, without gear. "Not hazing," they say. "Altitude acclimatization. Real method. Works or it doesn\'t." Voryn neither confirms nor denies this.',
    contextHint: { lowHp: true, text: 'You\'re not at full health. The cold at the summit is not metaphorical.' },
    town: 4,
    choices: [
      {
        label: 'Do it',
        outcome: { text: 'You spend an hour in the summit cold. It is genuinely unpleasant. You come back inside and Voryn has something warm waiting. -10 HP, +30 XP, +20 HP from the warm drink.', hpDelta: 10, xpDelta: 30 },
        statCheck: { stat: 'constitution', threshold: 10, outcome: { text: 'You do the hour without significant struggle. The older fighter says nothing but gives you 50 bones when you come back in. "You\'ll do," they say. Voryn pours you something without charge. -10 HP, +30 XP, +50 bones, +25 HP.', hpDelta: 15, xpDelta: 30, bonesDelta: 50 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. The older fighter nods. "Different method works too," they say. "Just slower." They go back to their drink without judgment. The cold is still outside.' },
      },
    ],
  },
  {
    id: 'hollowcrown_the_bet',
    prompt: 'Two fighters are quietly betting on the outcome of tomorrow\'s bout card. One of them turns and includes you: "You\'re on the card tomorrow. You want in? Call your own bout." They\'re betting against themselves. It\'s possible they know something you don\'t.',
    town: 4,
    choices: [
      {
        label: 'Bet on yourself winning — 50 bones',
        outcome: { text: 'You win the bout. They pay out 50 bones. Whether they knew something or didn\'t, the outcome was yours. +50 bones.', bonesDelta: 50 },
        statCheck: { stat: 'strength', threshold: 11, outcome: { text: 'You win convincingly and collect 50 bones plus the quiet respect of everyone in Voryn\'s who watched the outcome confirmed. +50 bones, +20 XP.', bonesDelta: 50, xpDelta: 20 } },
      },
      {
        label: 'Bet against yourself — 50 bones',
        outcome: { text: 'You win the bout anyway. You lose the bet. You lose 50 bones and gain nothing except the uncomfortable awareness that you are not capable of throwing fights even when you want to. -50 bones.', bonesDelta: -50 },
      },
      {
        label: 'Decline the wager',
        outcome: { text: 'You decline. Voryn looks faintly approving. "Smart," Voryn says. This is the most Voryn has said about gambling in recorded history.' },
      },
    ],
  },
  {
    id: 'hollowcrown_glacier_meditation',
    prompt: 'A practitioner of something — they don\'t name it — offers a session at the glacier edge at dawn. "Clarity," they say. "For fighting. Forty bones." Voryn has apparently observed this person\'s work before and does not appear hostile to the concept.',
    town: 4,
    choices: [
      {
        label: 'Pay for the session',
        outcome: { text: 'You stand at the glacier edge at dawn in the cold. It is extremely clear and extremely cold and you feel extremely present. -40 bones, +30 XP, +20 HP from the stillness.', bonesDelta: -40, xpDelta: 30, hpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 9, outcome: { text: 'Your constitution handles the cold clarity easily. You come back feeling genuinely recalibrated. -40 bones, +35 XP, +30 HP.', bonesDelta: -40, xpDelta: 35, hpDelta: 30 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. Dawn at the glacier edge happens without you. You sleep instead. +15 HP from the extra rest.', hpDelta: 15 },
      },
    ],
  },
  {
    id: 'hollowcrown_legacy_question',
    prompt: 'Voryn speaks, unprompted, for the longest stretch you\'ve heard: "Every fighter who comes here wants to be remembered. Most of them are. For the wrong thing." They set down the glass they were cleaning. "What are you here for?" The room is very quiet.',
    contextHint: { stat: 'constitution', statThreshold: 10, text: 'You\'ve built a body that endures. The question has a different weight when you\'ve paid for it this way.' },
    town: 4,
    choices: [
      {
        label: 'Answer honestly',
        outcome: { text: 'You tell Voryn the truth. They listen completely. Then they nod once. "Good enough," they say. That\'s all. +30 XP.', xpDelta: 30 },
      },
      {
        label: 'Say: to win',
        outcome: { text: '"Everyone says that," Voryn says, without criticism. "The ones who stay usually find a different answer." They fill your drink. +20 XP.', xpDelta: 20 },
      },
      {
        label: 'Stay silent',
        outcome: { text: 'You say nothing. Voryn looks at you for a long time. Then: "That\'s an answer too." They fill your drink. +20 XP.', xpDelta: 20 },
        statCheck: { stat: 'strength', threshold: 12, outcome: { text: 'You say nothing. Voryn looks at your build — what it took to get here — and nods. "You\'ve already been answering it," Voryn says. They fill your drink and don\'t charge you. +20 XP, +25 bones.', xpDelta: 20, bonesDelta: 25 } },
      },
    ],
  },
  {
    id: 'hollowcrown_emergency_repair',
    prompt: 'Your armor has a crack in it from yesterday\'s bout. A craftsperson at the edge of the summit offers emergency repair. "Sixty bones," they say. "Guaranteed to hold through one more fight." They look at the crack with professional concern. It is a notable crack.',
    contextHint: { lowHp: true, text: 'The crack is structural. Fighting in damaged armor while already hurt is a calculation worth making.' },
    town: 4,
    choices: [
      {
        label: 'Pay for the repair',
        outcome: { text: 'The repair holds through the next bout. The craftsperson\'s assessment was accurate. -60 bones, +20 HP equivalent from the reduced damage exposure.', bonesDelta: -60, hpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 9, outcome: { text: 'You pay for the repair and fight the next bout with full protection. The crack never comes up again. -60 bones, +25 HP, +15 XP.', bonesDelta: -60, hpDelta: 25, xpDelta: 15 } },
      },
      {
        label: 'Fight with the crack — you\'ve had worse',
        outcome: { text: 'You fight with the crack. The armor holds, barely. You take more damage than you would have. -20 HP from the compromised protection.', hpDelta: -20 },
        statCheck: { stat: 'hide', threshold: 12, outcome: { text: 'Your natural hide compensates for the crack more than expected. You take less damage than the craftsperson feared. -10 HP. The crack holds.', hpDelta: -10 } },
      },
    ],
  },
  {
    id: 'hollowcrown_last_fighter',
    prompt: 'You\'re alone in Voryn\'s at the end of the night except for Voryn. They clean the bar. You sit with your drink. After a while, Voryn says: "You\'re still here." It\'s not a complaint. At the Hollow Crown, still being here means something specific.',
    town: 4,
    choices: [
      {
        label: 'Order one more drink',
        outcome: { text: '-15 bones. Voryn pours it without ceremony. You drink it in silence. Tomorrow is a different day. +15 XP for showing up.', bonesDelta: -15, xpDelta: 15 },
      },
      {
        label: 'Say goodnight and leave',
        outcome: { text: 'You stand up, nod at Voryn, and go. Voryn watches you leave. You sleep well. +20 XP for knowing when you\'re done.', xpDelta: 20 },
        statCheck: { stat: 'stamina', threshold: 10, outcome: { text: 'You leave at the right time and sleep eight hours clean. You arrive at the arena tomorrow in full condition. +20 XP, +25 HP from the rest.', xpDelta: 20, hpDelta: 25 } },
      },
      {
        label: 'Tell Voryn something true',
        outcome: { text: 'You tell them something you haven\'t told anyone else up here. Voryn listens. When you finish, they pour you a second drink and don\'t charge you. "Earned," they say. +25 XP, -0 bones.', xpDelta: 25 },
      },
    ],
  },
  {
    id: 'hollowcrown_the_wind',
    prompt: 'The wind at the summit tonight is loud enough to hear through the walls of Voryn\'s. Two fighters from lower arenas who arrived yesterday are visibly unsettled by it. A veteran leans back in their chair with their eyes closed. Voryn says nothing. You decide who you are in this moment.',
    town: 4,
    choices: [
      {
        label: 'Close your eyes too — let it pass',
        outcome: { text: 'You let the wind happen. It does. It passes. The two new fighters look at you instead of the walls. +20 XP for the composure.', xpDelta: 20 },
        statCheck: { stat: 'constitution', threshold: 10, outcome: { text: 'You close your eyes and remain completely still. When it passes, the veteran opens one eye and looks at you. They nod. This means something here. +20 XP, +30 bones from the informal respect it generates.', xpDelta: 20, bonesDelta: 30 } },
      },
      {
        label: 'Tell the two new fighters it\'s fine',
        outcome: { text: 'You tell them it\'s always this loud. They don\'t fully believe you but they relax slightly. +15 XP. Voryn tops up your drink.', xpDelta: 15 },
      },
      {
        label: 'Go outside and stand in it',
        outcome: { text: 'You step outside into the full force of the summit wind. It is extraordinary. -10 HP from the cold, +25 XP from the experience. When you come back in, Voryn has something hot waiting.', hpDelta: -10, xpDelta: 25 },
      },
    ],
  },
  {
    id: 'hollowcrown_wager_with_veteran',
    prompt: 'A veteran fighter with a long record in the Hollow Crown sits across from you and puts 100 bones on the table. "I\'ll tell you the thing that has ended more careers here than any opponent," they say. "If you already know it, keep your bones. If you don\'t, you owe me 100." They look utterly calm.',
    contextHint: { stat: 'cunning', statThreshold: 8, text: 'The wager itself is probably the lesson. But there might be something more specific.' },
    town: 4,
    choices: [
      {
        label: 'Take the wager',
        outcome: { text: '"The descent," they say. "Every fighter who loses here loses in the last round, not the first. They survive everything and then stop surviving one thing." You didn\'t know that specific formulation. -100 bones, but +40 XP. Worth it.', bonesDelta: -100, xpDelta: 40 },
        statCheck: { stat: 'cunning', threshold: 9, outcome: { text: 'You say: "Impatience." They pause. Then they push the 100 bones toward you. "Close enough," they say. "Keep them." +100 bones, +40 XP.', bonesDelta: 100, xpDelta: 40 } },
      },
      {
        label: 'Decline the wager',
        outcome: { text: 'You decline. They tell you anyway, for free. "The descent," they say. You think about that for the rest of the evening. +20 XP.', xpDelta: 20 },
      },
    ],
  },
  {
    id: 'hollowcrown_record_attempt',
    prompt: 'A fighter is about to attempt their thirtieth consecutive win in the Hollow — a significant record. The whole bar is present. Voryn has not closed early. The fighter is in the corner, alone, very still. They look at no one. Voryn sets out an extra glass at the bar.',
    town: 4,
    choices: [
      {
        label: 'Raise your glass to them',
        outcome: { text: 'They don\'t look up. But something in their posture changes slightly. Voryn refills your glass. +15 XP.', xpDelta: 15 },
      },
      {
        label: 'Leave them alone and watch the bout',
        outcome: { text: 'They win the thirtieth bout. The bar doesn\'t cheer. Everyone just nods. Voryn pours something for the fighter without being asked. You watch the whole thing and feel the weight of the place. +25 XP.', xpDelta: 25 },
        statCheck: { stat: 'constitution', threshold: 10, outcome: { text: 'You watch the whole bout without looking away, reading every exchange. You take three things from it that you will use. +25 XP, +30 bones from a wager you correctly placed on the outcome.', xpDelta: 25, bonesDelta: 30 } },
      },
      {
        label: 'Ask Voryn about the record',
        outcome: { text: '"Crel had forty-two," Voryn says. "Nobody else has come close." A long pause. "Yet." Voryn looks at you when they say yet. +20 XP.', xpDelta: 20 },
      },
    ],
  },
  {
    id: 'hollowcrown_supply_route',
    prompt: 'A merchant at the bar needs someone to move a crate of supplies to the far side of the summit — gear components, food stores. "Heavy," they say. "Far. Eighty bones." They look at your build with professional evaluation.',
    town: 4,
    choices: [
      {
        label: 'Take the job',
        outcome: { text: 'You carry the crate across the summit in the cold. It takes two hours. The weight is serious. -10 HP from the exertion, +80 bones.', hpDelta: -10, bonesDelta: 80 },
        statCheck: { stat: 'strength', threshold: 11, outcome: { text: 'You carry it without visible effort. The merchant tips you an extra 30 bones and asks if you\'re available tomorrow. +110 bones, +15 XP.', bonesDelta: 110, xpDelta: 15 } },
      },
      {
        label: 'Decline',
        outcome: { text: 'You decline. The merchant moves on to the next table. You stay warm.' },
      },
    ],
  },
  {
    id: 'hollowcrown_the_mistake',
    prompt: 'A young fighter — recent arrival, still adjusting to altitude — tells you they made a tactical error in their last bout and it cost them badly. They\'re not asking for advice. They\'re just saying it out loud to someone who might understand. You\'ve made that mistake. Everyone here has.',
    town: 4,
    choices: [
      {
        label: 'Share what you know about that mistake',
        outcome: { text: 'You tell them what you learned from making the same one. They listen carefully. +20 XP for the exchange. They give you 25 bones afterward, unprompted, as what appears to be a form of tuition payment.', xpDelta: 20, bonesDelta: 25 },
        statCheck: { stat: 'constitution', threshold: 9, outcome: { text: 'You share what you know and they ask two follow-up questions that you also have answers to. They leave looking meaningfully less likely to make it again. +20 XP, +35 bones.', xpDelta: 20, bonesDelta: 35 } },
      },
      {
        label: 'Nod and say nothing',
        outcome: { text: 'You nod. They seem to find it sufficient. Sometimes shared silence is the whole thing. +15 XP.', xpDelta: 15 },
      },
      {
        label: 'Tell them to figure it out themselves',
        outcome: { text: '"Everyone does," you say. They look at you. Then they nod. They\'ll remember this advice in the way people remember blunt useful things.' },
      },
    ],
  },
]
