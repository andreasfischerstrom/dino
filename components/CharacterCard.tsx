'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GearSlot, GearTemplate, GEAR_SLOTS, STAT_MAX } from '@/lib/game-data'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@iconify/react'

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
  icon: string
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
  // Inline equipment management (when provided, slots become interactive)
  ownedGear?: GearTemplate[]
  initialEquippedGearIds?: string[]
}

export default function CharacterCard({
  name, image, speciesEmoji, speciesName, level,
  hp, maxHp, xp, xpCurrent, xpForNext, statPoints, characterId,
  kills, wins, losses, bones,
  stats, slots, buffs,
  passiveName, passiveDescription,
  lastRegenAt, regenPerMinute,
  style: styleProp,
  ownedGear,
  initialEquippedGearIds,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [localStatPoints, setLocalStatPoints] = useState(statPoints)
  const [localStats, setLocalStats] = useState(stats)
  const [spending, setSpending] = useState<string | null>(null)
  const [liveHp, setLiveHp] = useState(hp)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  // Inline equipment state
  const [localEquippedIds, setLocalEquippedIds] = useState(initialEquippedGearIds || [])
  const [localOwnedIds, setLocalOwnedIds] = useState(initialEquippedGearIds ? (ownedGear || []).map(g => g.id) : [] as string[])
  const [openEquipSlot, setOpenEquipSlot] = useState<GearSlot | null>(null)
  const [equipLoading, setEquipLoading] = useState<string | null>(null)
  const [sellLoading, setSellLoading] = useState<string | null>(null)
  // Keep liveHp in sync with DB updates via Realtime
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
        if (typeof newHp === 'number') setLiveHp(newHp)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [characterId])

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

  // Inline equipment helpers (only active when ownedGear is provided)
  function equippedInSlot(slotKey: GearSlot): GearTemplate | null {
    if (!ownedGear) return null
    const id = localEquippedIds.find(id => ownedGear.find(g => g.id === id)?.slot === slotKey)
    return id ? ownedGear.find(g => g.id === id) ?? null : null
  }
  function ownedInSlot(slotKey: GearSlot): GearTemplate[] {
    if (!ownedGear) return []
    return ownedGear.filter(g => g.slot === slotKey && localOwnedIds.includes(g.id))
  }
  function recomputeGearStats(newEquippedIds: string[]) {
    const bonus: Record<string, number> = {}
    newEquippedIds.forEach(id => {
      const item = ownedGear?.find(g => g.id === id)
      if (!item) return
      Object.entries(item.statBonus).forEach(([k, v]) => {
        bonus[k] = (bonus[k] || 0) + (v as number)
      })
    })
    setLocalStats(prev => prev.map(s => {
      const g = (bonus[s.key] as number) || 0
      return { ...s, gear: g, total: s.base + g + s.buff }
    }))
  }
  async function sellItem(gearId: string) {
    setSellLoading(gearId)
    const res = await fetch('/api/shop/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId }),
    })
    if (res.ok) {
      setLocalOwnedIds(ids => ids.filter(id => id !== gearId))
      const newEquipped = localEquippedIds.filter(id => id !== gearId)
      setLocalEquippedIds(newEquipped)
      recomputeGearStats(newEquipped)
      setOpenEquipSlot(null)
    }
    setSellLoading(null)
  }

  async function changeEquip(gearId: string) {
    if (!ownedGear) return
    setEquipLoading(gearId)
    const item = ownedGear.find(g => g.id === gearId)!
    const sameSlotIds = localEquippedIds.filter(id => ownedGear.find(g => g.id === id)?.slot === item.slot)
    const isEquipped = localEquippedIds.includes(gearId)
    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId, equip: !isEquipped }),
    })
    if (res.ok) {
      const newEquipped = isEquipped
        ? localEquippedIds.filter(id => id !== gearId)
        : [...localEquippedIds.filter(id => !sameSlotIds.includes(id)), gearId]
      setLocalEquippedIds(newEquipped)
      recomputeGearStats(newEquipped)
      setOpenEquipSlot(null)
    }
    setEquipLoading(null)
  }

  const hasBuffs = buffs.length > 0
  const inlineEquip = !!ownedGear

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
              <Icon icon="game-icons:death-skull" width={14} height={14} /><span>{kills} kills</span>
            </span>
            <span className="flex items-center gap-1" title="Win / Loss record" style={{ color: '#b09060' }}>
              <Icon icon="game-icons:crossed-swords" width={14} height={14} /><span>{wins}W / {losses}L</span>
            </span>
            <span className="flex items-center gap-1" title="Bones — currency used in the shop" style={{ color: '#b09060' }}>
              <Icon icon="ph:bone-fill" width={14} height={14} /><span>{bones} bones</span>
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
            {!inlineEquip && (
              <Link href="/equipment" className="ml-auto text-xs font-bold"
                style={{ color: '#d4a843', textDecoration: 'none', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.04em' }}>
                Equipment →
              </Link>
            )}
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
                    style={{ color: '#a08050', cursor: 'help' }}
                    onMouseEnter={() => setHoveredStat(stat.key)}
                    onMouseLeave={() => setHoveredStat(null)}
                    onClick={() => setHoveredStat(hoveredStat === stat.key ? null : stat.key)}>
                    <span style={{ borderBottom: '1px dashed #4a3820', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Icon icon={stat.icon} width={11} height={11} />
                      {stat.label}
                    </span>
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
                        <strong style={{ color: '#d4a843', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Icon icon={stat.icon} width={13} height={13} />{stat.label}
                        </strong>
                        {stat.description}
                      </span>
                    )}
                  </span>
                  <div className="flex-1 stat-bar">
                    <div style={{ display: 'flex', height: '10px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${basePct}%`, background: '#6a5a3a', transition: 'width 0.3s ease' }} />
                      {stat.gear > 0 && <div style={{ width: `${gearPct}%`, background: '#a88030', transition: 'width 0.3s ease' }} />}
                      {stat.buff > 0 && <div style={{ width: `${buffPct}%`, background: '#3a8a4a', transition: 'width 0.3s ease' }} />}
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

          {/* Equipment section */}
          <div className="pt-3" style={{ borderTop: '1px solid #1e1408' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.08em' }}>
              EQUIPMENT
              {inlineEquip && <span className="ml-2 font-normal" style={{ color: '#4a3820', textTransform: 'none', letterSpacing: 0 }}>tap a slot to equip</span>}
            </p>

            {inlineEquip ? (
              /* Inline equipment management */
              <div className="space-y-1.5">
                {GEAR_SLOTS.map(slotDef => {
                  const equipped = equippedInSlot(slotDef.key)
                  const owned = ownedInSlot(slotDef.key)
                  const isOpen = openEquipSlot === slotDef.key
                  const hasPending = owned.length > 0

                  return (
                    <div key={slotDef.key}>
                      <button
                        className="w-full text-left relative overflow-hidden rounded"
                        style={{
                          border: `1px solid ${equipped ? '#7a5a28' : hasPending ? '#3a2a1a' : '#1e1610'}`,
                          borderLeft: `3px solid ${equipped ? '#c8a84b' : hasPending ? '#5a4a2a' : '#2a1e10'}`,
                          background: isOpen ? '#1a1610' : '#0e0c08',
                          cursor: hasPending ? 'pointer' : 'default',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                        onClick={() => hasPending && setOpenEquipSlot(isOpen ? null : slotDef.key)}
                      >
                        <div className="absolute inset-0 bg-center bg-cover pointer-events-none" style={{
                          backgroundImage: `url(${SLOT_IMAGES[slotDef.key]})`,
                          opacity: equipped ? 0.06 : 0.03,
                        }} />
                        <span className="text-xs shrink-0" style={{ color: '#5a4a30', width: '48px', fontFamily: 'var(--font-cinzel, Georgia)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '9px' }}>
                          {slotDef.label}
                        </span>
                        {equipped ? (
                          <div className="flex-1 flex items-center gap-1.5 min-w-0">
                            <span className="text-sm">{equipped.emoji}</span>
                            <span className="text-xs font-bold truncate" style={{ color: '#c8a84b' }}>{equipped.name}</span>
                            <div className="flex flex-wrap gap-0.5 ml-1">
                              {Object.entries(equipped.statBonus).map(([k, v]) => (
                                <span key={k} className="text-xs px-1 rounded" style={{
                                  background: (v as number) > 0 ? '#0e1e0a' : '#1e0a0a',
                                  color: (v as number) > 0 ? '#5abf6a' : '#bf5a5a',
                                  fontSize: '9px',
                                }}>
                                  {(v as number) > 0 ? '+' : ''}{v} {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="flex-1 text-xs" style={{ color: hasPending ? '#5a4a2a' : '#2a1e10' }}>
                            {hasPending ? 'Nothing equipped — tap to choose' : 'Empty'}
                          </span>
                        )}
                        {hasPending && (
                          <span className="text-xs shrink-0" style={{ color: '#4a3820' }}>{isOpen ? '▴' : '▾'}</span>
                        )}
                      </button>

                      {isOpen && (
                        <div className="rounded-b overflow-hidden" style={{ border: '1px solid #2a1e14', borderTop: 'none', background: '#0a0806' }}>
                          {equipped && (
                            <button
                              className="w-full text-left px-3 py-2.5 text-xs"
                              style={{ borderBottom: '1px solid #1a1410', color: '#8a5a4a', display: 'flex', alignItems: 'center', gap: '6px' }}
                              disabled={equipLoading === equipped.id}
                              onClick={() => changeEquip(equipped.id)}>
                              <Icon icon="lucide:x" width={10} height={10} />
                              {equipLoading === equipped.id ? 'Unequipping…' : `Unequip ${equipped.name}`}
                            </button>
                          )}
                          {owned.map(item => {
                            const isEquipped = localEquippedIds.includes(item.id)
                            const sellPrice = Math.max(1, Math.floor(item.price * 0.25))
                            return (
                              <div key={item.id} style={{ borderBottom: '1px solid #1a1410', background: isEquipped ? '#1a1610' : 'transparent' }}>
                                <button
                                  className="w-full text-left px-3 pt-2.5 pb-1.5 transition-colors"
                                  style={{ cursor: isEquipped ? 'default' : 'pointer' }}
                                  disabled={equipLoading === item.id || isEquipped}
                                  onClick={() => !isEquipped && changeEquip(item.id)}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{item.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold" style={{ color: isEquipped ? '#c8a84b' : '#e8d5b0' }}>
                                          {item.name}
                                        </span>
                                        {isEquipped && <span className="text-xs" style={{ color: '#c8a84b' }}>✓ equipped</span>}
                                        <div className="flex flex-wrap gap-0.5">
                                          {Object.entries(item.statBonus).map(([k, v]) => (
                                            <span key={k} className="text-xs px-1 rounded" style={{
                                              background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a',
                                              color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a',
                                              fontSize: '9px',
                                            }}>
                                              {(v as number) > 0 ? '+' : ''}{v} {k}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    {equipLoading === item.id && <span className="text-xs" style={{ color: '#a08050' }}>…</span>}
                                  </div>
                                </button>
                                <div className="px-3 pb-2">
                                  <button
                                    className="text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
                                    style={{ background: '#1a0a0a', color: '#8a5040', border: '1px solid #3a1a14', cursor: 'pointer' }}
                                    disabled={sellLoading === item.id}
                                    onClick={() => sellItem(item.id)}>
                                    {sellLoading === item.id ? 'Selling…' : <><Icon icon="ph:bone-fill" width={11} height={11} /> Sell for {sellPrice}</>}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="mt-2 text-center">
                  <Link href="/equipment" className="text-xs" style={{ color: '#4a3820', textDecoration: 'none' }}>
                    Sell gear or buy more at the smithy →
                  </Link>
                </div>
              </div>
            ) : (
              /* Read-only slot grid (no ownedGear provided) */
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {slots.map(slot => (
                  <Link key={slot.key} href="/equipment" style={{ textDecoration: 'none' }}
                    title={slot.item ? `${slot.label}: ${slot.item.name}` : `${slot.label} — empty`}>
                    <div className="relative rounded overflow-hidden"
                      style={{ border: '1px solid #2a1e14', minHeight: '64px', background: '#0a0806' }}>
                      <div className="absolute inset-0 bg-center bg-cover" style={{
                        backgroundImage: `url(${SLOT_IMAGES[slot.key]})`,
                        opacity: 0.08,
                      }} />
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
            )}
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
