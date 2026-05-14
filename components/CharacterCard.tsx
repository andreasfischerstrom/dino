'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GearSlot } from '@/lib/game-data'

interface SlotItem {
  key: GearSlot
  label: string
  emoji: string
  item: { name: string; emoji: string } | null
}

interface StatRow {
  key: string
  label: string
  emoji: string
  base: number
  gear: number
  buff: number
  total: number
}

interface Buff {
  stat: string
  bonus: number
  label: string
}

interface Props {
  name: string
  image: string | null
  speciesEmoji: string
  speciesName: string
  level: number
  hp: number
  maxHp: number
  xp: number
  xpCurrent: number
  xpForNext: number
  statPoints: number
  characterId: string
  kills: number
  wins: number
  losses: number
  bones: number
  stats: StatRow[]
  slots: SlotItem[]
  buffs: Buff[]
}

export default function CharacterCard({
  name, image, speciesEmoji, speciesName, level,
  hp, maxHp, xp, xpCurrent, xpForNext, statPoints, characterId,
  kills, wins, losses, bones,
  stats, slots, buffs,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [localStatPoints, setLocalStatPoints] = useState(statPoints)
  const [localStats, setLocalStats] = useState(stats)
  const [spending, setSpending] = useState<string | null>(null)

  const hpPct = Math.round((hp / maxHp) * 100)
  const xpSpan = xpForNext - xpCurrent
  const xpPct = Math.min(100, Math.round(((xp - xpCurrent) / xpSpan) * 100))

  async function spendPoint(statKey: string) {
    if (localStatPoints < 1 || spending) return
    setSpending(statKey)
    const res = await fetch('/api/character/spend-stat-point', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stat: statKey }),
    })
    if (res.ok) {
      setLocalStatPoints(p => p - 1)
      setLocalStats(prev => prev.map(s => s.key === statKey
        ? { ...s, base: s.base + 1, total: s.total + 1 }
        : s
      ))
    }
    setSpending(null)
  }
  const hasBuffs = buffs.length > 0

  return (
    <div className="mb-4" style={{
      background: 'linear-gradient(155deg, #1e1a14 0%, #141008 100%)',
      border: '1px solid #4a3520',
      borderTop: '2px solid #5a4028',
      borderRadius: '4px',
      padding: '1.25rem',
      boxShadow: '0 3px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,220,100,0.04)',
    }}>
      {/* Always-visible top section */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {image
            ? <img src={image} alt={name} className="w-14 h-14 rounded-lg object-cover"
                style={{ border: '2px solid #5a4028', boxShadow: '0 2px 6px rgba(0,0,0,0.7)' }} />
            : <div className="text-4xl leading-none w-14 h-14 flex items-center justify-center rounded-lg"
                style={{ background: '#0a0806', border: '2px solid #3a2810' }}>
                {speciesEmoji}
              </div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-bold text-lg leading-none" style={{
              color: '#d4a843',
              fontFamily: 'var(--font-cinzel, Georgia)',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>{name}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{
              background: '#1a1208',
              color: '#a08050',
              border: '1px solid #3a2810',
              fontFamily: 'var(--font-cinzel, Georgia)',
              letterSpacing: '0.03em',
            }}>
              Lvl {level} {speciesName}
            </span>
          </div>

          {/* HP bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs shrink-0 w-6 text-center" style={{ color: '#8b1515' }}>❤</span>
            <div className="hud-bar">
              <div className="hud-bar-hp" style={{ width: `${hpPct}%` }} />
            </div>
            <span className="text-xs w-16 text-right tabular-nums shrink-0" style={{ color: '#a08050' }}>{hp}/{maxHp}</span>
          </div>

          {/* XP bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs shrink-0 w-6 text-center" style={{ color: '#267a38' }}>✦</span>
            <div className="hud-bar">
              <div className="hud-bar-xp" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="text-xs w-16 text-right tabular-nums shrink-0" style={{ color: '#a08050' }}>{xp - xpCurrent}/{xpSpan}</span>
          </div>

          <div className="mt-2 flex gap-4 text-xs flex-wrap">
            <span className="flex items-center gap-1" title="Kills — opponents defeated in battle" style={{ color: '#b09060' }}>
              <span>💀</span><span>{kills} kills</span>
            </span>
            <span className="flex items-center gap-1" title="Win / Loss record" style={{ color: '#b09060' }}>
              <span>⚔️</span><span>{wins}W / {losses}L</span>
            </span>
            <span className="flex items-center gap-1" title="Bones — currency used in the shop" style={{ color: '#b09060' }}>
              <span>🦴</span><span>{bones} bones</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors btn-ghost"
          style={{ color: '#a08050', border: 'none', padding: '0.25rem 0.5rem' }}
          title={expanded ? 'Collapse' : 'Show stats & equipment'}>
          <span className="text-xs" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-cinzel, Georgia)' }}>
            {expanded ? 'less' : 'stats'}
          </span>
          <span style={{ fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Collapsible section */}
      {expanded && (
        <div className="mt-4 pt-3 fade-in" style={{ borderTop: '1px solid #3a2810' }}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-bold" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.08em' }}>STATS</p>
            <div className="flex gap-3 text-xs">
              <span style={{ color: '#a08050' }}>■ base</span>
              {localStats.some(s => s.gear !== 0) && <span style={{ color: '#d4a843' }}>■ gear</span>}
              {hasBuffs && <span style={{ color: '#5abf6a' }}>■ buff</span>}
            </div>
            {localStatPoints > 0 && (
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>
                +{localStatPoints} pts
              </span>
            )}
            <Link href="/equipment" className="ml-auto text-xs font-bold"
              style={{ color: '#d4a843', textDecoration: 'none', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.04em' }}>
              ⚔️ Equipment →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
            {localStats.map(stat => {
              const barMax = 15
              const basePct = Math.min(100, (stat.base / barMax) * 100)
              const gearPct = Math.min(100 - basePct, (stat.gear / barMax) * 100)
              const buffPct = Math.min(100 - basePct - gearPct, (stat.buff / barMax) * 100)
              return (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{stat.emoji}</span>
                  <span className="text-xs w-20 shrink-0" style={{ color: '#a08050' }}>{stat.label}</span>
                  <div className="flex-1 stat-bar">
                    <div style={{ display: 'flex', height: '10px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${basePct}%`, background: '#6a5a3a' }} />
                      {stat.gear > 0 && <div style={{ width: `${gearPct}%`, background: '#a88030' }} />}
                      {stat.buff > 0 && <div style={{ width: `${buffPct}%`, background: '#3a8a4a' }} />}
                    </div>
                  </div>
                  <span className="text-xs font-bold w-5 text-right shrink-0" style={{ color: '#d4a843' }}>{stat.total}</span>
                  <span className="text-xs w-10 shrink-0" style={{ fontSize: '10px' }}>
                    {stat.gear !== 0 && <span style={{ color: '#a88030' }}> +{stat.gear}</span>}
                    {stat.buff !== 0 && <span style={{ color: '#3a8a4a' }}> +{stat.buff}</span>}
                  </span>
                  {localStatPoints > 0 && (
                    <button
                      onClick={() => spendPoint(stat.key)}
                      disabled={spending !== null}
                      className="shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center"
                      style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>
                      {spending === stat.key ? '…' : '+'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-3" style={{ borderTop: '1px solid #1e1408' }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.map(slot => (
                <Link key={slot.key} href="/equipment" style={{ textDecoration: 'none' }}
                  title={slot.item ? slot.item.name : `${slot.label} — empty`}>
                  <div className="flex flex-col items-center gap-1 p-2 rounded transition-colors"
                    style={{
                      background: slot.item ? '#1a1610' : '#0d0b08',
                      border: `1px solid ${slot.item ? '#4a3520' : '#2a1e14'}`,
                      minHeight: '60px',
                      justifyContent: 'center',
                    }}>
                    <span className="text-lg leading-none">{slot.item ? slot.item.emoji : slot.emoji}</span>
                    <span style={{
                      fontSize: '11px',
                      color: slot.item ? '#c0a060' : '#5a4a30',
                      width: '100%',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {slot.item ? slot.item.name : slot.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {hasBuffs && (
            <div className="mt-3 flex flex-wrap gap-2">
              {buffs.map((b, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded"
                  style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>
                  ⚡ {b.label} (+{b.bonus} {b.stat})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
