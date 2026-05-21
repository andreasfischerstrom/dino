'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BattleEvent } from '@/lib/battle-engine'
import { DaringOption } from '@/lib/game-data'
import BattleOutcome from './BattleOutcome'

interface CharacterSnapshot {
  hp: number
  maxHp: number
  xp: number
  xpForNextLevel: number
  bones: number
  image: string
  name: string
  level: number
  statPoints: number
}

interface FloatNum {
  id: number
  amount: number
  isCrit: boolean
  isCounter: boolean
}

interface Props {
  battleData: Record<string, unknown>
  fighterA: CharacterSnapshot
  fighterBName: string
  fighterBImage: string
  onComplete: () => void
  userSide?: 'a' | 'b'
  // Mob fight props for mid-battle daring adjustment
  mobId?: string
  initialDaring?: string
  surrenderAt?: number
  daringOptions?: DaringOption[]
  activeManagement?: boolean
}

const EVENT_COLORS: Record<string, string> = {
  intro:     '#7a6a4a',
  attack:    '#e8d5b0',
  crit:      '#ff9944',
  miss:      '#4a3a22',
  counter:   '#aabb88',
  roar:      '#d4a843',
  surrender: '#6ab0bf',
  death:     '#bf4040',
  outcome:   '#d4a843',
  flavor:    '#3a5a3a',
  passive:   '#d4a843',
}

const SPEEDS: Record<'normal' | 'fast', number> = { normal: 1300, fast: 420 }
const DISPLAY_ROUND_SIZE = 3  // engine rounds per display round

function getDisplayRound(engineRound: number) {
  return engineRound === 0 ? 1 : Math.ceil(engineRound / DISPLAY_ROUND_SIZE)
}

function getDisplayRoundEndIdx(events: BattleEvent[], displayRound: number): number {
  const maxEngineRound = displayRound * DISPLAY_ROUND_SIZE
  let lastIdx = -1
  for (let i = 0; i < events.length; i++) {
    if (events[i].round <= maxEngineRound) lastIdx = i
    else break
  }
  return lastIdx
}

function isTerminalEvent(e: BattleEvent) {
  return e.type === 'death' || e.type === 'outcome' || e.type === 'surrender'
}

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/') }

function parseDamage(text: string): number {
  const m = text.match(/for (\d+) damage/) ?? text.match(/reflect[s]? (\d+) damage/)
  return m ? parseInt(m[1]) : 0
}

function triggerAnim(set: (v: boolean) => void) {
  set(true)
  setTimeout(() => set(false), 460)
}

function FighterHead({ image, name, align, attacking, dead, flash, floatNum }: {
  image: string; name: string; align: 'left' | 'right'
  attacking: boolean; dead: boolean; flash: boolean
  floatNum: FloatNum | null
}) {
  const animName = dead
    ? 'dino-death 0.8s ease-out forwards'
    : attacking
    ? `${align === 'left' ? 'dino-attack-left' : 'dino-attack-right'} 0.46s ease-out`
    : 'dino-idle 3s ease-in-out infinite'

  const imgStyle: React.CSSProperties = { animation: animName }

  return (
    <div className="flex flex-col items-center gap-1" style={{ minWidth: 56 }}>
      <div style={{ position: 'relative' }}>
        {floatNum && (
          <div key={floatNum.id} style={{
            position: 'absolute', top: '-6px', left: '50%',
            animation: 'float-damage 1s ease-out forwards',
            zIndex: 50, pointerEvents: 'none',
            fontWeight: 'bold', fontFamily: 'var(--font-cinzel, Georgia)',
            fontSize: floatNum.isCrit ? '17px' : '13px',
            color: floatNum.isCrit ? '#ff4444' : floatNum.isCounter ? '#aabb88' : '#ffaa44',
            textShadow: '0 1px 4px rgba(0,0,0,1)', whiteSpace: 'nowrap',
          }}>
            {floatNum.isCrit ? '💥 ' : ''}-{floatNum.amount}
          </div>
        )}
        {isUrl(image)
          ? <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"
              style={{ ...imgStyle, border: '2px solid #5a4028', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }} />
          : <div className="text-4xl leading-none" style={imgStyle}>{image}</div>
        }
        {flash && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(255, 50, 50, 0.55)',
            animation: 'hit-flash 0.35s ease-out forwards',
            pointerEvents: 'none',
          }} />
        )}
      </div>
      <span className="text-xs font-bold truncate max-w-[80px]"
        style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
        {name}
      </span>
    </div>
  )
}

