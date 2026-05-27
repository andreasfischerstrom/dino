'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GearSlot, STAT_MAX } from '@/lib/game-data'
import { createClient } from '@/lib/supabase/client'

const SLOT_IMAGES: Record<GearSlot, string> = {
  jaws:      '/images/equipment/fang.png',
  claws:     '/images/equipment/claw.png',
  body:      '/images/equipment/armour.png',
  head:      '/images/equipment/head.png',
  tail:      '/images/equipment/tail.png',
  accessory: '/images/equipment/accessory.png',
}

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
  description: string
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
  passiveName?: string
  passiveDescription?: string
  lastRegenAt?: string
  regenPerMinute?: number
  style?: React.CSSProperties
}

export default function CharacterCard({
  name, image, speciesEmoji, speciesName, level,
  hp, maxHp, xp, xpCurrent, xpForNext, statPoints, characterId,
  kills, wins, losses, bones,
  stats, slots, buffs,
  passiveName, passiveDescription,
  lastRegenAt, regenPerMinute,
  style: styleProp,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [localStatPoints, setLocalStatPoints] = useState(statPoints)
  const [localStats, setLocalStats] = useState(stats)
  const [spending, setSpending] = useState<string | null>(null)
  const [hpBase, setHpBase] = useState(hp)
  const [liveHp, setLiveHp] = useState(hp)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const liveHpRef = useRef(hp)
  const router = useRouter()

  // Regen ticker — restarts whenever hpBase changes (e.g. after a remote battle)
  useEffect(() => {
    if (!lastRegenAt || !regenPerMinute || hpBase >= maxHp) return
    const msPerHp = 60000 / regenPerMinute
    const elapsed = Date.now() - new Date(lastRegenAt).getTime()
    const msUntilNext = msPerHp - (elapsed % msPerHp)

    let currentHp = hpBase
    let timeout: ReturnType<typeof setTimeout>

    function tick() {
      currentHp = Math.min(maxHp, currentHp + 1)
      liveHpRef.current = currentHp
      setLiveHp(currentHp)
      if (currentHp < maxHp) timeout = setTimeout(tick, msPerHp)
    }

    timeout = setTimeout(tick, msUntilNext)
    return () => clearTimeout(timeout)
  }, [hpBase, maxHp, lastRegenAt, regenPerMinute])

  // Realtime: when character HP changes on another device, refresh the
  // server component. router.refresh() re-fetches the town page — if a
  // replay is pending it redirects there first; otherwise the new HP
  // comes in via fresh props and the regen ticker restarts correctly.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`char-hp-${characterId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'characters',
        filter: `id=eq.${characterId}`,
      }, (payload) => {
        const newHp = (payload.new as Record<string, unknown>).hp as number
        if (typeof newHp === 'number' && newHp !== liveHpRef.current) {
          router.refresh()
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [characterId, router])

  const hpPct = Math.round((liveHp / maxHp) * 100)
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
      ...styleProp,
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
            <span className="text-xs w-16 text-right tabular-nums shrink-0" style={{ color: '#a08050' }}>{liveHp}/{maxHp}</span>
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

        <div className="shrink-0 flex flex-col items-center gap-1">
          {localStatPoints > 0 && !expanded && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded animate-pulse" style={{
              background: 'linear-gradient(to bottom, #1a3a10, #0e2408)',
              color: '#5abf6a',
              border: '1px solid #3a7a28',
              fontFamily: 'var(--font-cinzel, Georgia)',
              letterSpacing: '0.03em',
              boxShadow: '0 0 8px rgba(90,191,106,0.3)',
            }}>
              +{localStatPoints} pts
            </span>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors btn-ghost"
            style={{ color: localStatPoints > 0 && !expanded ? '#5abf6a' : '#a08050', border: 'none', padding: '0.25rem 0.5rem' }}
            title={expanded ? 'Collapse' : 'Show stats & equipment'}>
            <span className="text-xs" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-cinzel, Georgia)' }}>
              {expanded ? 'less' : 'stats'}
            </span>
            <span style={{ fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
          </button>
        </div>
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
              Equipment →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
            {localStats.map(stat => {
              const barMax = STAT_MAX
              const basePct = Math.min(100, (stat.base / barMax) * 100)
              const gearPct = Math.min(100 - basePct, (stat.gear / barMax) * 100)
              const buffPct = Math.min(100 - basePct - gearPct, (stat.buff / barMax) * 100)
              return (
                <div key={stat.key} className="flex items-center gap-2">
                  <span
                    className="text-xs w-20 shrink-0 relative select-none"
                    style={{ color: '#a08050', cursor: 'default' }}
                    onMouseEnter={() => setHoveredStat(stat.key)}
                    onMouseLeave={() => setHoveredStat(null)}
                    onClick={() => setHoveredStat(hoveredStat === stat.key ? null : stat.key)}>
                    {stat.label}
                    {hoveredStat === stat.key && (
                      <span className="absolute left-0 z-50 pointer-events-none"
                        style={{
                          bottom: '100%', marginBottom: '6px',
                          background: '#1a1408', border: '1px solid #5a4020',
                          borderRadius: '5px', padding: '6px 10px',
                          color: '#c8a870', fontSize: '11px', lineHeight: '1.5',
                          whiteSpace: 'normal', width: '200px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                        }}>
                        <strong style={{ color: '#d4a843', display: 'block', marginBottom: '2px' }}>{stat.emoji} {stat.label}</strong>
                        {stat.description}
                      </span>
                    )}
                  </span>
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
                      className="shrink-0 rounded font-bold flex items-center justify-center"
                      style={{ width: '44px', height: '44px', background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428', fontSize: '14px', boxShadow: '0 0 6px rgba(90,191,106,0.2)' }}>
                      {spending === stat.key ? '…' : '+'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {passiveName && (
            <div className="mb-3 px-2.5 py-2 rounded text-xs" style={{
              background: 'rgba(212,168,67,0.06)',
              border: '1px solid rgba(212,168,67,0.18)',
            }}>
              <span style={{ color: '#d4a843', fontWeight: 'bold' }}>⚡ Passive: {passiveName}</span>
              {passiveDescription && <span style={{ color: '#8a7040' }}> — {passiveDescription}</span>}
            </div>
          )}

          <div className="pt-3" style={{ borderTop: '1px solid #1e1408' }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slots.map(slot => (
                <Link key={slot.key} href="/equipment" style={{ textDecoration: 'none' }}
                  title={slot.item ? `${slot.label}: ${slot.item.name}` : `${slot.label} — empty`}>
                  <div className="relative rounded overflow-hidden"
                    style={{ border: '1px solid #2a1e14', minHeight: '64px', background: '#0a0806' }}>
                    {/* Category image background */}
                    <div className="absolute inset-0 bg-center bg-cover" style={{
                      backgroundImage: `url(${SLOT_IMAGES[slot.key]})`,
                      opacity: 0.08,
                    }} />
                    {/* Content */}
                    <div className="relative flex flex-col items-center justify-center gap-0.5 p-1.5" style={{ minHeight: '64px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: '#5a4a30',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'var(--font-cinzel, Georgia)',
                        lineHeight: 1,
                      }}>
                        {slot.label}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        color: slot.item ? '#c8a860' : '#3a2a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                        textAlign: 'center',
                        width: '100%',
                      }}>
                        {slot.item ? slot.item.name : 'Empty'}
                      </span>
                    </div>
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
