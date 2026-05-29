import { Stats, DaringLevel, DARING_OPTIONS, maxHp, getSpeciesById } from './game-data'

export interface Fighter {
  id: string
  name: string
  species: string
  stats: Stats
  daring: DaringLevel
  surrenderAt: number // percentage 0-50
  initialHp?: number  // if set, battle starts at this HP instead of max
  isMob?: boolean
}

export interface BattleEvent {
  round: number
  type: 'intro' | 'attack' | 'crit' | 'miss' | 'counter' | 'roar' | 'surrender' | 'death' | 'outcome' | 'flavor' | 'passive'
  attacker?: 'a' | 'b'
  text: string
  hpA: number
  hpB: number
  maxHpA: number
  maxHpB: number
}

export interface BattleResult {
  winner: 'a' | 'b' | 'draw'
  aAlive: boolean
  bAlive: boolean
  events: BattleEvent[]
  aFinalHp: number
  bFinalHp: number
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

const ATTACK_VERBS = [
  'lunges at', 'snaps at', 'charges', 'barrels into', 'slashes at',
  'swipes at', 'headbutts', 'body-slams', 'claws at', 'chomps on',
  'hurls itself at', 'drives a shoulder into', 'takes a swing at',
  'crashes into', 'throws an elbow at', 'bites down on',
]
const COUNTER_VERBS = [
  'retaliates against', 'counters', 'strikes back at', 'punishes',
  'takes a free shot at', 'immediately answers', 'returns the favour on',
]
const MISS_PHRASES = [
  'misses completely',
  'connects with nothing but air',
  'trips over its own feet',
  'overshoots entirely',
  'hits the ground instead',
  'somehow misses a target that is standing still',
  'whiffs entirely and stumbles',
  'was looking the wrong way',
  'got distracted mid-swing',
  'will not be discussing this',
]
const CRIT_PHRASES = [
  'lands a devastating blow on',
  'absolutely obliterates',
  'hits something important on',
  'connects with terrifying precision on',
  'sends a message to',
  'delivers a catastrophic strike to',
  'finds a gap in the defenses of',
  'unleashes something unreasonable on',
  'goes completely feral on',
]

const FLAVOR_STATIC = [
  'The crowd roars. A bone flies from the stands. Nobody is sure why.',
  'A nearby pterodactyl circles overhead, waiting. Optimistically.',
  'Someone in the crowd is eating. This seems insensitive.',
  'The ground is slick with... it\'s probably mud.',
  'A referee watches from a safe distance. A very safe distance.',
  'The smell of the arena is best left undescribed.',
  'Two gamblers in the upper tier are having a heated argument about odds.',
  'A small child in the crowd is rooting for whoever is losing. This is unhelpful.',
  'The arena announcer clears his throat. Nobody is listening to the announcer.',
  'A loose bone rolls across the arena floor. Neither fighter acknowledges it.',
  'Three spectators have fainted. The medic is also watching the fight.',
  'Someone shouts advice from the crowd. It is terrible advice.',
  'The sun is beating down. Both fighters are deeply regretting this.',
  'A vendor in the stands is loudly selling meat. The timing is questionable.',
  'The crowd goes briefly silent, then very loud again.',
  'A betting slip floats down from the upper tiers. The odds were not favourable.',
  'Somewhere in the city, someone who bet on this fight just closed their eyes.',
  'The arena doctor is watching with professional concern. And personal interest.',
  'A section of the crowd begins a chant. It is unclear who they are chanting for.',
  'A horn sounds in the distance. It is unrelated. The crowd ignores it.',
  'The sand of the arena is doing its job. Nobody thinks about the sand.',
  'An elderly spectator shakes their head slowly. They have seen this before.',
  'A pigeon lands on the arena wall. It watches for a moment. It leaves.',
  'The sun moves behind a cloud. Both fighters take this personally.',
  'A referee consults a rulebook, finds nothing useful, and puts it away.',
  'The crowd has divided itself into factions. Both factions are wrong.',
  'A bet was placed on this fight four days ago. That person is not handling it well.',
  'The arena floor is being judged on its performance today. It is doing fine.',
  'Someone in row seven is explaining the fight to someone who can clearly see it.',
  'A torch flickers. This is atmospheric. Nobody planned it.',
  'The crowd holds its breath. Several people pass out. This is considered dramatic.',
  'An overly enthusiastic spectator has torn their shirt. This was their good shirt.',
  'Time seems to slow. Physicists would disagree, but they are not here.',
  'The press box, such as it is, is completely silent. This is unprecedented.',
  'One fighter\'s fan section is significantly louder than the other\'s. Neither fighter cares.',
  'A second, smaller fight has broken out in the stands. Nobody notices.',
  'The concession stand has run out of fermented fern juice. This is a separate crisis.',
  'A child in the crowd asks their parent a question. The parent does not answer.',
  'The shadow of the arena wall slowly creeps across the sand.',
  'History is being made. History will not remember the specific details.',
]

function flavorLine(nameA: string, nameB: string): string {
  const named = [
    `${nameA} glances at the crowd. This is a mistake. ${nameB} notices.`,
    `${nameB} looks tired. ${nameA} looks like they would like ${nameB} to be more tired.`,
    `${nameA} adjusts their footing. ${nameB} watches this very carefully.`,
    `${nameB} takes a breath. ${nameA} interprets this as weakness. Possibly correctly.`,
    `Both ${nameA} and ${nameB} appear to be reconsidering something. It is unclear what.`,
    `The crowd calls ${nameA}'s name. ${nameA} does not react. This is either focus or bad hearing.`,
    `${nameB} spits. ${nameA} does not react. This is professional of ${nameA}.`,
    `${nameA} and ${nameB} make eye contact. Several seconds pass. Neither blinks.`,
    `${nameB} has a plan. ${nameA} has a different plan. One of them is wrong.`,
    `${nameA} rolls their shoulders. ${nameB} has seen this move before. It did not go well last time.`,
    `Someone in the crowd shouts ${nameB}'s name encouragingly. ${nameB} does not find this encouraging.`,
    `${nameA} is bleeding slightly. ${nameA} has decided not to think about this right now.`,
    `${nameB} is beginning to suspect that ${nameA} is stronger than anticipated.`,
    `${nameA} and ${nameB} circle each other. The crowd mistakes this for strategy.`,
  ]
  return Math.random() < 0.4 ? pick(named) : pick(FLAVOR_STATIC)
}

interface PassiveState {
  consecutiveHits: number  // Velociraptor Pack Tactics
  braceUsed: boolean       // Triceratops Brace
  evasionUsed: boolean     // Pterodactyl Evasion
  headbuttUsed: boolean    // Pachycephalosaurus Headbutt
  momentumStacks: number   // Spinosaurus Momentum
}

function initPassive(): PassiveState {
  return { consecutiveHits: 0, braceUsed: false, evasionUsed: false, headbuttUsed: false, momentumStacks: 0 }
}

export interface SimulateOptions {
  startRound?: number  // offset round numbering for recompute (default 1)
  skipIntro?: boolean  // skip intro events for recompute
}

export function simulateBattle(fighterA: Fighter, fighterB: Fighter, opts: SimulateOptions = {}): BattleResult {
  const daringA = DARING_OPTIONS.find(d => d.key === fighterA.daring)!
  const daringB = DARING_OPTIONS.find(d => d.key === fighterB.daring)!

  const effectiveDaringA = daringA
  const effectiveDaringB = daringB

  // Roar effect: debuffs opponent's Ferocity and Agility for the fight
  // Scales immediately — Roar 1 = -1, Roar 7 = -2, Roar 14 = -3, capped at -5
  const roarDebuffOnA = Math.min(5, Math.ceil(fighterB.stats.roar * 0.15))
  const roarDebuffOnB = Math.min(5, Math.ceil(fighterA.stats.roar * 0.15))
  const effectiveA: Fighter = {
    ...fighterA,
    stats: {
      ...fighterA.stats,
      ferocity: Math.max(0, fighterA.stats.ferocity - roarDebuffOnA),
      agility:  Math.max(0, fighterA.stats.agility  - roarDebuffOnA),
    },
  }
  const effectiveB: Fighter = {
    ...fighterB,
    stats: {
      ...fighterB.stats,
      ferocity: Math.max(0, fighterB.stats.ferocity - roarDebuffOnB),
      agility:  Math.max(0, fighterB.stats.agility  - roarDebuffOnB),
    },
  }

  const maxHpA = maxHp(fighterA.stats.constitution)
  const maxHpB = maxHp(fighterB.stats.constitution)
  let hpA = fighterA.initialHp !== undefined ? Math.min(fighterA.initialHp, maxHpA) : maxHpA
  let hpB = fighterB.initialHp !== undefined ? Math.min(fighterB.initialHp, maxHpB) : maxHpB

  const passiveA = initPassive()
  const passiveB = initPassive()
  const speciesA = getSpeciesById(fighterA.species)
  const speciesB = getSpeciesById(fighterB.species)

  const events: BattleEvent[] = []

  function addEvent(e: Omit<BattleEvent, 'hpA' | 'hpB' | 'maxHpA' | 'maxHpB'>) {
    events.push({ ...e, hpA: Math.max(0, hpA), hpB: Math.max(0, hpB), maxHpA, maxHpB })
  }

  // Intro (skipped for recompute calls)
  if (!opts.skipIntro) {
    addEvent({ round: 0, type: 'intro', text: `The gates open. ${fighterA.name} and ${fighterB.name} enter the arena.` })
    addEvent({ round: 0, type: 'intro', text: `${fighterA.name} has set their Daring to ${daringA.label.toUpperCase()}.` })
    addEvent({ round: 0, type: 'intro', text: `${fighterB.name} has set their Daring to ${daringB.label.toUpperCase()}.` })
    if (roarDebuffOnB > 0) addEvent({ round: 0, type: 'roar', text: `${fighterA.name} lets out a thunderous roar. ${fighterB.name} flinches — Ferocity and Agility reduced by ${roarDebuffOnB} for this fight.` })
    if (roarDebuffOnA > 0) addEvent({ round: 0, type: 'roar', text: `${fighterB.name} lets out a thunderous roar. ${fighterA.name} flinches — Ferocity and Agility reduced by ${roarDebuffOnA} for this fight.` })
    if (speciesA?.passive) addEvent({ round: 0, type: 'passive', text: `⚡ ${fighterA.name}'s passive: ${speciesA.passive.name} — ${speciesA.passive.description}` })
    if (speciesB?.passive) addEvent({ round: 0, type: 'passive', text: `⚡ ${fighterB.name}'s passive: ${speciesB.passive.name} — ${speciesB.passive.description}` })
    addEvent({ round: 0, type: 'intro', text: `The crowd screams. A horn sounds. Something in the distance catches fire. Let's go.` })
  }

  const MAX_ROUNDS = 20
  let round = opts.startRound ?? 1
  const roundLimit = (opts.startRound ?? 1) - 1 + MAX_ROUNDS
  let winner: 'a' | 'b' | 'draw' = 'draw'
  let aAlive = true
  let bAlive = true

  while (round <= roundLimit && hpA > 0 && hpB > 0) {
    // Determine attack order by agility
    const aGoesFirst = effectiveA.stats.agility >= effectiveB.stats.agility
      ? (effectiveA.stats.agility > effectiveB.stats.agility ? true : Math.random() > 0.5)
      : false

    const attackOrder: Array<'a' | 'b'> = aGoesFirst ? ['a', 'b'] : ['b', 'a']

    // Occasional flavor — every 2-3 rounds with some randomness
    if (round % 2 === 0 || (round % 3 === 0 && Math.random() < 0.6)) {
      addEvent({ round, type: 'flavor', text: flavorLine(fighterA.name, fighterB.name) })
    }

    for (const attacker of attackOrder) {
      if (hpA <= 0 || hpB <= 0) break

      const atk = attacker === 'a' ? effectiveA : effectiveB
      const def = attacker === 'a' ? effectiveB : effectiveA
      const atkDaring = attacker === 'a' ? effectiveDaringA : effectiveDaringB
      const defDaring = attacker === 'a' ? effectiveDaringB : effectiveDaringA
      const atkHp = attacker === 'a' ? hpA : hpB
      const defHp = attacker === 'a' ? hpB : hpA
      const defMax = attacker === 'a' ? maxHpB : maxHpA
      const atkMax = attacker === 'a' ? maxHpA : maxHpB
      const atkPassive = attacker === 'a' ? passiveA : passiveB
      const defPassive = attacker === 'a' ? passiveB : passiveA

      // Pachycephalosaurus: Headbutt — first attack always hits, ignores hide
      const isPachyHeadbutt = atk.species === 'pachycephalosaurus' && !atkPassive.headbuttUsed
      if (isPachyHeadbutt) atkPassive.headbuttUsed = true

      // Miss chance based on agility difference
      const agilityDiff = def.stats.agility - atk.stats.agility
      const missChance = clamp(0.05 + agilityDiff * 0.04, 0.02, 0.35)

      if (!isPachyHeadbutt && Math.random() < missChance) {
        if (atk.species === 'velociraptor') atkPassive.consecutiveHits = 0
        if (atk.species === 'spinosaurus') atkPassive.momentumStacks = 0
        addEvent({ round, type: 'miss', attacker, text: `${atk.name} ${pick(ATTACK_VERBS)} ${def.name} but ${pick(MISS_PHRASES)}.` })
        continue
      }

      // Track consecutive hits for Velociraptor Pack Tactics and Spinosaurus Momentum
      if (atk.species === 'velociraptor') atkPassive.consecutiveHits++
      if (atk.species === 'spinosaurus') atkPassive.momentumStacks = Math.min(3, atkPassive.momentumStacks + 1)

      // Strength = reliable damage floor and ceiling; jaw only matters on crits
      const minDmg = Math.max(3, atk.stats.strength * 2)
      const maxDmg = Math.max(minDmg + 2, atk.stats.strength * 4)
      let baseDmg = rand(minDmg, maxDmg)
      baseDmg = Math.round(baseDmg * atkDaring.dmgMult * defDaring.dmgReceivedMult)

      // Pachycephalosaurus Headbutt ignores hide; otherwise percentage-based defense
      const damageReduction = isPachyHeadbutt ? 0 : Math.min(0.45, def.stats.hide * 0.04)
      let dmg = Math.max(2, Math.round(baseDmg * (1 - damageReduction)))

      // Stamina degradation in long fights — low stamina fighters fade noticeably
      if (round > 5) {
        const fatiguePer = 0.06 / Math.max(1, atk.stats.stamina)
        const fatigue = Math.max(0.45, 1 - (round - 5) * fatiguePer)
        dmg = Math.round(dmg * fatigue)
      }

      // T-Rex: Last Stand — when HP < 25%, +40% damage
      const lastStandActive = atk.species === 'trex' && atkHp < atkMax * 0.25
      if (lastStandActive) dmg = Math.round(dmg * 1.4)

      // Velociraptor: Pack Tactics — every 3rd consecutive hit deals double damage
      const packTacticsActive = atk.species === 'velociraptor' && atkPassive.consecutiveHits > 0 && atkPassive.consecutiveHits % 3 === 0
      if (packTacticsActive) dmg *= 2

      // Spinosaurus: Momentum — +10% damage per stack (max 3)
      if (atk.species === 'spinosaurus' && atkPassive.momentumStacks > 0) {
        dmg = Math.round(dmg * (1 + atkPassive.momentumStacks * 0.10))
      }

      // Crit check
      const critChance = clamp(atk.stats.ferocity * 0.04 + atkDaring.critBonus, 0.02, 0.45)
      const isCrit = Math.random() < critChance
      if (isCrit) {
        // Jaw scales crit multiplier: jaw=3 → 1.8×, jaw=8 → 2.3×, jaw=15 → 3.0×
        const critMult = 1.5 + atk.stats.jaw * 0.1
        dmg = Math.round(dmg * critMult)
      }

      // Triceratops: Brace — once per fight, halve a hit that would deal >20% max HP
      let braceBlocked = 0
      if (def.species === 'triceratops' && !defPassive.braceUsed && dmg > defMax * 0.20) {
        defPassive.braceUsed = true
        braceBlocked = Math.floor(dmg / 2)
        dmg -= braceBlocked
      }

      // Pterodactyl: Evasion — once per fight, dodge a hit that would drop HP below 20%
      let evasionDodged = false
      if (def.species === 'pterodactyl' && !defPassive.evasionUsed && defHp > defMax * 0.20 && defHp - dmg < defMax * 0.20) {
        defPassive.evasionUsed = true
        evasionDodged = true
        dmg = 0
      }

      // Add main attack event (or evasion event if dodged)
      if (evasionDodged) {
        addEvent({ round, type: 'passive', text: `💨 EVASION — ${def.name} vanishes at the last second, narrowly dodging ${atk.name}'s attack!` })
      } else if (isCrit) {
        addEvent({ round, type: 'crit', attacker, text: `${atk.name} ${pick(CRIT_PHRASES)} ${def.name} for ${dmg} damage!` })
      } else {
        addEvent({ round, type: 'attack', attacker, text: `${atk.name} ${pick(ATTACK_VERBS)} ${def.name} for ${dmg} damage.` })
      }

      if (attacker === 'a') hpB = Math.max(0, hpB - dmg)
      else hpA = Math.max(0, hpA - dmg)
      // Update HP in the last added event
      events[events.length - 1].hpA = Math.max(0, hpA)
      events[events.length - 1].hpB = Math.max(0, hpB)

      // Passive narrative events
      if (isPachyHeadbutt) addEvent({ round, type: 'passive', text: `💥 HEADBUTT — ${atk.name}'s first strike crashes through all defenses!` })
      if (lastStandActive) addEvent({ round, type: 'passive', text: `⚡ LAST STAND — ${atk.name} fights with desperate fury, dealing 40% more damage!` })
      if (packTacticsActive) addEvent({ round, type: 'passive', text: `⚡ PACK TACTICS — ${atk.name}'s ${atkPassive.consecutiveHits}th consecutive hit lands with double force!` })
      if (atk.species === 'spinosaurus' && atkPassive.momentumStacks > 1) addEvent({ round, type: 'passive', text: `⚡ MOMENTUM — ${atk.name} is building unstoppable force! (${atkPassive.momentumStacks}× stack)` })
      if (braceBlocked > 0) addEvent({ round, type: 'passive', text: `🛡️ BRACE — ${def.name} braces at the last moment, blocking ${braceBlocked} damage!` })

      // Ankylosaurus: Thorns — on incoming crit, reflect 15% damage back to attacker
      if (isCrit && dmg > 0 && def.species === 'ankylosaurus') {
        const thornDmg = Math.max(1, Math.round(dmg * 0.15))
        if (attacker === 'a') hpA = Math.max(0, hpA - thornDmg)
        else hpB = Math.max(0, hpB - thornDmg)
        addEvent({ round, type: 'passive', text: `🩸 THORNS — ${def.name}'s armored scales reflect ${thornDmg} damage back at ${atk.name}!` })
      }

      // Counter-attack check
      const counterChance = clamp(def.stats.cunning * 0.05, 0.02, 0.30)
      if (Math.random() < counterChance && (attacker === 'a' ? hpB : hpA) > 0) {
        let counterDmg = Math.max(1, rand(def.stats.strength, def.stats.strength * 2))
        counterDmg = Math.round(counterDmg * defDaring.dmgMult)
        const counterReduction = Math.min(0.45, atk.stats.hide * 0.04)
        counterDmg = Math.max(1, Math.round(counterDmg * (1 - counterReduction)))
        // Stegosaurus: Tail Club — counter-attacks deal +15 damage
        const tailClub = def.species === 'stegosaurus'
        if (tailClub) counterDmg += 15
        if (attacker === 'a') hpA = Math.max(0, hpA - counterDmg)
        else hpB = Math.max(0, hpB - counterDmg)
        addEvent({ round, type: 'counter', attacker: attacker === 'a' ? 'b' : 'a', text: `${def.name} ${pick(COUNTER_VERBS)} ${atk.name} for ${counterDmg} counter damage.${tailClub ? ' The tail club adds a sickening crack.' : ' Cunning.'}` })
      }

      // Check surrender (PvP only — mobs never surrender)
      const checkSurrender = (fighter: Fighter, hp: number, maxHp: number, side: 'a' | 'b') => {
        if (fighter.isMob) return false
        if (hp <= 0) return false  // dead fighters can't surrender
        const hpPct = (hp / maxHp) * 100
        if (hpPct <= fighter.surrenderAt && fighter.surrenderAt > 0) {
          addEvent({ round, type: 'surrender', attacker: side, text: `${fighter.name} raises a limb in surrender at ${Math.round(hpPct)}% HP. The crowd boos. ${fighter.name} does not care. ${fighter.name} is alive.` })
          return true
        }
        return false
      }

      if (attacker === 'a' && checkSurrender(fighterB, hpB, maxHpB, 'b')) {
        winner = 'a'; bAlive = true; hpB = Math.max(hpB, 1)
        break
      }
      if (attacker === 'b' && checkSurrender(fighterA, hpA, maxHpA, 'a')) {
        winner = 'b'; aAlive = true; hpA = Math.max(hpA, 1)
        break
      }
    }

    // Check death
    if (hpA <= 0) {
      addEvent({ round, type: 'death', text: `${fighterA.name} collapses. The arena goes quiet. Then very loud.` })
      winner = 'b'; aAlive = false; break
    }
    if (hpB <= 0) {
      addEvent({ round, type: 'death', text: `${fighterB.name} collapses. The arena goes quiet. Then very loud.` })
      winner = 'a'; bAlive = false; break
    }

    if (winner !== 'draw') break
    round++
  }

  // Draw / timeout
  if (winner === 'draw') {
    addEvent({ round, type: 'outcome', text: `Time has been called. Both fighters are still standing, though one of them is mostly upright out of stubbornness. The judges call it a draw. Both fighters are furious.` })
  } else {
    const winnerName = winner === 'a' ? fighterA.name : fighterB.name
    const loserName = winner === 'a' ? fighterB.name : fighterA.name
    addEvent({ round, type: 'outcome', text: `${winnerName} stands victorious. ${loserName} is carried away by a very tired arena crew. The crowd chants ${winnerName}'s name. Some of them even spell it correctly.` })
  }

  return {
    winner,
    aAlive,
    bAlive,
    events,
    aFinalHp: Math.max(0, hpA),
    bFinalHp: Math.max(0, hpB),
  }
}