function hpBarColor(pct: number) {
  if (pct > 50) return 'linear-gradient(to bottom, #d03030 0%, #921818 60%, #6a0f0f 100%)'
  if (pct > 25) return 'linear-gradient(to bottom, #d07020 0%, #924010 60%, #6a2808 100%)'
  return 'linear-gradient(to bottom, #ff4444 0%, #cc2020 60%, #991010 100%)'
}

function HpBar({ hpPct, hp, maxHp, flash }: { hpPct: number; hp: number; maxHp: number; flash: boolean }) {
  return (
    <div className="flex-1">
      <div className="hud-bar mb-0.5" style={{
        flex: 'none', width: '100%',
        boxShadow: flash ? '0 0 10px rgba(255,80,80,0.7)' : 'none',
        transition: 'box-shadow 0.1s ease',
      }}>
        <div style={{
          height: '100%', width: `${hpPct}%`,
          background: flash ? 'linear-gradient(to bottom, #ff6060 0%, #ff2020 100%)' : hpBarColor(hpPct),
          borderRadius: '2px',
          transition: 'width 0.5s ease, background 0.3s ease',
          boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
        }} />
      </div>
      <div className="text-xs text-center" style={{ color: '#a08050' }}>{hp}/{maxHp}</div>
    </div>
  )
}

