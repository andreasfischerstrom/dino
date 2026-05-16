'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GearTemplate, GEAR_SLOTS, GearSlot } from '@/lib/game-data'
import { BlackMarketItem } from '@/lib/black-market'

interface Props {
  character: Record<string, unknown>
  gear: GearTemplate[]
  inventory: { gear_id: string; equipped: boolean }[]
  blackMarketItem: BlackMarketItem
}

export default function ShopClient({ character, gear, inventory, blackMarketItem }: Props) {
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [bones, setBones] = useState(character.bones as number)
  const [ownedIds, setOwnedIds] = useState<string[]>(inventory.map(i => i.gear_id))
  const [equippedIds, setEquippedIds] = useState<string[]>(inventory.filter(i => i.equipped).map(i => i.gear_id))
  const [openSlots, setOpenSlots] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GEAR_SLOTS.map(s => [s.key, false]))
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
  const today = new Date().toISOString().slice(0, 10)
  const alreadyBoughtBM = (character.last_black_market_at as string | null) === today
  const [bmBought, setBmBought] = useState(alreadyBoughtBM)
  const [bmLoading, setBmLoading] = useState(false)

  async function buyBlackMarket() {
    setBmLoading(true); setError('')
    const res = await fetch('/api/shop/buy-black-market', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setBmLoading(false); return }
    setBones(json.newBones)
    setBmBought(true)
    setBmLoading(false)
  }

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

      {/* ── Black Market ── */}
      <div className="mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid #4a1a1a', boxShadow: '0 0 30px rgba(180,40,40,0.06)' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1e0a0a 0%, #140606 100%)', borderBottom: '1px solid #4a1a1a' }}>
          <span>🩸</span>
          <p className="font-bold text-xs tracking-widest uppercase" style={{ color: '#c04040', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.12em' }}>
            Black Market
          </p>
          <span className="ml-auto text-xs" style={{ color: '#5a2020' }}>Refreshes daily · One purchase per day</span>
        </div>
        <div className="p-4" style={{ background: '#0e0707' }}>
          <div className="flex gap-4">
            <div className="text-4xl shrink-0 w-12 h-12 flex items-center justify-center rounded" style={{ background: '#1a0a0a', border: '1px solid #3a1010' }}>
              {blackMarketItem.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5" style={{ color: '#e07070', fontFamily: 'var(--font-cinzel, Georgia)' }}>{blackMarketItem.name}</p>
              <p className="text-xs mb-1.5" style={{ color: '#7a4040' }}>{blackMarketItem.flavor}</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(blackMarketItem.statBonus).map(([k, v]) => (
                  <span key={k} className="text-xs px-1.5 py-0.5 rounded font-bold" style={{
                    background: (v as number) > 0 ? '#0e2410' : '#2a0808',
                    color: (v as number) > 0 ? '#5abf6a' : '#bf5a5a',
                    border: `1px solid ${(v as number) > 0 ? '#2a6428' : '#6a2828'}`,
                  }}>
                    {(v as number) > 0 ? '+' : ''}{v} {k}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#6a4040', fontStyle: 'italic' }}>
                Applies as a buff — consumed on your next fight.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold mb-2" style={{ color: '#d4a843' }}>🦴 {blackMarketItem.price}</p>
              {bmBought ? (
                <span className="text-xs px-2 py-1 rounded" style={{ background: '#1a0a0a', color: '#5a3030', border: '1px solid #3a1818' }}>Purchased</span>
              ) : (
                <button
                  className="text-xs px-3 py-1.5 rounded font-bold transition-colors"
                  disabled={bmLoading || bones < blackMarketItem.price || level < blackMarketItem.levelReq}
                  onClick={buyBlackMarket}
                  style={{
                    background: bones >= blackMarketItem.price && level >= blackMarketItem.levelReq ? '#2a0808' : '#160505',
                    color: bones >= blackMarketItem.price && level >= blackMarketItem.levelReq ? '#e07070' : '#4a2020',
                    border: '1px solid #5a1818',
                  }}>
                  {bmLoading ? '...'
                    : level < blackMarketItem.levelReq ? `Req. lvl ${blackMarketItem.levelReq}`
                    : bones < blackMarketItem.price ? 'No bones'
                    : 'Make a deal'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  <span className="text-xs" style={{ color: '#6a5030' }}>{isOpen ? '▲' : '▼'}</span>
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
                  <span className="text-xs" style={{ color: '#6a5030' }}>{isOpen ? '▲' : '▼'}</span>
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
