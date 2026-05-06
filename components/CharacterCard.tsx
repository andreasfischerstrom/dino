'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StatDefinition, GearSlot } from '@/lib/game-data'

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
  xpForNext: number
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
  hp, maxHp, xp, xpForNext,
  kills, wins, losses, bones,
  stats, slots, buffs,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const hpPct = Math.round((hp / maxHp) * 100)
  const xpPct = Math.min(100, Math.round((xp / xpForNext) * 100))
  const hasGear = stats.some(s => s.gear !== 0)
  const hasBuffs = buffs.length > 0

  return (
    <div className="panel mb-4">
      {/* Always-visible top section */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {image
            ? <img src={image} alt={name} className="w-14 h-14 rounded-lg object-cover" style={{ border: '2px solid #c8a84b' }} />
            : <span className="text-4xl leading-none">{speciesEmoji}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-lg" style={{ color: '#c8a84b' }}>{name}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#2a1f10', color: '#8a7a5a' }}>
              Lvl {level} {speciesName}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs w-8" style={{ color: '#5a4a3a' }}>HP</span>
              <div className="flex-1 stat-bar">
                <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
              </div>
              <span className="text-xs w-16 text-right tabular-nums" style={{ color: '#8a7a5a' }}>{hp}/{maxHp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-8" style={{ color: '#5a4a3a' }}>XP</span>
              <div className="flex-1 stat-bar">
                <div style={{ height: '8px', borderRadius: '4px', background: '#4a7a4a', width: `${xpPct}%`, transition: 'width 0.3s' }} />
              </div>
              <span className="text-xs w-16 text-right tabular-nums" style={{ color: '#8a7a5a' }}>{xp}/{xpForNext}</span>
            </div>
          </div>
          <div className="mt-1.5 flex gap-3 text-xs flex-wrap" style={{ color: '#5a4a3a' }}>
            <span>💀 {kills}</span>
            <span>✅ {wins}W/{losses}L</span>
            <span>🦴 {bones}</span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors"
          style={{ color: '#5a4a3a', background: 'transparent' }}
          title={expanded ? 'Collapse' : 'Show stats & equipment'}>
          <span className="text-xs" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {expanded ? 'less' : 'stats'}
          </span>
          <span style={{ fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Collapsible stats + equipment section */}
      {expanded && (
        <div className="mt-4 pt-3 fade-in" style={{ borderTop: '1px solid #3d2e1e' }}>
          {/* Stats header */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-bold" style={{ color: '#5a4a3a' }}>STATS</p>
            <div className="flex gap-3 text-xs">
              <span style={{ color: '#8a7a5a' }}>■ base</span>
              {hasGear && <span style={{ color: '#c8a84b' }}>■ gear</span>}
              {hasBuffs && <span style={{ color: '#6abf6a' }}>■ buff</span>}
            </div>
            <Link href="/equipment" className="ml-auto text-xs font-bold"
              style={{ color: '#c8a84b', textDecoration: 'none' }}>
              ⚔️ Equipment →
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
            {stats.map(stat => {
              const barMax = 15
              const basePct = Math.min(100, (stat.base / barMax) * 100)
              const gearPct = Math.min(100 - basePct, (stat.gear / barMax) * 100)
              const buffPct = Math.min(100 - basePct - gearPct, (stat.buff / barMax) * 100)
              return (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{stat.emoji}</span>
                  <span className="text-xs w-20 shrink-0" style={{ color: '#8a7a5a' }}>{stat.label}</span>
                  <div className="flex-1 stat-bar">
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${basePct}%`, background: '#6a5a3a' }} />
                      {stat.gear > 0 && <div style={{ width: `${gearPct}%`, background: '#9a8040' }} />}
                      {stat.buff > 0 && <div style={{ width: `${buffPct}%`, background: '#4a8a4a' }} />}
                    </div>
                  </div>
                  <span className="text-xs font-bold w-5 text-right shrink-0" style={{ color: '#c8a84b' }}>{stat.total}</span>
                  <span className="text-xs w-10 shrink-0" style={{ fontSize: '10px' }}>
                    {stat.gear !== 0 && <span style={{ color: '#9a8040' }}> +{stat.gear}</span>}
                    {stat.buff !== 0 && <span style={{ color: '#4a8a4a' }}> +{stat.buff}</span>}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Equipment slot mini-cards */}
          <div className="pt-3" style={{ borderTop: '1px solid #2a1f10' }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.map(slot => (
                <Link key={slot.key} href="/equipment" style={{ textDecoration: 'none' }}
                  title={slot.item ? slot.item.name : `${slot.label} — empty`}>
                  <div className="flex flex-col items-center gap-1 p-2 rounded"
                    style={{
                      background: slot.item ? '#1a1610' : '#0d0d0d',
                      border: `1px solid ${slot.item ? '#3d2e1e' : '#1a1410'}`,
                      minHeight: '56px',
                      justifyContent: 'center',
                    }}>
                    <span className="text-base leading-none">{slot.item ? slot.item.emoji : slot.emoji}</span>
                    <span style={{
                      fontSize: '9px',
                      color: slot.item ? '#8a7a5a' : '#2a1f10',
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

          {/* Active buffs */}
          {hasBuffs && (
            <div className="mt-3 flex flex-wrap gap-2">
              {buffs.map((b, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded"
                  style={{ background: '#1a3a1a', color: '#6abf6a', border: '1px solid #2d6e2d' }}>
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
