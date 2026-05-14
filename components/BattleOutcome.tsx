'use client'
import { useState, useEffect } from 'react'

interface Props {
  won: boolean
  survived: boolean
  fighterName: string
  fighterImage: string
  hpBefore: number
  hpAfter: number
  maxHp: number
  xpBefore: number
  xpAfter: number
  xpForNextLevel: number
  bonesBefore: number
  bonesAfter: number
  loot?: string[]
  leveledUp: boolean
  onContinue: () => void
}

function useCountTo(from: number, to: number, delayMs: number, durationMs = 900) {
  const [value, setValue] = useState(from)
  useEffect(() => {
    setValue(from)
    const timeout = setTimeout(() => {
      const start = performance.now()
      function step(now: number) {
        const t = Math.min((now - start) / durationMs, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setValue(Math.round(from + (to - from) * eased))
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delayMs)
    return () => clearTimeout(timeout)
  }, [from, to, delayMs, durationMs])
  return value
}

function isImageUrl(s: string) {
  return s.startsWith('http') || s.startsWith('/')
}

export default function BattleOutcome({
  won, survived, fighterName, fighterImage,
  hpBefore, hpAfter, maxHp,
  xpBefore, xpAfter, xpForNextLevel,
  bonesBefore, bonesAfter,
  loot = [], leveledUp, onContinue,
}: Props) {
  const [showStats, setShowStats] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 600)
    const t2 = setTimeout(() => setShowButton(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const displayedHp    = useCountTo(hpBefore,    hpAfter,    700)
  const displayedXp    = useCountTo(xpBefore,    xpAfter,    1100)
  const displayedBones = useCountTo(bonesBefore, bonesAfter, 1500)

  const hpPctBefore = Math.round((hpBefore / maxHp) * 100)
  const hpPctAfter  = Math.round((hpAfter  / maxHp) * 100)
  const xpPctBefore = Math.min(100, Math.round((xpBefore / xpForNextLevel) * 100))
  const xpPctAfter  = Math.min(100, Math.round((xpAfter  / xpForNextLevel) * 100))

  const bonusDelta = bonesAfter - bonesBefore
  const xpDelta    = xpAfter - xpBefore
  const hpDelta    = hpAfter - hpBefore

  const headingColor = won ? '#d4a843' : (survived ? '#7a6a4a' : '#9b1818')
  const headingText  = !survived
    ? `${fighterName} has fallen.`
    : won
    ? `${fighterName} stands victorious!`
    : `${fighterName} retreats, alive.`

  function hpBarColor(pct: number) {
    if (pct > 50) return 'linear-gradient(to bottom, #d03030 0%, #921818 60%, #6a0f0f 100%)'
    if (pct > 25) return 'linear-gradient(to bottom, #d07020 0%, #924010 60%, #6a2808 100%)'
    return 'linear-gradient(to bottom, #ff4444 0%, #cc2020 60%, #991010 100%)'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center">
      <div className="mb-4 fade-in" style={{ filter: survived ? 'none' : 'grayscale(80%) brightness(0.5)' }}>
        {isImageUrl(fighterImage)
          ? <img src={fighterImage} alt={fighterName}
              className="w-28 h-28 rounded-full object-cover mx-auto"
              style={{
                border: `3px solid ${headingColor}`,
                boxShadow: won ? `0 0 28px ${headingColor}55, 0 4px 12px rgba(0,0,0,0.8)` : '0 4px 12px rgba(0,0,0,0.8)',
              }} />
          : <div className="text-8xl leading-none"
              style={{ filter: won ? 'drop-shadow(0 0 14px #d4a84388)' : 'none' }}>
              {fighterImage}
            </div>
        }
      </div>

      <h2 className="text-2xl font-bold mb-6 fade-in page-title" style={{ color: headingColor }}>
        {headingText}
      </h2>

      {showStats && (
        <div className="w-full panel space-y-5 mb-6 fade-in text-left" style={{ borderTop: '2px solid #5a4028' }}>

          {/* HP */}
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#a08050' }}>
              <span style={{ color: '#8b1515' }}>❤ HP</span>
              <span style={{ color: hpDelta >= 0 ? '#5abf6a' : '#bf5a5a' }}>
                {displayedHp}/{maxHp}
                {showButton && hpDelta !== 0 && (
                  <span className="ml-1 font-bold">({hpDelta > 0 ? '+' : ''}{hpDelta})</span>
                )}
              </span>
            </div>
            <div className="hud-bar" style={{ flex: 'none', width: '100%' }}>
              <div style={{
                height: '100%',
                width: `${showStats ? hpPctAfter : hpPctBefore}%`,
                background: hpBarColor(hpPctAfter),
                borderRadius: '2px',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
              }} />
            </div>
          </div>

          {/* XP */}
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#a08050' }}>
              <span style={{ color: '#267a38' }}>✦ XP{leveledUp ? ' — LEVEL UP! 🎉' : ''}</span>
              <span style={{ color: '#5abf6a' }}>
                {displayedXp}/{xpForNextLevel}
                {showButton && xpDelta > 0 && <span className="ml-1 font-bold">(+{xpDelta})</span>}
              </span>
            </div>
            <div className="hud-bar" style={{ flex: 'none', width: '100%' }}>
              <div style={{
                height: '100%',
                width: `${showStats ? xpPctAfter : xpPctBefore}%`,
                background: 'linear-gradient(to bottom, #38b050 0%, #267a38 60%, #164820 100%)',
                borderRadius: '2px',
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: 'inset 0 1px 0 rgba(150,255,150,0.2)',
              }} />
            </div>
          </div>

          {/* Bones */}
          <div className="flex justify-between text-sm items-center">
            <span style={{ color: '#a08050' }}>🦴 Bones</span>
            <span className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
              {displayedBones}
              {showButton && bonusDelta !== 0 && (
                <span className="ml-1 text-xs" style={{ color: bonusDelta > 0 ? '#5abf6a' : '#bf5a5a' }}>
                  ({bonusDelta > 0 ? '+' : ''}{bonusDelta})
                </span>
              )}
            </span>
          </div>

          {loot.length > 0 && showButton && (
            <div className="fade-in pt-3" style={{ borderTop: '1px solid #3a2810' }}>
              <p className="text-xs font-bold mb-1.5" style={{
                color: '#d4a843',
                fontFamily: 'var(--font-cinzel, Georgia)',
                letterSpacing: '0.08em',
              }}>LOOT DROPPED</p>
              <div className="flex flex-wrap gap-1">
                {loot.map((l, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#1e1408', color: '#d4a843', border: '1px solid #5a4020' }}>
                    {l.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showButton && (
        <button className="btn-primary px-8 py-3 text-base fade-in" onClick={onContinue}>
          Back to Town
        </button>
      )}
    </div>
  )
}
