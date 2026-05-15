import { Stats, DaringLevel, DARING_OPTIONS, maxHp } from './game-data'

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
  type: 'intro' | 'attack' | 'crit' | 'miss' | 'counter' | 'roar' | 'surrender' | 'death' | 'outcome' | 'flavor'
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

export interface SimulateOptions {
  startRound?: number  // offset round numbering for recompute (default 1)
  skipIntro?: boolean  // skip intro events for recompute
}

export function simulateBattle(fighterA: Fighter, fighterB: Fighter, opts: SimulateOptions = {}): BattleResult {
  const daringA = DARING_OPTIONS.find(d => d.key === fighterA.daring)!
  const daringB = DARING_OPTIONS.find(d => d.key === fighterB.daring)!

  // Roar effect: high roar debuffs opponent daring by shifting index down
  const daringIndexA = DARING_OPTIONS.findIndex(d => d.key === fighterA.daring)
  const daringIndexB = DARING_OPTIONS.findIndex(d => d.key === fighterB.daring)
  const roarDebuffOnB = Math.floor(fighterA.stats.roar / 5)
  const roarDebuffOnA = Math.floor(fighterB.stats.roar / 5)
  const effectiveDaringA = DARING_OPTIONS[clamp(daringIndexA - roarDebuffOnA, 0, 4)]
  const effectiveDaringB = DARING_OPTIONS[clamp(daringIndexB - roarDebuffOnB, 0, 4)]

  const maxHpA = maxHp(fighterA.stats.constitution)
  const maxHpB = maxHp(fighterB.stats.constitution)
  let hpA = fighterA.initialHp !== undefined ? Math.min(fighterA.initialHp, maxHpA) : maxHpA
  let hpB = fighterB.initialHp !== undefined ? Math.min(fighterB.initialHp, maxHpB) : maxHpB

  const events: BattleEvent[] = []

  function addEvent(e: Omit<BattleEvent, 'hpA' | 'hpB' | 'maxHpA' | 'maxHpB'>) {
    events.push({ ...e, hpA: Math.max(0, hpA), hpB: Math.max(0, hpB), maxHpA, maxHpB })
  }

  // Intro (skipped for recompute calls)
  if (!opts.skipIntro) {
    addEvent({ round: 0, type: 'intro', text: `The gates open. ${fighterA.name} and ${fighterB.name} enter the arena.` })
    addEvent({ round: 0, type: 'intro', text: `${fighterA.name} has set their Daring to ${daringA.label.toUpperCase()}${effectiveDaringA.key !== daringA.key ? ` (reduced to ${effectiveDaringA.label.toUpperCase()} by ${fighterB.name}'s terrifying roar)` : ''}.` })
    addEvent({ round: 0, type: 'intro', text: `${fighterB.name} has set their Daring to ${daringB.label.toUpperCase()}${effectiveDaringB.key !== daringB.key ? ` (reduced to ${effectiveDaringB.label.toUpperCase()} by ${fighterA.name}'s terrifying roar)` : ''}.` })
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
    const aGoesFirst = fighterA.stats.agility >= fighterB.stats.agility
      ? (fighterA.stats.agility > fighterB.stats.agility ? true : Math.random() > 0.5)
      : false

    const attackOrder: Array<'a' | 'b'> = aGoesFirst ? ['a', 'b'] : ['b', 'a']

    // Occasional flavor — every 2-3 rounds with some randomness
    if (round % 2 === 0 || (round % 3 === 0 && Math.random() < 0.6)) {
      addEvent({ round, type: 'flavor', text: flavorLine(fighterA.name, fighterB.name) })
    }

    for (const attacker of attackOrder) {
      if (hpA <= 0 || hpB <= 0) break

      const atk = attacker === 'a' ? fighterA : fighterB
      const def = attacker === 'a' ? fighterB : fighterA
      const atkDaring = attacker === 'a' ? effectiveDaringA : effectiveDaringB
      const defDaring = attacker === 'a' ? effectiveDaringB : effectiveDaringA
      const atkHp = attacker === 'a' ? hpA : hpB
      const defHp = attacker === 'a' ? hpB : hpA
      const defMax = attacker === 'a' ? maxHpB : maxHpA

      // Miss chance based on agility difference
      const agilityDiff = def.stats.agility - atk.stats.agility
      const missChance = clamp(0.05 + agilityDiff * 0.04, 0.02, 0.35)

      if (Math.random() < missChance) {
        addEvent({ round, type: 'miss', attacker, text: `${atk.name} ${pick(ATTACK_VERBS)} ${def.name} but ${pick(MISS_PHRASES)}.` })
        continue
      }

      // Base damage — strength-scaled with jaw bonus
      let baseDmg = rand(
        Math.max(4, atk.stats.strength * 3),
        atk.stats.strength * 6 + atk.stats.jaw * 2
      )
      baseDmg = Math.round(baseDmg * atkDaring.dmgMult)

      // Percentage-based defense (flat armor was too strong vs weak mobs)
      // Each hide point reduces damage by 4%, capped at 45%
      const damageReduction = Math.min(0.45, def.stats.hide * 0.04)
      let dmg = Math.max(2, Math.round(baseDmg * (1 - damageReduction)))

      // Stamina degradation in long fights
      if (round > 8) {
        const fatigue = 1 - Math.max(0, (10 - round) * 0.04) * (1 / Math.max(1, atk.stats.stamina))
        dmg = Math.round(dmg * fatigue)
      }

      // Crit check
      const critChance = clamp(atk.stats.ferocity * 0.04 + atkDaring.critBonus, 0.02, 0.45)
      const isCrit = Math.random() < critChance
      if (isCrit) {
        dmg = Math.round(dmg * 1.75)
        addEvent({ round, type: 'crit', attacker, text: `${atk.name} ${pick(CRIT_PHRASES)} ${def.name} for ${dmg} damage!` })
      } else {
        addEvent({ round, type: 'attack', attacker, text: `${atk.name} ${pick(ATTACK_VERBS)} ${def.name} for ${dmg} damage.` })
      }

      if (attacker === 'a') hpB = Math.max(0, hpB - dmg)
      else hpA = Math.max(0, hpA - dmg)
      // Update HP in the last added event
      events[events.length - 1].hpA = Math.max(0, hpA)
      events[events.length - 1].hpB = Math.max(0, hpB)

      // Counter-attack check
      const counterChance = clamp(def.stats.cunning * 0.05, 0.02, 0.30)
      if (Math.random() < counterChance && (attacker === 'a' ? hpB : hpA) > 0) {
        let counterDmg = Math.max(1, rand(def.stats.strength, def.stats.strength * 2))
        counterDmg = Math.round(counterDmg * defDaring.dmgMult)
        counterDmg = Math.max(1, Math.round(counterDmg - atk.stats.hide))
        if (attacker === 'a') hpA = Math.max(0, hpA - counterDmg)
        else hpB = Math.max(0, hpB - counterDmg)
        addEvent({ round, type: 'counter', attacker: attacker === 'a' ? 'b' : 'a', text: `${def.name} ${pick(COUNTER_VERBS)} ${atk.name} for ${counterDmg} counter damage. Cunning.` })
      }

      // Check surrender (PvP only — mobs never surrender)
      const checkSurrender = (fighter: Fighter, hp: number, maxHp: number, side: 'a' | 'b') => {
        if (fighter.isMob) return false
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
