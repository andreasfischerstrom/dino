'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TownDefinition } from '@/lib/game-data'

interface Props {
  towns: TownDefinition[]
  currentTown: number
  characterLevel: number
}

function ArrivalScreen({ town, onEnter }: { town: TownDefinition; onEnter: () => void }) {
  const [bannerFailed, setBannerFailed] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.6s ease-out',
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Banner image */}
      {!bannerFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={town.banner}
          alt={town.name}
          onError={() => setBannerFailed(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.45,
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '0 24px', maxWidth: '560px',
      }}>
        <p className="text-sm mb-4" style={{
          color: '#7a6040',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          You have arrived
        </p>

        <h1 style={{
          fontFamily: 'var(--font-cinzel-deco, var(--font-cinzel, Georgia))',
          color: '#d4a843',
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textShadow: '0 0 40px rgba(212,168,67,0.4)',
          marginBottom: '8px',
          lineHeight: 1.1,
        }}>
          {town.name}
        </h1>

        <p className="text-sm mb-6" style={{
          color: '#8a7050',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {town.subtitle}
        </p>

        <p className="text-sm mb-10 leading-relaxed" style={{
          color: '#9a8060',
          fontStyle: 'italic',
          maxWidth: '400px',
        }}>
          "{town.flavor}"
        </p>

        <button
          onClick={onEnter}
          style={{
            background: 'rgba(212,168,67,0.08)',
            border: '1px solid rgba(212,168,67,0.4)',
            color: '#d4a843',
            fontFamily: 'var(--font-cinzel, Georgia)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '13px',
            padding: '12px 36px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Enter {town.name}
        </button>
      </div>
    </div>
  )
}

export default function MapClient({ towns, currentTown, characterLevel }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<TownDefinition | null>(
    towns.find(t => t.id === currentTown) ?? null
  )
  const [traveling, setTraveling] = useState(false)
  const [arrived, setArrived] = useState<TownDefinition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  async function travel(town: TownDefinition) {
    if (town.id === currentTown || traveling) return
    setTraveling(true)
    setError(null)
    const res = await fetch('/api/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ townId: town.id }),
    })
    if (res.ok) {
      setArrived(town)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Travel failed')
      setTraveling(false)
    }
  }

  function enterTown() {
    router.push('/town')
    router.refresh()
  }

  return (
    <>
      {arrived && <ArrivalScreen town={arrived} onEnter={enterTown} />}

      <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{
            fontFamily: 'var(--font-cinzel, Georgia)',
            color: '#d4a843',
            letterSpacing: '0.06em',
          }}>
            World Map
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6a5840', fontStyle: 'italic' }}>
            You are in <span style={{ color: '#a08050' }}>
              {towns.find(t => t.id === currentTown)?.name ?? 'Unknown'}
            </span>
          </p>
        </div>

        {/* Map container */}
        <div className="relative w-full rounded-lg overflow-hidden mb-6" style={{
          border: '1px solid #3a2a18',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          aspectRatio: '16/9',
          background: '#0e0a06',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/world-map.png"
            alt="World map"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />

          {imgFailed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 30% 70%, #1a1206 0%, #0a0806 60%, #050403 100%)',
            }}>
              <p className="text-xs" style={{ color: '#3a2a18', fontStyle: 'italic' }}>
                world-map.png not found — place your map at /public/images/world-map.png
              </p>
            </div>
          )}

          {/* Town nodes */}
          {towns.map(town => {
            const unlocked = characterLevel >= town.levelReq
            const isCurrent = town.id === currentTown
            const isSelected = selected?.id === town.id

            return (
              <button
                key={town.id}
                onClick={() => setSelected(town)}
                style={{
                  position: 'absolute',
                  left: `${town.mapPosition.x}%`,
                  top: `${town.mapPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  zIndex: 10,
                }}
              >
                <div style={{
                  width: isSelected ? '44px' : '36px',
                  height: isSelected ? '44px' : '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSelected ? '20px' : '16px',
                  background: isCurrent
                    ? 'rgba(212,168,67,0.25)'
                    : isSelected
                      ? 'rgba(160,128,80,0.2)'
                      : unlocked
                        ? 'rgba(30,22,14,0.85)'
                        : 'rgba(20,15,10,0.85)',
                  border: isCurrent
                    ? '2px solid #d4a843'
                    : isSelected
                      ? '2px solid #a08050'
                      : unlocked
                        ? '1px solid #4a3620'
                        : '1px solid #2a1e10',
                  boxShadow: isCurrent
                    ? '0 0 12px rgba(212,168,67,0.4)'
                    : isSelected
                      ? '0 0 8px rgba(160,128,80,0.3)'
                      : 'none',
                  opacity: unlocked ? 1 : 0.5,
                  transition: 'all 0.15s',
                  filter: unlocked ? 'none' : 'grayscale(0.6)',
                }}>
                  {unlocked ? town.keeperEmoji : '🔒'}
                </div>

                <div style={{
                  background: 'rgba(8,6,4,0.85)',
                  border: `1px solid ${isCurrent ? '#4a3620' : '#2a1e10'}`,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-cinzel, Georgia)',
                    letterSpacing: '0.05em',
                    color: isCurrent ? '#d4a843' : unlocked ? '#a08050' : '#5a4030',
                    textTransform: 'uppercase',
                  }}>
                    {town.name}
                  </span>
                  {isCurrent && (
                    <span style={{ fontSize: '8px', color: '#d4a843', marginLeft: '4px' }}>●</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="panel" style={{
            borderTop: `2px solid ${selected.id === currentTown ? '#6a5020' : '#3a2a18'}`,
          }}>
            <div className="flex items-start gap-4">
              <div style={{
                fontSize: '36px', lineHeight: 1, flexShrink: 0,
                filter: characterLevel < selected.levelReq ? 'grayscale(0.8)' : 'none',
              }}>
                {selected.keeperEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-base font-bold" style={{
                    fontFamily: 'var(--font-cinzel, Georgia)',
                    color: '#d4a843', letterSpacing: '0.04em',
                  }}>
                    {selected.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    background: '#1a1208', border: '1px solid #3a2a14', color: '#7a6040',
                  }}>
                    {selected.subtitle}
                  </span>
                  {selected.id === currentTown && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.3)',
                      color: '#d4a843',
                    }}>
                      Current location
                    </span>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: '#7a6848', fontStyle: 'italic' }}>
                  {selected.flavor}
                </p>
                <p className="text-sm mb-3" style={{ color: '#9a8a70', lineHeight: '1.6' }}>
                  {selected.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs" style={{ color: '#6a5840' }}>Stat focus:</span>
                  {selected.statFocus.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded capitalize" style={{
                      background: '#1a1208', border: '1px solid #3a2a14', color: '#a08858',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>

                {characterLevel < selected.levelReq ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#7a5030' }}>
                      🔒 Requires level {selected.levelReq}
                    </span>
                    <span className="text-xs" style={{ color: '#4a3828' }}>
                      ({selected.levelReq - characterLevel} level{selected.levelReq - characterLevel !== 1 ? 's' : ''} away)
                    </span>
                  </div>
                ) : selected.id === currentTown ? (
                  <span className="text-sm" style={{ color: '#6a5840', fontStyle: 'italic' }}>
                    You are here.
                  </span>
                ) : (
                  <div>
                    {error && <p className="text-xs mb-2" style={{ color: '#c06060' }}>{error}</p>}
                    <button
                      onClick={() => travel(selected)}
                      disabled={traveling}
                      className="text-sm px-5 py-2 rounded"
                      style={{
                        background: traveling ? '#1a1208' : 'rgba(212,168,67,0.08)',
                        border: `1px solid ${traveling ? '#3a2a14' : 'rgba(212,168,67,0.3)'}`,
                        color: traveling ? '#5a4828' : '#d4a843',
                        fontFamily: 'var(--font-cinzel, Georgia)',
                        letterSpacing: '0.04em',
                        cursor: traveling ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {traveling ? 'Travelling…' : `Travel to ${selected.name}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Towns list */}
        <div className="mt-4 space-y-2">
          {towns.map(town => {
            const unlocked = characterLevel >= town.levelReq
            return (
              <button
                key={town.id}
                onClick={() => setSelected(town)}
                className="w-full text-left"
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{
                  background: selected?.id === town.id ? '#181410' : 'transparent',
                  border: `1px solid ${selected?.id === town.id ? '#3a2a18' : '#1e1810'}`,
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '18px', opacity: unlocked ? 1 : 0.4 }}>
                    {unlocked ? town.keeperEmoji : '🔒'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{
                        color: unlocked ? '#c8b080' : '#4a3828',
                        fontFamily: 'var(--font-cinzel, Georgia)',
                      }}>
                        {town.name}
                      </span>
                      {town.id === currentTown && (
                        <span style={{ fontSize: '8px', color: '#d4a843' }}>●</span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: '#5a4830' }}>
                      {unlocked ? town.subtitle : `Unlocks at level ${town.levelReq}`}
                    </span>
                  </div>
                  <span style={{ color: '#4a3828', fontSize: '12px' }}>→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
