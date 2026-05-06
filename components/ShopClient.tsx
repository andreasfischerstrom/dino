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
    // Unequip same slot first
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl font-bold" style={{ color: '#c8a84b' }}>Grubclaw's Smithy</h1>
      </div>
      <p className="text-sm mb-1" style={{ color: '#5a4a3a' }}>
        "Quality not guaranteed. Refunds not offered. Grubclaw has three fingers and zero patience."
      </p>
      <p className="text-sm mb-6" style={{ color: '#c8a84b' }}>🦴 {bones} bones</p>

      {error && <p className="mb-4 text-sm" style={{ color: '#bf4040' }}>{error}</p>}

      <div className="flex gap-2 mb-4">
        {(['shop', 'inventory'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded text-sm font-bold transition"
            style={{ background: tab === t ? '#c8a84b' : '#1a1410', color: tab === t ? '#0d0d0d' : '#8a7a5a', border: '1px solid #3d2e1e' }}>
            {t === 'shop' ? '🛒 Shop' : '🎒 My Gear'}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div>
          {GEAR_SLOTS.map(slotDef => (
            <div key={slotDef.key} className="mb-6">
              <h2 className="font-bold mb-1" style={{ color: '#8a7a5a' }}>{slotDef.emoji} {slotDef.label}</h2>
              <p className="text-xs mb-3" style={{ color: '#3d2e1e' }}>{slotDef.description}</p>
              <div className="space-y-2">
                {gear.filter(g => g.slot === slotDef.key).map(item => {
                  const owned = ownedIds.includes(item.id)
                  const canAfford = bones >= item.price
                  const meetsLevel = level >= item.levelReq
                  return (
                    <div key={item.id} className="panel flex items-center gap-4"
                      style={{ opacity: meetsLevel ? 1 : 0.5 }}>
                      <div className="text-3xl w-10 text-center">{item.emoji}</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{item.name}</p>
                        <p className="text-xs mb-1" style={{ color: '#5a4a3a' }}>{item.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.statBonus).map(([k, v]) => (
                            <span key={k} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a', color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a' }}>
                              {(v as number) > 0 ? '+' : ''}{v} {k}
                            </span>
                          ))}
                        </div>
                        {!meetsLevel && <p className="text-xs mt-1" style={{ color: '#8b2020' }}>Requires level {item.levelReq}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold mb-1" style={{ color: '#c8a84b' }}>🦴 {item.price}</p>
                        {owned ? (
                          <span className="text-xs" style={{ color: '#2d6e2d' }}>✓ Owned</span>
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
          ))}
        </div>
      )}

      {tab === 'inventory' && (
        <div>
          {ownedIds.length === 0 && <p className="text-sm" style={{ color: '#5a4a3a' }}>You own nothing. This is both a financial and existential observation.</p>}
          {GEAR_SLOTS.map(slotDef => {
            const ownedSlotGear = gear.filter(g => g.slot === slotDef.key && ownedIds.includes(g.id))
            if (ownedSlotGear.length === 0) return null
            return (
              <div key={slotDef.key} className="mb-6">
                <h2 className="font-bold mb-3" style={{ color: '#8a7a5a' }}>{slotDef.emoji} {slotDef.label}</h2>
                <div className="space-y-2">
                  {ownedSlotGear.map(item => {
                    const isEquipped = equippedIds.includes(item.id)
                    return (
                      <div key={item.id} className="panel flex items-center gap-4"
                        style={{ borderColor: isEquipped ? '#c8a84b' : '#3d2e1e' }}>
                        <div className="text-3xl w-10 text-center">{item.emoji}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{item.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.statBonus).map(([k, v]) => (
                              <span key={k} className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a', color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a' }}>
                                {(v as number) > 0 ? '+' : ''}{v} {k}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => toggleEquip(item.id)} disabled={loading === item.id}
                          className={isEquipped ? 'btn-danger text-xs px-3 py-1' : 'btn-primary text-xs px-3 py-1'}>
                          {loading === item.id ? '...' : isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
