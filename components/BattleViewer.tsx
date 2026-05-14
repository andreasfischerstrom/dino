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
  image: string
  name: string
}

interface Props {
  battleData: Record<string, unknown>
  fighterA: CharacterSnapshot
  fighterBName: string
  fighterBImage: string
  onComplete: () => void
  userSide?: 'a' | 'b'
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
}

function isUrl(s: string) { return s.startsWith('http') || s.startsWith('/') }

function FighterHead({ image, name, align }: { image: string; name: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`} style={{ minWidth: 56 }}>
      {isUrl(image)
        ? <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"
            style={{ border: '2px solid #5a4028', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }} />
        : <div className="text-4xl leading-none">{image}</div>
      }
      <span className="text-xs font-bold truncate max-w-[80px]"
        style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
        {name}
      </span>
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
  const hpA = currentEvent?.hpA ?? events[0]?.hpA ?? 100
  const hpB = currentEvent?.hpB ?? events[0]?.hpB ?? 100
  const maxHpA = events[0]?.maxHpA ?? 100
  const maxHpB = events[0]?.maxHpB ?? 100
  const hpPctA = Math.round((hpA / maxHpA) * 100)
  const hpPctB = Math.round((hpB / maxHpB) * 100)

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
        leveledUp={leveledUp}
        onContinue={onComplete}
      />
    )
  }

  function hpBarColor(pct: number) {
    if (pct > 50) return 'linear-gradient(to bottom, #d03030 0%, #921818 60%, #6a0f0f 100%)'
    if (pct > 25) return 'linear-gradient(to bottom, #d07020 0%, #924010 60%, #6a2808 100%)'
    return 'linear-gradient(to bottom, #ff4444 0%, #cc2020 60%, #991010 100%)'
  }

  function HpBar({ hpPct, hp, maxHp }: { hpPct: number; hp: number; maxHp: number }) {
    return (
      <div className="flex-1">
        <div className="hud-bar mb-0.5" style={{ flex: 'none', width: '100%' }}>
          <div style={{
            height: '100%',
            width: `${hpPct}%`,
            background: hpBarColor(hpPct),
            borderRadius: '2px',
            transition: 'width 0.4s ease',
            boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
          }} />
        </div>
        <div className="text-xs text-center" style={{ color: '#a08050' }}>{hp}/{maxHp}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-2xl mx-auto">
      {/* Fighter HP bars */}
      <div className="flex items-center gap-3 mb-6 panel" style={{ padding: '1rem' }}>
        <FighterHead image={fighterA.image} name={fighterA.name} align="left" />
        <div className="flex-1">
          <div className="flex gap-3 items-center">
            <HpBar hpPct={userHpPct} hp={userHp} maxHp={userMaxHp} />
            <div className="text-xs font-bold shrink-0" style={{
              color: '#a08050',
              fontFamily: 'var(--font-cinzel, Georgia)',
              letterSpacing: '0.08em',
            }}>VS</div>
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
              ? <span style={{ color: '#2a1e0e', marginRight: '6px' }}>[R{event.round}]</span>
              : null}
            {event.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="text-center space-y-3">
        <div className="text-xs" style={{ color: '#8a7040' }}>{visibleCount} / {events.length}</div>
        {!done ? (
          <div className="space-y-1">
            <button className="btn-primary w-full" onClick={advance}>Next ▶</button>
            <p className="text-xs" style={{ color: '#8a7040' }}>or press Space</p>
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
