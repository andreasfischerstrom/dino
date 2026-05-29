'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GearTemplate, GearSlot, GEAR_SLOTS } from '@/lib/game-data'
import { Icon } from '@iconify/react'

const SLOT_IMAGES: Record<GearSlot, string> = {
  jaws:      '/images/equipment/fang.png',
  claws:     '/images/equipment/claw.png',
  body:      '/images/equipment/armour.png',
  head:      '/images/equipment/head.png',
  tail:      '/images/equipment/tail.png',
  accessory: '/images/equipment/accessory.png',
}

interface Props {
  character: Record<string, unknown>
  gear: GearTemplate[]
  inventory: { gear_id: string; equipped: boolean }[]
  shopName: string
}

export default function EquipmentClient({ character, gear, inventory, shopName }: Props) {
  const [equippedIds, setEquippedIds] = useState<string[]>(
    inventory.filter(i => i.equipped).map(i => i.gear_id)
  )
  const [ownedIds, setOwnedIds] = useState<string[]>(inventory.map(i => i.gear_id))
  const [loading, setLoading] = useState<string | null>(null)
  const [selling, setSelling] = useState<string | null>(null)
  const [bones, setBones] = useState(character.bones as number)
  const [error, setError] = useState('')
  const [openSlot, setOpenSlot] = useState<GearSlot | null>(null)

  function equippedInSlot(slot: GearSlot): GearTemplate | null {
    const id = equippedIds.find(id => gear.find(g => g.id === id)?.slot === slot)
    return id ? gear.find(g => g.id === id) ?? null : null
  }

  function ownedInSlot(slot: GearSlot): GearTemplate[] {
    return gear.filter(g => g.slot === slot && ownedIds.includes(g.id))
  }

  async function equip(gearId: string) {
    setLoading(gearId); setError('')
    const item = gear.find(g => g.id === gearId)!
    const sameSlotEquipped = equippedIds.filter(id => gear.find(g => g.id === id)?.slot === item.slot)
    const isEquipped = equippedIds.includes(gearId)

    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId, equip: !isEquipped }),
    })
    if (!res.ok) { const j = await res.json(); setError(j.error); setLoading(null); return }

    if (isEquipped) {
      setEquippedIds(ids => ids.filter(id => id !== gearId))
    } else {
      setEquippedIds(ids => [...ids.filter(id => !sameSlotEquipped.includes(id)), gearId])
    }
    setLoading(null)
    setOpenSlot(null)
  }

  async function sellItem(gearId: string) {
    setSelling(gearId); setError('')
    const res = await fetch('/api/shop/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setSelling(null); return }
    setOwnedIds(ids => ids.filter(id => id !== gearId))
    setEquippedIds(ids => ids.filter(id => id !== gearId))
    setBones(b => b + json.sellPrice)
    setSelling(null)
    setOpenSlot(null)
  }

  const charLevel = character.level as number

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl font-bold" style={{ color: '#c8a84b' }}>Equipment</h1>
        <span className="ml-auto text-sm font-bold flex items-center gap-1" style={{ color: '#c8a84b' }}><Icon icon="ph:bone-fill" width={14} height={14} /> {bones}</span>
      </div>
      <p className="text-sm mb-6" style={{ color: '#a08050' }}>
        Six slots. One item each. Click a slot to swap what's equipped.
        Buy more gear at <Link href="/shop" style={{ color: '#c8a84b' }}>{shopName}</Link>.
      </p>

      {error && <p className="mb-4 text-sm" style={{ color: '#bf4040' }}>{error}</p>}

      {/* Equipment slots grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {GEAR_SLOTS.map(slotDef => {
          const equipped = equippedInSlot(slotDef.key)
          const owned = ownedInSlot(slotDef.key)
          const isOpen = openSlot === slotDef.key
          const hasPending = owned.length > 0

          return (
            <div key={slotDef.key}>
              {/* Slot card */}
              <button
                className="w-full text-left transition-all relative overflow-hidden rounded"
                style={{
                  border: `1px solid ${equipped ? '#c8a84b' : hasPending ? '#5a4a3a' : '#2a1f10'}`,
                  borderTop: `2px solid ${equipped ? '#c8a84b' : hasPending ? '#6a5a3a' : '#2a1f10'}`,
                  background: '#0a0806',
                  cursor: hasPending ? 'pointer' : 'default',
                  padding: '0.75rem',
                }}
                onClick={() => hasPending && setOpenSlot(isOpen ? null : slotDef.key)}
              >
                {/* Category image background */}
                <div className="absolute inset-0 bg-center bg-cover" style={{
                  backgroundImage: `url(${SLOT_IMAGES[slotDef.key]})`,
                  opacity: equipped ? 0.18 : 0.08,
                }} />
                {/* Dark gradient so text stays readable */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, rgba(10,8,6,0.6) 0%, rgba(10,8,6,0.3) 100%)',
                }} />
                {/* Content */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={SLOT_IMAGES[slotDef.key]} alt={slotDef.label}
                      className="w-6 h-6 rounded object-cover"
                      style={{ opacity: 0.7, border: '1px solid #3a2810' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{
                      color: equipped ? '#c8a84b' : '#a08050',
                      fontFamily: 'var(--font-cinzel, Georgia)',
                      letterSpacing: '0.08em',
                    }}>
                      {slotDef.label}
                    </span>
                    {hasPending && !isOpen && (
                      <span className="ml-auto text-xs" style={{ color: '#a08050' }}>▾</span>
                    )}
                    {isOpen && (
                      <span className="ml-auto text-xs" style={{ color: '#a08050' }}>▴</span>
                    )}
                  </div>
                  {equipped ? (
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{equipped.emoji} {equipped.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(equipped.statBonus).map(([k, v]) => (
                          <span key={k} className="text-xs px-1 py-0.5 rounded"
                            style={{ background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a', color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a' }}>
                            {(v as number) > 0 ? '+' : ''}{v} {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: '#3d2e1e' }}>
                      {hasPending ? 'Nothing equipped — tap to choose' : 'Empty — buy from smithy'}
                    </p>
                  )}
                </div>
              </button>

              {/* Inline picker */}
              {isOpen && (
                <div className="mt-1 rounded-lg overflow-hidden" style={{ border: '1px solid #3d2e1e', background: '#0a0806' }}>
                  {/* Unequip option if something is equipped */}
                  {equipped && (
                    <button
                      className="w-full text-left px-4 py-3 text-sm transition-colors"
                      style={{ borderBottom: '1px solid #1a1410', color: '#a08050' }}
                      disabled={loading === 'unequip'}
                      onClick={() => equip(equipped.id)}>
                      {loading === equipped.id ? '...' : '✕ Unequip'}
                    </button>
                  )}
                  {owned.map(item => {
                    const isEquipped = equippedIds.includes(item.id)
                    const sellPrice = Math.max(1, Math.floor(item.price * 0.25))
                    return (
                      <div key={item.id} style={{ borderBottom: '1px solid #1a1410', background: isEquipped ? '#1a1610' : 'transparent' }}>
                        <button
                          className="w-full text-left px-4 pt-3 pb-2 transition-colors"
                          disabled={loading === item.id}
                          onClick={() => !isEquipped && equip(item.id)}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.emoji}</span>
                            <div className="flex-1">
                              <p className="font-bold text-sm" style={{ color: isEquipped ? '#c8a84b' : '#e8d5b0' }}>
                                {item.name}
                                {isEquipped && <span className="ml-2 text-xs" style={{ color: '#c8a84b' }}>✓ equipped</span>}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {Object.entries(item.statBonus).map(([k, v]) => (
                                  <span key={k} className="text-xs px-1 py-0.5 rounded"
                                    style={{ background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a', color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a' }}>
                                    {(v as number) > 0 ? '+' : ''}{v} {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {loading === item.id && <span className="text-xs" style={{ color: '#a08050' }}>...</span>}
                          </div>
                        </button>
                        <div className="px-4 pb-2">
                          <button
                            className="text-xs px-3 py-2.5 rounded"
                            style={{ background: '#1a0a0a', color: '#a06050', border: '1px solid #3a1a14' }}
                            disabled={selling === item.id}
                            onClick={() => sellItem(item.id)}>
                            {selling === item.id ? 'Selling...' : <span className="flex items-center gap-1">Sell for {sellPrice} <Icon icon="ph:bone-fill" width={14} height={14} /></span>}
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
      </div>

      {/* Total gear bonus summary */}
      {equippedIds.length > 0 && (() => {
        const totals: Record<string, number> = {}
        equippedIds.forEach(id => {
          const item = gear.find(g => g.id === id)
          if (!item) return
          Object.entries(item.statBonus).forEach(([k, v]) => {
            totals[k] = (totals[k] || 0) + (v as number)
          })
        })
        return (
          <div className="panel">
            <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#a08050' }}>Total Gear Bonus</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totals).filter(([, v]) => v !== 0).map(([k, v]) => (
                <span key={k} className="text-sm px-2 py-0.5 rounded font-bold"
                  style={{ background: v > 0 ? '#1a3a1a' : '#3a1a1a', color: v > 0 ? '#6abf6a' : '#bf6a6a' }}>
                  {v > 0 ? '+' : ''}{v} {k}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      <div className="mt-6 text-center">
        <Link href="/shop" className="btn-ghost text-sm">🔨 Visit {shopName} to buy more gear</Link>
      </div>
    </div>
  )
}
