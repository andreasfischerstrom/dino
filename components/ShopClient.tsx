'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GearTemplate, GEAR_SLOTS, GearSlot } from '@/lib/game-data'

interface Props {
  character: Record<string, unknown>
  gear: GearTemplate[]
  inventory: { gear_id: string; equipped: boolean }[]
}

export default function ShopClient({ character, gear, inventory }: Props) {
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [bones, setBones] = useState(character.bones as number)
  const [ownedIds, setOwnedIds] = useState<string[]>(inventory.map(i => i.gear_id))
  const [equippedIds, setEquippedIds] = useState<string[]>(inventory.filter(i => i.equipped).map(i => i.gear_id))
  const [openSlots, setOpenSlots] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GEAR_SLOTS.map(s => [s.key, true]))
  )
  function toggleSlot(key: string) {
    setOpenSlots(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function buy(gearId: string, price: number) {
    if (bones < price) { setError("You can't afford that. Go fight something."); return }
    setLoading(gearId); setError('')
    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(null); return }
    setBones(b => b - price)
    setOwnedIds(ids => [...ids, gearId])
    setLoading(null)
  }

  async function toggleEquip(gearId: string) {
    setLoading(gearId); setError('')
    const isEquipped = equippedIds.includes(gearId)
    const gearItem = gear.find(g => g.id === gearId)!
    const sameSlotEquipped = equippedIds.filter(id => gear.find(g => g.id === id)?.slot === gearItem.slot)

    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gearId, equip: !isEquipped }),
    })
    if (!res.ok) { setLoading(null); return }
    if (isEquipped) {
      setEquippedIds(ids => ids.filter(id => id !== gearId))
    } else {
      setEquippedIds(ids => [...ids.filter(id => !sameSlotEquipped.includes(id)), gearId])
    }
    setLoading(null)
  }

  const level = character.level as number

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title flex-1">Grubclaw's Smithy</h1>
        <span className="text-sm font-bold shrink-0" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>🦴 {bones}</span>
      </div>
      <p className="text-sm mb-6" style={{ color: '#a08050', fontStyle: 'italic' }}>
        "Quality not guaranteed. Refunds not offered. Grubclaw has three fingers and zero patience."
      </p>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="flex gap-2 mb-4">
        {(['shop', 'inventory'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-btn ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {t === 'shop' ? '🛒 Shop' : '🎒 My Gear'}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div>
          {GEAR_SLOTS.map(slotDef => {
            const slotGear = gear.filter(g => g.slot === slotDef.key)
            const isOpen = openSlots[slotDef.key]
            const ownedCount = slotGear.filter(g => ownedIds.includes(g.id)).length
            const affordableCount = slotGear.filter(g => !ownedIds.includes(g.id) && bones >= g.price && level >= g.levelReq).length
            return (
              <div key={slotDef.key} className="mb-3">
                <button
                  onClick={() => toggleSlot(slotDef.key)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-left transition-colors"
                  style={{
                    background: isOpen ? '#1a1208' : '#120e06',
                    border: '1px solid #3a2810',
                    borderBottom: isOpen ? '1px solid #2a1e0a' : '1px solid #3a2810',
                    borderRadius: isOpen ? '6px 6px 0 0' : '6px',
                  }}>
                  <span className="text-lg">{slotDef.emoji}</span>
                  <span className="font-bold text-sm flex-1" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{slotDef.label}</span>
                  <div className="flex items-center gap-2">
                    {ownedCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>
                        {ownedCount} owned
                      </span>
                    )}
                    {affordableCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a1408', color: '#d4a843', border: '1px solid #6a5020' }}>
                        {affordableCount} available
                      </span>
                    )}
                    <span className="text-xs" style={{ color: '#6a5030' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="rounded-b space-y-px" style={{ background: '#120e06', border: '1px solid #3a2810', borderTop: 'none', padding: '8px' }}>
                    <p className="text-xs mb-2 px-1" style={{ color: '#6a5030', fontStyle: 'italic' }}>{slotDef.description}</p>
                    <div className="space-y-2">
                      {slotGear.map(item => {
                        const owned = ownedIds.includes(item.id)
                        const canAfford = bones >= item.price
                        const meetsLevel = level >= item.levelReq
                        return (
                          <div key={item.id} className="panel row-hover flex items-center gap-4"
                            style={{ opacity: meetsLevel ? 1 : 0.5 }}>
                            <div className="text-3xl w-10 text-center">{item.emoji}</div>
                            <div className="flex-1">
                              <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{item.name}</p>
                              <p className="text-xs mb-1" style={{ color: '#a08050' }}>{item.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(item.statBonus).map(([k, v]) => (
                                  <span key={k} className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ background: (v as number) > 0 ? '#0e2410' : '#2a0e0e', color: (v as number) > 0 ? '#5abf6a' : '#bf5a5a', border: `1px solid ${(v as number) > 0 ? '#2a6428' : '#6a2828'}` }}>
                                    {(v as number) > 0 ? '+' : ''}{v} {k}
                                  </span>
                                ))}
                              </div>
                              {!meetsLevel && <p className="text-xs mt-1" style={{ color: '#9b1818' }}>Requires level {item.levelReq}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold mb-1" style={{ color: '#d4a843' }}>🦴 {item.price}</p>
                              {owned ? (
                                <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>✓ Owned</span>
                              ) : (
                                <button className="btn-primary text-xs px-3 py-1"
                                  disabled={!canAfford || !meetsLevel || loading === item.id}
                                  onClick={() => buy(item.id, item.price)}>
                                  {loading === item.id ? '...' : !canAfford ? 'No bones' : 'Buy'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'inventory' && (
        <div>
          {ownedIds.length === 0 && (
            <p className="text-sm" style={{ color: '#a08050', fontStyle: 'italic' }}>
              You own nothing. This is both a financial and existential observation.
            </p>
          )}
          {GEAR_SLOTS.map(slotDef => {
            const ownedSlotGear = gear.filter(g => g.slot === slotDef.key && ownedIds.includes(g.id))
            if (ownedSlotGear.length === 0) return null
            const isOpen = openSlots[slotDef.key]
            const equippedInSlot = ownedSlotGear.filter(g => equippedIds.includes(g.id)).length
            return (
              <div key={slotDef.key} className="mb-3">
                <button
                  onClick={() => toggleSlot(slotDef.key)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-left transition-colors"
                  style={{
                    background: isOpen ? '#1a1208' : '#120e06',
                    border: '1px solid #3a2810',
                    borderBottom: isOpen ? '1px solid #2a1e0a' : '1px solid #3a2810',
                    borderRadius: isOpen ? '6px 6px 0 0' : '6px',
                  }}>
                  <span className="text-lg">{slotDef.emoji}</span>
                  <span className="font-bold text-sm flex-1" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{slotDef.label}</span>
                  <div className="flex items-center gap-2">
                    {equippedInSlot > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a1000', color: '#d4a843', border: '1px solid #6a5020' }}>equipped</span>
                    )}
                    <span className="text-xs" style={{ color: '#6a5030' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isOpen && (
                <div className="rounded-b" style={{ background: '#120e06', border: '1px solid #3a2810', borderTop: 'none', padding: '8px' }}>
                <div className="space-y-2">
                  {ownedSlotGear.map(item => {
                    const isEquipped = equippedIds.includes(item.id)
                    return (
                      <div key={item.id} className="panel row-hover flex items-center gap-4"
                        style={{ borderColor: isEquipped ? '#7a5020' : '#4a3520', borderTop: isEquipped ? '2px solid #d4a843' : undefined }}>
                        <div className="text-3xl w-10 text-center">{item.emoji}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{item.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.statBonus).map(([k, v]) => (
                              <span key={k} className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: (v as number) > 0 ? '#0e2410' : '#2a0e0e', color: (v as number) > 0 ? '#5abf6a' : '#bf5a5a', border: `1px solid ${(v as number) > 0 ? '#2a6428' : '#6a2828'}` }}>
                                {(v as number) > 0 ? '+' : ''}{v} {k}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => toggleEquip(item.id)} disabled={loading === item.id}
                          className={isEquipped ? 'btn-ghost text-xs px-3 py-1' : 'btn-primary text-xs px-3 py-1'}>
                          {loading === item.id ? '...' : isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                      </div>
                    )
                  })}
                </div>
                </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
