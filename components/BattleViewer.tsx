'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BattleEvent } from '@/lib/battle-engine'
import BattleOutcome from './BattleOutcome'

interface CharacterSnapshot {
  hp: number
  maxHp: number
  xp: number
  xpForNextLevel: number
  bones: number
  image: string   // emoji or URL
  name: string
}

interface Props {
  battleData: Record<string, unknown>
  fighterA: CharacterSnapshot
  fighterBName: string
  fighterBImage: string
  onComplete: () => void
  userSide?: 'a' | 'b'   // which fighter in the simulation is the current user
}

const EVENT_COLORS: Record<string, string> = {
  intro:     '#8a7a5a',
  attack:    '#e8d5b0',
  crit:      '#ff9944',
  miss:      '#5a4a3a',
  counter:   '#aabb88',
  roar:      '#c8a84b',
  surrender: '#6ab0bf',
  death:     '#bf4040',
  outcome:   '#c8a84b',
  flavor:    '#4a6a4a',
}

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/') }

function FighterHead({ image, name, align }: { image: string; name: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`} style={{ minWidth: 56 }}>
      {isUrl(image)
        ? <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"
            style={{ border: '2px solid #3d2e1e' }} />
        : <div className="text-4xl leading-none">{image}</div>
      }
      <span className="text-xs font-bold truncate max-w-[80px]" style={{ color: '#c8a84b' }}>{name}</span>
    </div>
  )
}

export default function BattleViewer({ battleData, fighterA, fighterBName, fighterBImage, onComplete, userSide = 'a' }: Props) {
  const events = battleData.events as BattleEvent[]
  const result = battleData.result as Record<string, unknown>

  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const [showOutcome, setShowOutcome] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const advance = useCallback(() => {
    setVisibleCount(v => {
      const next = Math.min(v + 1, events.length)
      if (next >= events.length) setDone(true)
      return next
    })
  }, [events.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); advance() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  const currentEvent = events[visibleCount - 1]
  const hpA = currentEvent?.hpA ?? events[0]?.maxHpA ?? 100
  const hpB = currentEvent?.hpB ?? events[0]?.maxHpB ?? 100
  const maxHpA = events[0]?.maxHpA ?? 100
  const maxHpB = events[0]?.maxHpB ?? 100
  const hpPctA = Math.round((hpA / maxHpA) * 100)
  const hpPctB = Math.round((hpB / maxHpB) * 100)

  // From the user's perspective: left = user, right = opponent
  const userIsA = userSide === 'a'
  const userHpPct  = userIsA ? hpPctA : hpPctB
  const userHp     = userIsA ? hpA    : hpB
  const userMaxHp  = userIsA ? maxHpA : maxHpB
  const oppHpPct   = userIsA ? hpPctB : hpPctA
  const oppHp      = userIsA ? hpB    : hpA
  const oppMaxHp   = userIsA ? maxHpB : maxHpA

  if (showOutcome) {
    const won = result?.winner === userSide
    const aliveKey = userIsA ? 'attackerAlive' : 'defenderAlive'
    const survived = won || (result?.[aliveKey] as boolean | undefined) !== false
    const xpGained = (result?.xpGained as number) ?? 0
    const bonesGained = (result?.bonesGained as number) ?? 0
    const newHp = (result?.newHp as number) ?? fighterA.hp
    const loot = (result?.loot as string[]) ?? []
    const leveledUp = !!(result?.leveledUp)

    return (
      <BattleOutcome
        won={won}
        survived={survived}
        fighterName={fighterA.name}
        fighterImage={fighterA.image}
        hpBefore={fighterA.hp}
        hpAfter={newHp}
        maxHp={fighterA.maxHp}
        xpBefore={fighterA.xp}
        xpAfter={fighterA.xp + xpGained}
        xpForNextLevel={fighterA.xpForNextLevel}
        bonesBefore={fighterA.bones}
        bonesAfter={fighterA.bones + bonesGained}
        loot={loot}
        leveledUp={leveledUp}
        onContinue={onComplete}
      />
    )
  }

  function HpBar({ hpPct, hp, maxHp }: { hpPct: number; hp: number; maxHp: number }) {
    return (
      <div className="flex-1">
        <div className="stat-bar mb-0.5">
          <div className="hp-bar-fill" style={{
            width: `${hpPct}%`,
            background: hpPct > 50 ? '#8b2020' : hpPct > 25 ? '#c8601c' : '#ff3333'
          }} />
        </div>
        <div className="text-xs text-center" style={{ color: '#5a4a3a' }}>{hp}/{maxHp}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-2xl mx-auto">
      {/* HP bars — user always on left, opponent on right */}
      <div className="flex items-center gap-3 mb-6">
        <FighterHead image={fighterA.image} name={fighterA.name} align="left" />
        <div className="flex-1">
          <div className="flex gap-2 items-center mb-1">
            <HpBar hpPct={userHpPct} hp={userHp} maxHp={userMaxHp} />
            <div className="text-sm font-bold shrink-0" style={{ color: '#5a4a3a' }}>VS</div>
            <HpBar hpPct={oppHpPct} hp={oppHp} maxHp={oppMaxHp} />
          </div>
        </div>
        <FighterHead image={fighterBImage} name={fighterBName} align="right" />
      </div>

      {/* Event log */}
      <div className="flex-1 panel mb-6 min-h-64 max-h-[50vh] overflow-y-auto scrollbar-hide space-y-3">
        {events.slice(0, visibleCount).map((event, i) => (
          <p key={i} className="battle-line text-sm leading-relaxed"
            style={{
              color: EVENT_COLORS[event.type] || '#e8d5b0',
              fontStyle: event.type === 'flavor' || event.type === 'intro' ? 'italic' : 'normal',
              fontWeight: event.type === 'crit' || event.type === 'outcome' ? 'bold' : 'normal',
            }}>
            {event.type === 'crit' && '💥 '}
            {event.type === 'death' && '☠️ '}
            {event.type === 'surrender' && '🏳️ '}
            {event.type === 'outcome' && '🏆 '}
            {event.type === 'counter' && '↩️ '}
            {event.round > 0 && event.type !== 'flavor' && event.type !== 'outcome'
              ? <span style={{ color: '#3d2e1e', marginRight: '6px' }}>[R{event.round}]</span>
              : null}
            {event.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="text-center space-y-3">
        <div className="text-xs" style={{ color: '#3d2e1e' }}>{visibleCount} / {events.length}</div>
        {!done ? (
          <div className="space-y-1">
            <button className="btn-primary w-full" onClick={advance}>Next ▶</button>
            <p className="text-xs" style={{ color: '#3d2e1e' }}>or press Space</p>
          </div>
        ) : (
          <button className="btn-primary w-full fade-in" onClick={() => setShowOutcome(true)}>
            See Results →
          </button>
        )}
      </div>
    </div>
  )
}