export default function BattleViewer({
  battleData, fighterA, fighterBName, fighterBImage, onComplete,
  userSide = 'a', mobId, initialDaring, surrenderAt = 20, daringOptions, activeManagement = false,
}: Props) {
  const [localEvents, setLocalEvents] = useState<BattleEvent[]>(() => battleData.events as BattleEvent[])
  const [localResult, setLocalResult] = useState<Record<string, unknown>>(() => battleData.result as Record<string, unknown>)
  const [visibleCount, setVisibleCount] = useState(0)
  const [showOutcome, setShowOutcome] = useState(false)

  // Playback
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'paused'>('normal')
  const [suspense, setSuspense] = useState(false)
  const [done, setDone] = useState(false)

  // Inter-round state
  type Phase = 'playing' | 'interRound'
  const [phase, setPhase] = useState<Phase>('playing')
  const [currentDisplayRound, setCurrentDisplayRound] = useState(1)
  const [activeDaring, setActiveDaring] = useState(initialDaring ?? 'measured')
  const [committedDaring, setCommittedDaring] = useState(initialDaring ?? 'measured')
  const [recomputing, setRecomputing] = useState(false)
  const [roundStartHp, setRoundStartHp] = useState({ a: fighterA.hp, b: localEvents[0]?.maxHpB ?? 100 })

  // HP flash
  const [flashA, setFlashA] = useState(false)
  const [flashB, setFlashB] = useState(false)
  const prevHpARef = useRef<number | null>(null)
  const prevHpBRef = useRef<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Portrait animations
  const [attackingA, setAttackingA] = useState(false)
  const [attackingB, setAttackingB] = useState(false)
  const [deadA, setDeadA] = useState(false)
  const [deadB, setDeadB] = useState(false)
  const [floatA, setFloatA] = useState<FloatNum | null>(null)
  const [floatB, setFloatB] = useState<FloatNum | null>(null)
  const [shake, setShake] = useState(false)
  const floatIdRef = useRef(0)

  function showFloat(set: (v: FloatNum | null) => void, amount: number, isCrit: boolean, isCounter: boolean) {
    set({ id: ++floatIdRef.current, amount, isCrit, isCounter })
    setTimeout(() => set(null), 1050)
  }

  useEffect(() => {
    if (visibleCount === 0) return
    const event = localEvents[visibleCount - 1]
    if (!event) return

    if (event.type === 'attack' || event.type === 'crit') {
      const dmg = parseDamage(event.text)
      if (event.attacker === 'a') {
        triggerAnim(setAttackingA)
        if (dmg) showFloat(setFloatB, dmg, event.type === 'crit', false)
      } else {
        triggerAnim(setAttackingB)
        if (dmg) showFloat(setFloatA, dmg, event.type === 'crit', false)
      }
      if (event.type === 'crit') {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    }

    if (event.type === 'counter') {
      const dmg = parseDamage(event.text)
      if (event.attacker === 'b') {
        triggerAnim(setAttackingB)
        if (dmg) showFloat(setFloatA, dmg, false, true)
      } else {
        triggerAnim(setAttackingA)
        if (dmg) showFloat(setFloatB, dmg, false, true)
      }
    }

    if (event.hpA <= 0) setDeadA(true)
    if (event.hpB <= 0) setDeadB(true)
  }, [visibleCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    setVisibleCount(v => Math.min(v + 1, localEvents.length))
  }, [localEvents.length])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount, suspense, phase])

  // Space bar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (suspense) { setSuspense(false); return }
      if (phase === 'interRound') return  // space does nothing during pause
      if (speed === 'paused') { setSpeed('normal'); return }
      advance()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance, speed, suspense, phase])

  // HP flash detection
  const currentEvent = localEvents[visibleCount - 1]
  const hpA = currentEvent?.hpA ?? localEvents[0]?.hpA ?? fighterA.hp
  const hpB = currentEvent?.hpB ?? localEvents[0]?.hpB ?? 100
  const maxHpA = localEvents[0]?.maxHpA ?? fighterA.maxHp
  const maxHpB = localEvents[0]?.maxHpB ?? 100

  useEffect(() => {
    if (prevHpARef.current !== null && hpA < prevHpARef.current - 4) {
      setFlashA(true); setTimeout(() => setFlashA(false), 350)
    }
    prevHpARef.current = hpA
  }, [hpA])

  useEffect(() => {
    if (prevHpBRef.current !== null && hpB < prevHpBRef.current - 4) {
      setFlashB(true); setTimeout(() => setFlashB(false), 350)
    }
    prevHpBRef.current = hpB
  }, [hpB])

  // Auto-play within a display round
  useEffect(() => {
    if (phase !== 'playing' || speed === 'paused' || suspense || done) return

    const displayRoundEnd = getDisplayRoundEndIdx(localEvents, currentDisplayRound)

    // Reached end of current display round
    if (displayRoundEnd >= 0 && visibleCount > displayRoundEnd) {
      const lastEvent = localEvents[displayRoundEnd]
      if (isTerminalEvent(lastEvent)) {
        setDone(true)
      } else if (activeManagement) {
        // Pause and wait for user action
        setPhase('interRound')
      } else {
        // No active management — continue automatically to next display round
        setRoundStartHp({ a: lastEvent.hpA, b: lastEvent.hpB })
        setCurrentDisplayRound(d => d + 1)
      }
      return
    }

    const nextEvent = localEvents[visibleCount]
    if (!nextEvent) return

    const isSuspenseEvent = isTerminalEvent(nextEvent) && visibleCount > 0
    const delay = isSuspenseEvent ? SPEEDS[speed] * 1.1 : SPEEDS[speed]

    const timer = setTimeout(() => {
      if (isSuspenseEvent) setSuspense(true)
      else setVisibleCount(v => Math.min(v + 1, localEvents.length))
    }, delay)
    return () => clearTimeout(timer)
  }, [phase, speed, visibleCount, suspense, done, localEvents, currentDisplayRound])

  // Suspense → reveal
  useEffect(() => {
    if (!suspense) return
    const timer = setTimeout(() => { setSuspense(false); advance() }, 1600)
    return () => clearTimeout(timer)
  }, [suspense, advance])


  async function continueToNextRound() {
    if (recomputing) return
    const lastShownEvent = localEvents[visibleCount - 1]
    const nextEngineRound = currentDisplayRound * DISPLAY_ROUND_SIZE + 1

    if (mobId && activeDaring !== committedDaring && lastShownEvent) {
      setRecomputing(true)
      try {
        const res = await fetch('/api/battle/mob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobId,
            daring: activeDaring,
            surrenderAt,
            hpA: lastShownEvent.hpA,
            hpB: lastShownEvent.hpB,
            fromRound: nextEngineRound,
            originalXp: fighterA.xp,
            originalBones: fighterA.bones,
            originalLevel: fighterA.level,
            originalStatPoints: fighterA.statPoints,
            previousWon: localResult?.winner === userSide,
          }),
        })
        const json = await res.json()
        if (res.ok) {
          const eventsToKeep = localEvents.slice(0, visibleCount)
          setLocalEvents([...eventsToKeep, ...json.events])
          setLocalResult(json.result)
          setCommittedDaring(activeDaring)
        }
      } catch {
        // if recompute fails, continue with existing events
      }
      setRecomputing(false)
    }

    // Save end-of-round HP as start HP for next round
    if (lastShownEvent) {
      setRoundStartHp({ a: lastShownEvent.hpA, b: lastShownEvent.hpB })
    }
    setCurrentDisplayRound(d => d + 1)
    setPhase('playing')
  }

  // Build display items with round banners
  type DisplayItem =
    | { kind: 'banner'; round: number }
    | { kind: 'event'; event: BattleEvent; index: number }

  const displayItems: DisplayItem[] = []
  let lastEngineRound = -1
  for (let i = 0; i < visibleCount; i++) {
    const event = localEvents[i]
    if (event.round > 0 && event.round !== lastEngineRound) {
      displayItems.push({ kind: 'banner', round: event.round })
      lastEngineRound = event.round
    }
    displayItems.push({ kind: 'event', event, index: i })
  }

  const getOpacity = (eventIndex: number) => {
    const dist = visibleCount - 1 - eventIndex
    if (dist <= 2) return 1
    if (dist <= 5) return 0.55
    return 0.28
  }

  const hpPctA = Math.round((hpA / maxHpA) * 100)
  const hpPctB = Math.round((hpB / maxHpB) * 100)
  const userIsA = userSide === 'a'
  const userHpPct = userIsA ? hpPctA : hpPctB
  const userHp    = userIsA ? hpA    : hpB
  const userMaxHp = userIsA ? maxHpA : maxHpB
  const oppHpPct  = userIsA ? hpPctB : hpPctA
  const oppHp     = userIsA ? hpB    : hpA
  const oppMaxHp  = userIsA ? maxHpB : maxHpA
  const userFlash = userIsA ? flashA : flashB
  const oppFlash  = userIsA ? flashB : flashA

  if (showOutcome) {
    const won = localResult?.winner === userSide
    const aliveKey = userIsA ? 'attackerAlive' : 'defenderAlive'
    const survived = won || (localResult?.[aliveKey] as boolean | undefined) !== false
    const xpGained = (localResult?.xpGained as number) ?? 0
    const bonesGained = (localResult?.bonesGained as number) ?? 0
    const newHp = (localResult?.newHp as number) ?? fighterA.hp
    const leveledUp = !!(localResult?.leveledUp)
    return (
      <BattleOutcome
        won={won} survived={survived}
        fighterName={fighterA.name} fighterImage={fighterA.image}
        hpBefore={fighterA.hp} hpAfter={newHp} maxHp={fighterA.maxHp}
        xpBefore={fighterA.xp} xpAfter={fighterA.xp + xpGained}
        xpForNextLevel={fighterA.xpForNextLevel}
        bonesBefore={fighterA.bones} bonesAfter={fighterA.bones + bonesGained}
        leveledUp={leveledUp} onContinue={onComplete}
      />
    )
  }

  // Inter-round summary values
  const endHpA = localEvents[visibleCount - 1]?.hpA ?? fighterA.hp
  const endHpB = localEvents[visibleCount - 1]?.hpB ?? maxHpB
  const dmgDealtUser   = userIsA ? (roundStartHp.b - endHpB) : (roundStartHp.a - endHpA)
  const dmgReceivedUser = userIsA ? (roundStartHp.a - endHpA) : (roundStartHp.b - endHpB)
  const userAhead = userIsA ? endHpA > endHpB : endHpB > endHpA

  return (
    <div className="flex flex-col px-4 py-4 max-w-2xl mx-auto w-full" style={{
      height: '100dvh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(/images/arena-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Fighter HP bars */}
      <div className="shrink-0 flex items-center gap-3 mb-3 panel"
        style={{ padding: '0.75rem', animation: shake ? 'arena-shake 0.46s ease-out' : 'none', background: 'rgba(14,10,6,0.82)', backdropFilter: 'blur(2px)' }}>
        <FighterHead image={fighterA.image} name={fighterA.name} align="left"
          attacking={attackingA} dead={deadA} flash={flashA} floatNum={floatA} />
        <div className="flex-1">
          <div className="flex gap-3 items-center">
            <HpBar hpPct={userHpPct} hp={userHp} maxHp={userMaxHp} flash={userFlash} />
            <div className="text-xs font-bold shrink-0" style={{
              color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.08em',
            }}>VS</div>
            <HpBar hpPct={oppHpPct} hp={oppHp} maxHp={oppMaxHp} flash={oppFlash} />
          </div>
        </div>
        <FighterHead image={fighterBImage} name={fighterBName} align="right"
          attacking={attackingB} dead={deadB} flash={flashB} floatNum={floatB} />
      </div>

      {/* Event log */}
      <div className="flex-1 panel mb-3 overflow-y-auto scrollbar-hide space-y-3" style={{ minHeight: 0, background: 'rgba(14,10,6,0.78)', backdropFilter: 'blur(2px)' }}>
        {displayItems.map((item, i) => {
          if (item.kind === 'banner') {
            return (
              <div key={`banner-${item.round}`} className="flex items-center gap-3 py-1 fade-in">
                <div className="flex-1 h-px" style={{ background: '#3a2810' }} />
                <span className="text-xs font-bold shrink-0" style={{
                  color: '#6a5030', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.12em',
                }}>ROUND {item.round}</span>
                <div className="flex-1 h-px" style={{ background: '#3a2810' }} />
              </div>
            )
          }
          const { event, index } = item
          return (
            <p key={index} className="battle-line text-sm leading-relaxed fade-in"
              style={{
                color: EVENT_COLORS[event.type] || '#e8d5b0',
                fontStyle: event.type === 'flavor' || event.type === 'intro' ? 'italic' : 'normal',
                fontWeight: event.type === 'crit' || event.type === 'outcome' || event.type === 'passive' ? 'bold' : 'normal',
                opacity: getOpacity(index),
                transition: 'opacity 0.6s ease',
              }}>
              {event.type === 'crit' && '💥 '}
              {event.type === 'death' && '☠️ '}
              {event.type === 'surrender' && '🏳️ '}
              {event.type === 'outcome' && '🏆 '}
              {event.type === 'counter' && '↩️ '}
              {event.text}
            </p>
          )
        })}
        {suspense && (
          <p className="text-sm animate-pulse" style={{ color: '#6a5030', letterSpacing: '0.3em' }}>. . .</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="shrink-0">
      {phase === 'interRound' ? (
        /* Inter-round pause panel */
        <div className="panel fade-in space-y-4" style={{ borderTop: '2px solid #5a4028', background: 'rgba(14,10,6,0.82)', backdropFilter: 'blur(2px)' }}>
          <p className="text-sm font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>
            — Round {currentDisplayRound} Complete —
          </p>

          {/* Round summary */}
          <div className="flex gap-4 text-xs">
            <div className="flex-1 p-2 rounded text-center" style={{ background: dmgDealtUser > dmgReceivedUser ? '#0e1e08' : '#1a0e08', border: '1px solid #2a1e10' }}>
              <p style={{ color: '#5abf6a' }}>+{Math.max(0, dmgDealtUser)} dealt</p>
            </div>
            <div className="flex-1 p-2 rounded text-center" style={{ background: '#1a0808', border: '1px solid #2a1e10' }}>
              <p style={{ color: '#bf5a5a' }}>−{Math.max(0, dmgReceivedUser)} received</p>
            </div>
            <div className="flex-1 p-2 rounded text-center" style={{ background: '#0a0806', border: '1px solid #2a1e10' }}>
              <p style={{ color: userAhead ? '#5abf6a' : '#bf5a5a' }}>
                {userAhead ? 'You\'re ahead' : 'Behind'}
              </p>
            </div>
          </div>

          {/* Daring adjustment (mob fights only) */}
          {daringOptions && mobId && (
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>
                ADJUST DARING FOR NEXT ROUND
              </label>
              <select
                value={activeDaring}
                onChange={e => setActiveDaring(e.target.value)}
                className="game-input text-sm"
                disabled={recomputing}>
                {daringOptions.map(d => (
                  <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                ))}
              </select>
              {activeDaring !== committedDaring && (
                <p className="text-xs mt-1 animate-pulse" style={{ color: '#d4a843' }}>
                  Daring change will take effect next round.
                </p>
              )}
            </div>
          )}

          <button
            className="btn-primary w-full"
            onClick={continueToNextRound}
            disabled={recomputing}>
            {recomputing ? 'Recalculating...' : 'Continue →'}
          </button>
        </div>
      ) : done ? (
        <button className="btn-primary w-full fade-in" onClick={() => setShowOutcome(true)}>
          See Results →
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {(['paused', 'normal', 'fast'] as const).map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className="flex-1 text-sm py-2 rounded font-bold transition-all"
                style={{
                  background: speed === s ? 'linear-gradient(to bottom, #e0ba40, #a87018)' : '#1a1208',
                  color: speed === s ? '#160c00' : '#6a5030',
                  border: `1px solid ${speed === s ? '#c8a040' : '#3a2810'}`,
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.04em',
                }}>
                {s === 'paused' ? '⏸' : s === 'normal' ? '▶ Normal' : '⏩ Fast'}
              </button>
            ))}
            <button
              className="px-4 py-2 rounded text-sm"
              style={{ background: '#1a1208', color: '#6a5030', border: '1px solid #3a2810' }}
              onClick={advance}>
              Skip
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: '#4a3820' }}>Space to skip</p>
        </div>
      )}
      </div>
    </div>
  )
}
