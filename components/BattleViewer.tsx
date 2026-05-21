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
const DISPLAY_ROUND_SIZE = 3

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

function hpBarColor(pct: number) {
  if (pct > 50) return 'linear-gradient(to bottom, #d03030 0%, #921818 60%, #6a0f0f 100%)'
  if (pct > 25) return 'linear-gradient(to bottom, #d07020 0%, #924010 60%, #6a2808 100%)'
  return 'linear-gradient(to bottom, #ff4444 0%, #cc2020 60%, #991010 100%)'
}

function FighterHead({ image, name, align, large = false, attacking, dead, flash, floatNum }: {
  image: string; name: string; align: 'left' | 'right'
  large?: boolean; attacking: boolean; dead: boolean; flash: boolean
  floatNum: FloatNum | null
}) {
  const size = large ? 88 : 48
  const animName = dead
    ? 'dino-death 0.8s ease-out forwards'
    : attacking
    ? `${align === 'left' ? 'dino-attack-left' : 'dino-attack-right'} 0.46s ease-out`
    : 'dino-idle 3s ease-in-out infinite'

  const imgStyle: React.CSSProperties = { animation: animName, width: size, height: size }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ position: 'relative' }}>
        {floatNum && (
          <div key={floatNum.id} style={{
            position: 'absolute', top: large ? '-14px' : '-6px', left: '50%',
            animation: 'float-damage 1s ease-out forwards',
            zIndex: 50, pointerEvents: 'none',
            fontWeight: 'bold', fontFamily: 'var(--font-cinzel, Georgia)',
            fontSize: floatNum.isCrit ? (large ? '20px' : '17px') : (large ? '15px' : '13px'),
            color: floatNum.isCrit ? '#ff4444' : floatNum.isCounter ? '#aabb88' : '#ffaa44',
            textShadow: '0 1px 4px rgba(0,0,0,1)', whiteSpace: 'nowrap',
          }}>
            {floatNum.isCrit ? '💥 ' : ''}-{floatNum.amount}
          </div>
        )}
        {isUrl(image)
          ? <img src={image} alt={name}
              style={{ ...imgStyle, borderRadius: large ? '8px' : '50%', objectFit: 'cover',
                border: `${large ? 3 : 2}px solid #5a4028`,
                boxShadow: large ? '0 4px 16px rgba(0,0,0,0.9)' : '0 2px 6px rgba(0,0,0,0.8)' }} />
          : <div style={{ ...imgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: large ? '56px' : '32px', lineHeight: 1 }}>{image}</div>
        }
        {flash && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: large ? '8px' : '50%',
            background: 'rgba(255, 50, 50, 0.55)',
            animation: 'hit-flash 0.35s ease-out forwards',
            pointerEvents: 'none',
          }} />
        )}
      </div>
      <span style={{
        color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)',
        fontSize: large ? '11px' : '10px', fontWeight: 'bold',
        textShadow: '0 1px 4px rgba(0,0,0,1)',
        maxWidth: large ? '100px' : '80px', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {name}
      </span>
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

  const [speed, setSpeed] = useState<'normal' | 'fast' | 'paused'>('normal')
  const [suspense, setSuspense] = useState(false)
  const [done, setDone] = useState(false)

  type Phase = 'playing' | 'interRound'
  const [phase, setPhase] = useState<Phase>('playing')
  const [currentDisplayRound, setCurrentDisplayRound] = useState(1)
  const [activeDaring, setActiveDaring] = useState(initialDaring ?? 'measured')
  const [committedDaring, setCommittedDaring] = useState(initialDaring ?? 'measured')
  const [recomputing, setRecomputing] = useState(false)
  const [roundStartHp, setRoundStartHp] = useState({ a: fighterA.hp, b: localEvents[0]?.maxHpB ?? 100 })

  const [flashA, setFlashA] = useState(false)
  const [flashB, setFlashB] = useState(false)
  const prevHpARef = useRef<number | null>(null)
  const prevHpBRef = useRef<number | null>(null)

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (suspense) { setSuspense(false); return }
      if (phase === 'interRound') return
      if (speed === 'paused') { setSpeed('normal'); return }
      advance()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance, speed, suspense, phase])

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

  useEffect(() => {
    if (phase !== 'playing' || speed === 'paused' || suspense || done) return

    const displayRoundEnd = getDisplayRoundEndIdx(localEvents, currentDisplayRound)

    if (displayRoundEnd >= 0 && visibleCount > displayRoundEnd) {
      const lastEvent = localEvents[displayRoundEnd]
      if (isTerminalEvent(lastEvent)) {
        setDone(true)
      } else if (activeManagement) {
        setPhase('interRound')
      } else {
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
            mobId, daring: activeDaring, surrenderAt,
            hpA: lastShownEvent.hpA, hpB: lastShownEvent.hpB,
            fromRound: nextEngineRound,
            originalXp: fighterA.xp, originalBones: fighterA.bones,
            originalLevel: fighterA.level, originalStatPoints: fighterA.statPoints,
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
      } catch { /* continue with existing events */ }
      setRecomputing(false)
    }

    if (lastShownEvent) setRoundStartHp({ a: lastShownEvent.hpA, b: lastShownEvent.hpB })
    setCurrentDisplayRound(d => d + 1)
    setPhase('playing')
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

  // Inter-round summary
  const endHpA = localEvents[visibleCount - 1]?.hpA ?? fighterA.hp
  const endHpB = localEvents[visibleCount - 1]?.hpB ?? maxHpB
  const dmgDealtUser    = userIsA ? (roundStartHp.b - endHpB) : (roundStartHp.a - endHpA)
  const dmgReceivedUser = userIsA ? (roundStartHp.a - endHpA) : (roundStartHp.b - endHpB)
  const userAhead = userIsA ? endHpA > endHpB : endHpB > endHpA

  const cinzel = 'var(--font-cinzel, Georgia)'

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full" style={{
      height: '100dvh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.55)), url(/images/arena-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>

      {/* ── TOP: Fighting-game HP strip ── */}
      <div className="shrink-0 flex items-stretch px-3 pt-3 pb-2"
        style={{ background: 'rgba(6,4,2,0.88)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(90,64,40,0.4)' }}>

        {/* Fighter A */}
        <div className="flex-1 flex flex-col gap-1 pr-2">
          <div className="flex justify-between items-baseline">
            <span style={{ color: '#d4a843', fontFamily: cinzel, fontSize: '11px', fontWeight: 'bold',
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
              {fighterA.name}
            </span>
            <span style={{ color: '#6a5030', fontSize: '10px', fontFamily: 'monospace' }}>{hpA}/{maxHpA}</span>
          </div>
          <div className="hud-bar" style={{ height: '18px',
            boxShadow: flashA ? '0 0 12px rgba(255,80,80,0.6)' : undefined }}>
            <div style={{
              height: '100%', width: `${hpPctA}%`,
              background: flashA ? 'linear-gradient(to bottom,#ff6060,#ff2020)' : hpBarColor(hpPctA),
              borderRadius: '2px', transition: 'width 0.5s ease, background 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
            }} />
          </div>
        </div>

        {/* Round counter */}
        <div className="shrink-0 flex flex-col items-center justify-center px-3">
          <span style={{ color: '#4a3820', fontFamily: cinzel, fontSize: '9px', letterSpacing: '0.1em' }}>RND</span>
          <span style={{ color: '#8a7040', fontFamily: cinzel, fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>
            {currentDisplayRound}
          </span>
        </div>

        {/* Fighter B — mirrored so bar drains right-to-left */}
        <div className="flex-1 flex flex-col gap-1 pl-2">
          <div className="flex justify-between items-baseline">
            <span style={{ color: '#6a5030', fontSize: '10px', fontFamily: 'monospace' }}>{hpB}/{maxHpB}</span>
            <span style={{ color: '#d4a843', fontFamily: cinzel, fontSize: '11px', fontWeight: 'bold',
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px', textAlign: 'right' }}>
              {fighterBName}
            </span>
          </div>
          <div className="hud-bar" style={{ height: '18px', transform: 'scaleX(-1)',
            boxShadow: flashB ? '0 0 12px rgba(255,80,80,0.6)' : undefined }}>
            <div style={{
              height: '100%', width: `${hpPctB}%`,
              background: flashB ? 'linear-gradient(to bottom,#ff6060,#ff2020)' : hpBarColor(hpPctB),
              borderRadius: '2px', transition: 'width 0.5s ease, background 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
            }} />
          </div>
        </div>
      </div>

      {/* ── ARENA: portraits + event text overlay ── */}
      <div
        className="flex-1 flex flex-col"
        style={{ minHeight: 0, animation: shake ? 'arena-shake 0.46s ease-out' : 'none' }}>

        {/* Portraits — vertically centered in open arena space */}
        <div className="flex-1 flex items-center justify-between px-8">
          <FighterHead image={fighterA.image} name={fighterA.name} align="left" large
            attacking={attackingA} dead={deadA} flash={flashA} floatNum={floatA} />

          <span style={{
            fontFamily: cinzel, fontSize: '26px', fontWeight: 900,
            color: 'rgba(160,120,60,0.18)', textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            userSelect: 'none', pointerEvents: 'none',
          }}>VS</span>

          <FighterHead image={fighterBImage} name={fighterBName} align="right" large
            attacking={attackingB} dead={deadB} flash={flashB} floatNum={floatB} />
        </div>

        {/* Pokémon-style event message — single line, fades in on each new event */}
        <div className="px-5 pb-4">
          {suspense ? (
            <div style={{
              background: 'rgba(6,4,2,0.82)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(90,64,40,0.45)', borderRadius: '6px',
              padding: '0.75rem 1.25rem', textAlign: 'center',
            }}>
              <span className="animate-pulse" style={{ color: '#4a3820', letterSpacing: '0.4em', fontSize: '1rem' }}>. . .</span>
            </div>
          ) : currentEvent ? (
            <div key={visibleCount} className="fade-in" style={{
              background: 'rgba(6,4,2,0.82)', backdropFilter: 'blur(4px)',
              border: `1px solid ${currentEvent.type === 'crit' ? 'rgba(255,120,40,0.5)' : currentEvent.type === 'death' || currentEvent.type === 'outcome' ? 'rgba(180,60,60,0.5)' : 'rgba(90,64,40,0.45)'}`,
              borderRadius: '6px', padding: '0.75rem 1.25rem', textAlign: 'center',
              boxShadow: currentEvent.type === 'crit' ? '0 0 16px rgba(255,120,40,0.2)' : 'none',
            }}>
              <p style={{
                color: EVENT_COLORS[currentEvent.type] || '#e8d5b0',
                fontStyle: currentEvent.type === 'flavor' || currentEvent.type === 'intro' ? 'italic' : 'normal',
                fontWeight: currentEvent.type === 'crit' || currentEvent.type === 'outcome' || currentEvent.type === 'passive' || currentEvent.type === 'death' ? 'bold' : 'normal',
                fontSize: '0.9rem', lineHeight: 1.5,
              }}>
                {currentEvent.type === 'crit' && '💥 '}
                {currentEvent.type === 'death' && '☠️ '}
                {currentEvent.type === 'surrender' && '🏳️ '}
                {currentEvent.type === 'outcome' && '🏆 '}
                {currentEvent.type === 'counter' && '↩️ '}
                {currentEvent.text}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── BOTTOM: Controls only ── */}
      <div className="shrink-0 px-4 pb-4 pt-3"
        style={{ background: 'rgba(6,4,2,0.88)', backdropFilter: 'blur(6px)', borderTop: '1px solid rgba(90,64,40,0.35)' }}>
        {phase === 'interRound' ? (
          <div className="space-y-3 fade-in">
            <p className="text-xs font-bold text-center" style={{ color: '#d4a843', fontFamily: cinzel, letterSpacing: '0.06em' }}>
              — Round {currentDisplayRound} Complete —
            </p>

            <div className="flex gap-2 text-xs">
              <div className="flex-1 py-1.5 px-2 rounded text-center" style={{ background: dmgDealtUser > dmgReceivedUser ? '#0e1e08' : '#1a0e08', border: '1px solid #2a1e10' }}>
                <p style={{ color: '#5abf6a' }}>+{Math.max(0, dmgDealtUser)} dealt</p>
              </div>
              <div className="flex-1 py-1.5 px-2 rounded text-center" style={{ background: '#1a0808', border: '1px solid #2a1e10' }}>
                <p style={{ color: '#bf5a5a' }}>−{Math.max(0, dmgReceivedUser)} received</p>
              </div>
              <div className="flex-1 py-1.5 px-2 rounded text-center" style={{ background: '#0a0806', border: '1px solid #2a1e10' }}>
                <p style={{ color: userAhead ? '#5abf6a' : '#bf5a5a' }}>{userAhead ? 'Ahead' : 'Behind'}</p>
              </div>
            </div>

            {daringOptions && mobId && (
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#a08050', fontFamily: cinzel, letterSpacing: '0.06em' }}>
                  ADJUST DARING
                </label>
                <select value={activeDaring} onChange={e => setActiveDaring(e.target.value)}
                  className="game-input text-sm" disabled={recomputing}>
                  {daringOptions.map(d => (
                    <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                  ))}
                </select>
                {activeDaring !== committedDaring && (
                  <p className="text-xs mt-1 animate-pulse" style={{ color: '#d4a843' }}>Change takes effect next round.</p>
                )}
              </div>
            )}

            <button className="btn-primary w-full" onClick={continueToNextRound} disabled={recomputing}>
              {recomputing ? 'Recalculating...' : 'Continue →'}
            </button>
          </div>
        ) : done ? (
          <button className="btn-primary w-full fade-in" onClick={() => setShowOutcome(true)}>
            See Results →
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {(['paused', 'normal', 'fast'] as const).map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className="flex-1 text-xs py-2 rounded font-bold transition-all"
                style={{
                  background: speed === s ? 'linear-gradient(to bottom, #e0ba40, #a87018)' : 'rgba(20,14,6,0.9)',
                  color: speed === s ? '#160c00' : '#6a5030',
                  border: `1px solid ${speed === s ? '#c8a040' : '#3a2810'}`,
                  fontFamily: cinzel, letterSpacing: '0.04em',
                }}>
                {s === 'paused' ? '⏸' : s === 'normal' ? '▶ Play' : '⏩ Fast'}
              </button>
            ))}
            <button
              className="px-3 py-2 rounded text-xs"
              style={{ background: 'rgba(20,14,6,0.9)', color: '#6a5030', border: '1px solid #3a2810' }}
              onClick={advance}>
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
