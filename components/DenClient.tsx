'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { TownDefinition, DenTownData, DEN_TIERS } from '@/lib/game-data'

interface Props {
  characterId: string
  characterName: string
  bones: number
  hp: number
  maxHp: number
  kills: number
  currentTown: number
  currentTownDef: TownDefinition
  currentTownData: DenTownData
  denTown: number | null
  denTier: number | null
  denTownDef: TownDefinition | null
  denTownData: DenTownData | null
  denTierName: string | null
  upgradeCost: number | null
  buyCost: number
  sellValue: number
}

export default function DenClient({
  characterName, bones, hp, maxHp, kills,
  currentTown, currentTownDef, currentTownData,
  denTown, denTier, denTownDef, denTownData, denTierName,
  upgradeCost, buyCost, sellValue,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showSellConfirm, setShowSellConfirm] = useState(false)

  const hasDen = !!denTown && !!denTier
  const isHomeTown = denTown === currentTown

  // Which town to display (own den if has one, else current town for purchase)
  const displayTown = hasDen ? denTownDef! : currentTownDef
  const displayData = hasDen ? denTownData! : currentTownData
  const accent = displayData.accentColor
  const glow = displayData.glowColor

  // Trophy skulls — 1 per 5 kills, capped by tier
  const skullCap = denTier === 3 ? 12 : denTier === 2 ? 6 : 3
  const skullCount = hasDen ? Math.min(skullCap, Math.floor(kills / 5)) : 0

  const hpPct = Math.round((hp / maxHp) * 100)

  const flavourLine = (() => {
    if (!hasDen) return null
    if (kills === 0) return 'The marks on the walls were already there. You haven\'t earned yours yet.'
    if (hpPct === 100) return 'You\'ve healed. You don\'t feel ready to leave.'
    if (hpPct < 30) return 'You come back quiet. The den doesn\'t ask questions.'
    if (hpPct < 60) return 'The fire is still going.'
    return `${kills} kills. The walls remember.`
  })()

  async function buy() {
    setLoading('buy'); setError('')
    const res = await fetch('/api/den/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(null); return }
    router.refresh()
    setLoading(null)
  }

  async function upgrade() {
    setLoading('upgrade'); setError('')
    const res = await fetch('/api/den/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ upgrade: true }) })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(null); return }
    router.refresh()
    setLoading(null)
  }

  async function sell() {
    setLoading('sell'); setError('')
    const res = await fetch('/api/den/sell', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(null); return }
    setShowSellConfirm(false)
    router.refresh()
    setLoading(null)
  }

  const activePerks = hasDen && denTownData && denTier
    ? denTownData.activePerksByTier[denTier - 1]
    : []

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">

      {/* Header — town banner darkened */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ border: `1px solid ${accent}44`, boxShadow: `0 4px 32px rgba(0,0,0,0.8), 0 0 40px ${glow}` }}>
        {!hasDen && (
          <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
            <img src={`/images/housing/den${currentTown}.png`} alt={displayTown.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', filter: 'brightness(0.25) saturate(0.6)' }} />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 120%, ${glow} 0%, transparent 70%)` }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <p style={{ fontFamily: 'var(--font-cinzel, Georgia)', color: '#6a5838', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>For Sale</p>
              <p style={{ fontFamily: 'var(--font-cinzel, Georgia)', color: accent, fontSize: 20, fontWeight: 700, letterSpacing: '0.06em' }}>
                {currentTownDef.name}
              </p>
            </div>
          </div>
        )}

        {/* Lair visualization — only when den is owned */}
        {hasDen && denTier && denTown && (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 160 }}>
            <img
              src={`/images/housing/den${denTown}.png`}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.28) saturate(0.6)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${glow} 0%, transparent 60%)`, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-cinzel, Georgia)', color: accent, fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', textShadow: `0 0 24px ${glow}, 0 2px 8px rgba(0,0,0,0.9)` }}>
                {characterName}&apos;s {denTierName}
              </p>
              <p style={{ fontSize: 11, color: '#8a7050', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-cinzel, Georgia)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                {denTownDef!.name}
              </p>
              {skullCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 4 }}>
                  {Array.from({ length: skullCount }).map((_, i) => (
                    <Icon key={i} icon="game-icons:skull" width={14} style={{ color: i < 3 ? accent : '#4a3820', filter: i < 3 ? `drop-shadow(0 0 4px ${accent})` : 'none' }} />
                  ))}
                </div>
              )}
              {kills > 0 && (
                <p style={{ fontSize: 10, color: '#6a5030', fontStyle: 'italic', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: 2 }}>
                  {kills} {kills === 1 ? 'kill' : 'kills'} to your name
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Owned den — perks + flavour + actions */}
      {hasDen && denTownData && denTier && (
        <>
          {/* Flavour text */}
          {flavourLine && (
            <p className="mb-4 text-sm" style={{ color: '#7a6848', fontStyle: 'italic', paddingLeft: 2 }}>{flavourLine}</p>
          )}

          {/* Active perks */}
          <div className="panel mb-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7a6848', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.1em' }}>Active Perks</p>
            <div className="space-y-2">
              {activePerks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#c8b890' }}>
                  <Icon icon="game-icons:laurels" width={14} height={14} style={{ color: accent, flexShrink: 0 }} />
                  {perk}
                </div>
              ))}
            </div>
          </div>

          {/* Not in home town note */}
          {!isHomeTown && (
            <div className="panel mb-4 text-sm" style={{ color: '#7a6848', borderColor: '#2a1e10' }}>
              <span className="flex items-center gap-2">
                <Icon icon="game-icons:cave-entrance" width={14} height={14} style={{ color: '#5a4020' }} />
                Your Den is in {denTownDef!.name}. Regen and Tavern perks apply there. Home defense applies when challenged there.
              </span>
            </div>
          )}

          {/* Upgrade or max */}
          {upgradeCost !== null ? (
            <div className="panel mb-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7a6848', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.1em' }}>
                Upgrade to {DEN_TIERS[denTier]}
              </p>
              <p className="text-xs mb-3" style={{ color: '#5a4830' }}>
                Unlocks: {denTownData.activePerksByTier[denTier][denTownData.activePerksByTier[denTier - 1].length] ?? 'enhanced perks'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1" style={{ color: bones >= upgradeCost ? '#a08050' : '#6a4830' }}>
                  <Icon icon="ph:bone-fill" width={13} height={13} />
                  {upgradeCost.toLocaleString()} bones
                </span>
                <button
                  onClick={upgrade}
                  disabled={bones < upgradeCost || loading === 'upgrade'}
                  className="btn-primary text-sm disabled:opacity-40"
                >
                  {loading === 'upgrade' ? 'Upgrading…' : `Upgrade → ${DEN_TIERS[denTier]}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="panel mb-4 text-sm" style={{ color: '#7a6848', borderColor: '#2a1e10' }}>
              There is nowhere left to upgrade. This place is yours.
            </div>
          )}

          {/* Sell */}
          {!showSellConfirm ? (
            <button onClick={() => setShowSellConfirm(true)} className="text-xs" style={{ color: '#5a3a28', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              Sell this {denTierName} ({sellValue.toLocaleString()} bones)
            </button>
          ) : (
            <div className="panel" style={{ borderColor: '#5a2a1a' }}>
              <p className="text-sm mb-3" style={{ color: '#c07050' }}>
                Sell your {denTierName} in {denTownDef!.name} for {sellValue.toLocaleString()} bones? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={sell} disabled={loading === 'sell'} className="btn-primary text-sm" style={{ background: '#3a1808', borderColor: '#6a2818' }}>
                  {loading === 'sell' ? 'Selling…' : 'Confirm Sale'}
                </button>
                <button onClick={() => setShowSellConfirm(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* No den — purchase view */}
      {!hasDen && (
        <>
          <div className="panel mb-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7a6848', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.1em' }}>
              Perks of Ownership
            </p>
            <div className="space-y-2">
              {currentTownData.allPerks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#8a7858' }}>
                  <Icon icon="game-icons:laurels" width={14} height={14} style={{ color: '#5a4828', flexShrink: 0 }} />
                  {perk}
                </div>
              ))}
            </div>
          </div>

          <div className="panel mb-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Den · {currentTownDef.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a4830' }}>Your first step toward owning this town.</p>
              </div>
              <div className="text-right">
                <p className="text-sm flex items-center gap-1 justify-end" style={{ color: bones >= buyCost ? '#a08050' : '#6a4830' }}>
                  <Icon icon="ph:bone-fill" width={13} height={13} />
                  {buyCost.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: bones >= buyCost ? '#5a9a50' : '#7a3a20' }}>
                  {bones >= buyCost ? 'You can afford this' : `Need ${(buyCost - bones).toLocaleString()} more`}
                </p>
              </div>
            </div>
            <button
              onClick={buy}
              disabled={bones < buyCost || loading === 'buy'}
              className="btn-primary w-full mt-3 disabled:opacity-40"
            >
              {loading === 'buy' ? 'Purchasing…' : `Purchase Den — ${buyCost.toLocaleString()} bones`}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-3 text-sm" style={{ color: '#c05050' }}>{error}</p>}

      <div className="mt-6">
        <Link href="/town" className="btn-ghost text-sm">← Back to town</Link>
      </div>
    </div>
  )
}
