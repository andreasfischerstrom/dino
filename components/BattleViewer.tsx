'use client'
import { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
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
  viewerSnapshot?: CharacterSnapshot
}

const EVENT_COLORS: Record<string, string> = {
  intro:     '#7a6a4a',
  attack:    '#e8d5b0',
  crit:      '#ff9944',
  miss:      '#6a5a3a',
  counter:   '#aabb88',
  roar:      '#d4a843',
  surrender: '#6ab0bf',
  death:     '#bf4040',
  outcome:   '#d4a843',
  flavor:    '#6a5a3a',
  passive:   '#d4a843',
}

const CHAR_SPEED = 28       // ms per character while typing
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

function EventIcon({ type }: { type: string }) {
  const map: Record<string, string> = {
    crit: 'game-icons:burst-blob',
    death: 'game-icons:skull-crossbones',
    surrender: 'game-icons:white-flag',
    outcome: 'game-icons:trophy-cup',
    counter: 'game-icons:return-arrow',
  }
  const icon = map[type]
  if (!icon) return null
  return <Icon icon={icon} width={14} height={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', position: 'relative', top: '-1px' }} />
}

function FighterHead({ image, name, align, size = 72, attacking, dead, flash, floatNum }: {
  image: string; name: string; align: 'left' | 'right'; size?: number
  attacking: boolean; dead: boolean; flash: boolean; floatNum: FloatNum | null
}) {
  const animName = dead
    ? 'dino-death 0.8s ease-out forwards'
    : attacking
    ? `${align === 'left' ? 'dino-attack-left' : 'dino-attack-right'} 0.46s ease-out`
    : 'dino-idle 3s ease-in-out infinite'

  const imgStyle: React.CSSProperties = { animation: animName, width: size, height: size }

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div style={{ position: 'relative' }}>
        {floatNum && (
          <div key={floatNum.id} style={{
            position: 'absolute', top: '-14px', left: '50%',
            animation: 'float-damage 1s ease-out forwards',
            zIndex: 50, pointerEvents: 'none',
            fontWeight: 'bold', fontFamily: 'var(--font-cinzel, Georgia)',
            fontSize: floatNum.isCrit ? '18px' : '14px',
            color: floatNum.isCrit ? '#ff4444' : floatNum.isCounter ? '#aabb88' : '#ffaa44',
            textShadow: '0 1px 4px rgba(0,0,0,1)', whiteSpace: 'nowrap',
          }}>
            {floatNum.isCrit ? '💥 ' : ''}-{floatNum.amount}
          </div>
        )}
        {isUrl(image)
          ? <img src={image} alt={name} style={{
              ...imgStyle, borderRadius: '8px', objectFit: 'cover',
              border: '3px solid #5a4028', boxShadow: '0 4px 16px rgba(0,0,0,0.9)',
            }} />
          : <div style={{ ...imgStyle, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: `${size * 0.65}px`, lineHeight: 1 }}>{image}</div>
        }
        {flash && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '8px',
            background: 'rgba(255,50,50,0.55)',
            animation: 'hit-flash 0.35s ease-out forwards',
            pointerEvents: 'none',
          }} />
        )}
      </div>
      <span style={{
        color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)',
        fontSize: '11px', fontWeight: 'bold',
        textShadow: '0 1px 4px rgba(0,0,0,1)',
        maxWidth: `${size + 20}px`, overflow: 'hidden',
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
  viewerSnapshot,
}: Props) {
  const [localEvents, setLocalEvents] = useState<BattleEvent[]>(() => battleData.events as BattleEvent[])
  const [localResult, setLocalResult] = useState<Record<string, unknown>>(() => battleData.result as Record<string, unknown>)
  const [visibleCount, setVisibleCount] = useState(1)
  const [showOutcome, setShowOutcome] = useState(false)

  type Phase = 'playing' | 'interRound'
  const [phase, setPhase] = useState<Phase>('playing')
  const [currentDisplayRound, setCurrentDisplayRound] = useState(1)
  const [activeDaring, setActiveDaring] = useState(initialDaring ?? 'measured')
  const [committedDaring, setCommittedDaring] = useState(initialDaring ?? 'measured')
  const [recomputing, setRecomputing] = useState(false)
  const [roundStartHp, setRoundStartHp] = useState({ a: fighterA.hp, b: localEvents[0]?.maxHpB ?? 100 })

  const [flashA, setFlashA] = useState(false)
  const [flashB, setFlashB] = useState(false)
  const initHpB = localEvents[0]?.maxHpB ?? 100
  const [displayedHpA, setDisplayedHpA] = useState(fighterA.hp)
  const [displayedHpB, setDisplayedHpB] = useState(initHpB)
  const displayedHpARef = useRef(fighterA.hp)
  const displayedHpBRef = useRef(initHpB)

  const [attackingA, setAttackingA] = useState(false)
  const [attackingB, setAttackingB] = useState(false)
  const [deadA, setDeadA] = useState(false)
  const [deadB, setDeadB] = useState(false)
  const [floatA, setFloatA] = useState<FloatNum | null>(null)
  const [floatB, setFloatB] = useState<FloatNum | null>(null)
  const [shake, setShake] = useState(false)
  const floatIdRef = useRef(0)

  // Typewriter state
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [waitingForTap, setWaitingForTap] = useState(false)
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleTapRef = useRef<() => void>(() => {})
  const [isTouch, setIsTouch] = useState(false)
  const [portraitSize, setPortraitSize] = useState(72)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
    setPortraitSize(Math.min(96, Math.max(72, Math.floor(window.innerWidth * 0.22))))
  }, [])

  function showFloat(set: (v: FloatNum | null) => void, amount: number, isCrit: boolean, isCounter: boolean) {
    set({ id: ++floatIdRef.current, amount, isCrit, isCounter })
    setTimeout(() => set(null), 1050)
  }

  function triggerEventAnimations(event: BattleEvent) {
    // HP bars + flash — fire together with animations
    if (event.hpA < displayedHpARef.current - 4) {
      setFlashA(true); setTimeout(() => setFlashA(false), 350)
    }
    if (event.hpB < displayedHpBRef.current - 4) {
      setFlashB(true); setTimeout(() => setFlashB(false), 350)
    }
    setDisplayedHpA(event.hpA)
    setDisplayedHpB(event.hpB)
    displayedHpARef.current = event.hpA
    displayedHpBRef.current = event.hpB

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
  }

  // Typewriter: start typing when the current event changes
  useEffect(() => {
    const event = localEvents[visibleCount - 1]
    if (!event) return

    if (typeTimerRef.current) clearTimeout(typeTimerRef.current)
    setTypedText('')
    setIsTyping(true)
    setWaitingForTap(false)

    const chars = [...event.text]
    let i = 0

    function tick() {
      i++
      setTypedText(chars.slice(0, i).join(''))
      if (i < chars.length) {
        typeTimerRef.current = setTimeout(tick, CHAR_SPEED)
      } else {
        setIsTyping(false)
        setWaitingForTap(true)
        triggerEventAnimations(event)
      }
    }

    typeTimerRef.current = setTimeout(tick, CHAR_SPEED)
    return () => { if (typeTimerRef.current) clearTimeout(typeTimerRef.current) }
  }, [visibleCount, localEvents])

  const currentEvent = localEvents[visibleCount - 1]
  const maxHpA = localEvents[0]?.maxHpA ?? fighterA.maxHp
  const maxHpB = localEvents[0]?.maxHpB ?? 100

  function completeTyping() {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current)
    const event = localEvents[visibleCount - 1]
    if (event) {
      setTypedText(event.text)
      triggerEventAnimations(event)
    }
    setIsTyping(false)
    setWaitingForTap(true)
  }

  function advance() {
    setWaitingForTap(false)
    const displayRoundEnd = getDisplayRoundEndIdx(localEvents, currentDisplayRound)
    const isAtRoundEnd = displayRoundEnd >= 0 && (visibleCount - 1) === displayRoundEnd

    if (isAtRoundEnd) {
      const lastEvent = localEvents[displayRoundEnd]
      if (isTerminalEvent(lastEvent)) {
        setShowOutcome(true)
        return
      }
      if (activeManagement) {
        setPhase('interRound')
        return
      }
      setRoundStartHp({ a: lastEvent.hpA, b: lastEvent.hpB })
      setCurrentDisplayRound(d => d + 1)
    }

    const nextCount = visibleCount + 1
    if (nextCount > localEvents.length) {
      setShowOutcome(true)
      return
    }
    setVisibleCount(nextCount)
  }

  function handleTap() {
    if (phase === 'interRound') return
    if (isTyping) { completeTyping(); return }
    if (waitingForTap) advance()
  }

  // Keep ref current for the stable keyboard listener
  handleTapRef.current = handleTap

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleTapRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
    setVisibleCount(v => v + 1)
  }

  const hpPctA = Math.round((displayedHpA / maxHpA) * 100)
  const hpPctB = Math.round((displayedHpB / maxHpB) * 100)
  const userIsA = userSide === 'a'

  const leftName  = userIsA ? fighterA.name  : fighterBName
  const leftImage = userIsA ? fighterA.image : fighterBImage
  const rightName  = userIsA ? fighterBName  : fighterA.name
  const rightImage = userIsA ? fighterBImage : fighterA.image

  const endHpA = localEvents[visibleCount - 1]?.hpA ?? fighterA.hp
  const endHpB = localEvents[visibleCount - 1]?.hpB ?? maxHpB
  const dmgDealtUser    = userIsA ? (roundStartHp.b - endHpB) : (roundStartHp.a - endHpA)
  const dmgReceivedUser = userIsA ? (roundStartHp.a - endHpA) : (roundStartHp.b - endHpB)
  const userAhead = userIsA ? endHpA > endHpB : endHpB > endHpA

  const cinzel = 'var(--font-cinzel, Georgia)'

  if (showOutcome) {
    const viewer = viewerSnapshot ?? fighterA
    const won = localResult?.winner === userSide
    const aliveKey = userIsA ? 'attackerAlive' : 'defenderAlive'
    const survived = won || (localResult?.[aliveKey] as boolean | undefined) !== false
    const xpGained = (localResult?.xpGained as number) ?? 0
    const bonesGained = (localResult?.bonesGained as number) ?? 0
    const newHp = (localResult?.newHp as number) ?? viewer.hp
    const leveledUp = !!(localResult?.leveledUp)
    return (
      <BattleOutcome
        won={won} survived={survived}
        fighterName={viewer.name} fighterImage={viewer.image}
        hpBefore={viewer.hp} hpAfter={newHp} maxHp={viewer.maxHp}
        xpBefore={viewer.xp} xpAfter={viewer.xp + xpGained}
        xpForNextLevel={viewer.xpForNextLevel}
        bonesBefore={viewer.bones} bonesAfter={viewer.bones + bonesGained}
        leveledUp={leveledUp} onContinue={onComplete}
      />
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060402', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div className="flex flex-col w-full max-w-2xl" style={{
      height: '100%',
      maxHeight: '640px',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.55)), url(/images/arena-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <style>{`
        @keyframes blink-arrow { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        .advance-arrow { animation: blink-arrow 0.7s step-end infinite; }
        @keyframes cursor-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        .type-cursor { animation: cursor-blink 0.55s step-end infinite; }
      `}</style>

      {/* ── TOP: HP strip ── */}
      <div className="shrink-0 flex items-stretch px-3 pt-3 pb-2"
        style={{ background: 'rgba(6,4,2,0.88)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(90,64,40,0.4)' }}>

        <div className="flex-1 flex flex-col gap-1 pr-2">
          <div className="flex justify-between items-baseline">
            <span style={{ color: '#d4a843', fontFamily: cinzel, fontSize: '11px', fontWeight: 'bold',
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '130px' }}>
              {leftName}
            </span>
            <span style={{ color: '#6a5030', fontSize: '10px', fontFamily: 'monospace' }}>{displayedHpA}/{maxHpA}</span>
          </div>
          <div className="hud-bar" style={{ height: '18px', boxShadow: flashA ? '0 0 12px rgba(255,80,80,0.6)' : undefined }}>
            <div style={{
              height: '100%', width: `${hpPctA}%`,
              background: flashA ? 'linear-gradient(to bottom,#ff6060,#ff2020)' : hpBarColor(hpPctA),
              borderRadius: '2px', transition: 'width 0.5s ease, background 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
            }} />
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center justify-center px-3">
          <span style={{ color: '#4a3820', fontFamily: cinzel, fontSize: '9px', letterSpacing: '0.1em' }}>RND</span>
          <span style={{ color: '#8a7040', fontFamily: cinzel, fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>
            {currentDisplayRound}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-1 pl-2">
          <div className="flex justify-between items-baseline">
            <span style={{ color: '#6a5030', fontSize: '10px', fontFamily: 'monospace' }}>{displayedHpB}/{maxHpB}</span>
            <span style={{ color: '#d4a843', fontFamily: cinzel, fontSize: '11px', fontWeight: 'bold',
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '130px', textAlign: 'right' }}>
              {rightName}
            </span>
          </div>
          <div className="hud-bar" style={{ height: '18px', transform: 'scaleX(-1)', boxShadow: flashB ? '0 0 12px rgba(255,80,80,0.6)' : undefined }}>
            <div style={{
              height: '100%', width: `${hpPctB}%`,
              background: flashB ? 'linear-gradient(to bottom,#ff6060,#ff2020)' : hpBarColor(hpPctB),
              borderRadius: '2px', transition: 'width 0.5s ease, background 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
            }} />
          </div>
        </div>
      </div>

      {/* ── ARENA: portraits ── */}
      <div
        className="flex-1 flex items-center justify-between gap-3 px-5"
        style={{ minHeight: 0, animation: shake ? 'arena-shake 0.46s ease-out' : 'none' }}>

        <FighterHead image={leftImage} name={leftName} align="left" size={portraitSize}
          attacking={attackingA} dead={deadA} flash={flashA} floatNum={floatA} />

        <div className="flex-1" />

        <FighterHead image={rightImage} name={rightName} align="right" size={portraitSize}
          attacking={attackingB} dead={deadB} flash={flashB} floatNum={floatB} />
      </div>

      {/* ── BOTTOM: text box (Pokémon-style) + inter-round panel ── */}
      {phase === 'interRound' ? (
        <div className="shrink-0 px-4 pb-4 pt-3 fade-in"
          style={{ background: 'rgba(6,4,2,0.9)', backdropFilter: 'blur(6px)', borderTop: '1px solid rgba(90,64,40,0.35)' }}>
          <div className="space-y-3">
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
        </div>
      ) : (
        /* Pokémon-style text box */
        <div
          className="shrink-0 px-4 pb-3 pt-3"
          style={{
            background: 'rgba(6,4,2,0.92)',
            backdropFilter: 'blur(8px)',
            borderTop: `1px solid ${currentEvent?.type === 'crit' ? 'rgba(255,120,40,0.5)' : currentEvent?.type === 'death' || currentEvent?.type === 'outcome' ? 'rgba(180,60,60,0.45)' : 'rgba(90,64,40,0.4)'}`,
            cursor: 'pointer',
            height: '108px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
          onClick={handleTap}
        >
          {currentEvent && (
            <p style={{
              color: EVENT_COLORS[currentEvent.type] || '#e8d5b0',
              fontStyle: currentEvent.type === 'flavor' || currentEvent.type === 'intro' ? 'italic' : 'normal',
              fontWeight: currentEvent.type === 'crit' || currentEvent.type === 'outcome' || currentEvent.type === 'passive' || currentEvent.type === 'death' ? 'bold' : 'normal',
              fontSize: '0.9rem', lineHeight: 1.6,
              overflow: 'hidden',
              flex: 1,
            }}>
              <EventIcon type={currentEvent.type} />
              {typedText}
              {isTyping && (
                <span className="type-cursor" style={{ color: '#d4a843', marginLeft: '1px' }}>▌</span>
              )}
            </p>
          )}

          <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#3a2e1a', fontSize: '10px', letterSpacing: '0.06em' }}>
              {phase === 'playing' && (isTouch ? 'tap to continue' : 'space / tap')}
            </span>
            <span className="advance-arrow" style={{ color: '#d4a843', fontSize: '12px', visibility: waitingForTap ? 'visible' : 'hidden' }}>▼</span>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
