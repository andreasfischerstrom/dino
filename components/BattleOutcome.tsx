'use client'
import { useState, useEffect } from 'react'

interface Props {
  won: boolean
  survived: boolean
  fighterName: string
  fighterImage: string   // emoji or image URL
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

  const headingColor = won ? '#c8a84b' : (survived ? '#8a7a5a' : '#8b2020')
  const headingText  = !survived
    ? `${fighterName} has fallen.`
    : won
    ? `${fighterName} stands victorious!`
    : `${fighterName} retreats, alive.`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center">
      {/* Fighter portrait */}
      <div className="mb-4 fade-in" style={{ filter: survived ? 'none' : 'grayscale(80%) brightness(0.6)' }}>
        {isImageUrl(fighterImage)
          ? <img src={fighterImage} alt={fighterName}
              className="w-28 h-28 rounded-full object-cover mx-auto"
              style={{ border: `3px solid ${headingColor}`, boxShadow: won ? `0 0 24px ${headingColor}66` : 'none' }} />
          : <div className="text-8xl leading-none" style={{ filter: won ? 'drop-shadow(0 0 12px #c8a84b88)' : 'none' }}>
              {fighterImage}
            </div>
        }
      </div>

      <h2 className="text-2xl font-bold mb-6 fade-in" style={{ color: headingColor }}>
        {headingText}
      </h2>

      {/* Animated stat changes */}
      {showStats && (
        <div className="w-full panel space-y-5 mb-6 fade-in text-left">

          {/* HP */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: '#8a7a5a' }}>
              <span>❤️ HP</span>
              <span style={{ color: hpDelta >= 0 ? '#6abf6a' : '#bf6a6a' }}>
                {displayedHp}/{maxHp}
                {showButton && hpDelta !== 0 && (
                  <span className="ml-1 font-bold">({hpDelta > 0 ? '+' : ''}{hpDelta})</span>
                )}
              </span>
            </div>
            <div className="stat-bar">
              <div className="hp-bar-fill" style={{
                width: `${showStats ? hpPctAfter : hpPctBefore}%`,
                background: hpPctAfter > 50 ? '#8b2020' : hpPctAfter > 25 ? '#c8601c' : '#ff3333',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>

          {/* XP */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: '#8a7a5a' }}>
              <span>⭐ XP{leveledUp ? ' — LEVEL UP! 🎉' : ''}</span>
              <span style={{ color: '#6abf6a' }}>
                {displayedXp}/{xpForNextLevel}
                {showButton && xpDelta > 0 && <span className="ml-1 font-bold">(+{xpDelta})</span>}
              </span>
            </div>
            <div className="stat-bar">
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: '#4a7a4a',
                width: `${showStats ? xpPctAfter : xpPctBefore}%`,
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>

          {/* Bones */}
          <div className="flex justify-between text-sm items-center">
            <span style={{ color: '#8a7a5a' }}>🦴 Bones</span>
            <span className="font-bold" style={{ color: '#c8a84b' }}>
              {displayedBones}
              {showButton && bonusDelta !== 0 && (
                <span className="ml-1 text-xs" style={{ color: bonusDelta > 0 ? '#6abf6a' : '#bf6a6a' }}>
                  ({bonusDelta > 0 ? '+' : ''}{bonusDelta})
                </span>
              )}
            </span>
          </div>

          {/* Loot */}
          {loot.length > 0 && showButton && (
            <div className="fade-in pt-2" style={{ borderTop: '1px solid #3d2e1e' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#c8a84b' }}>LOOT DROPPED</p>
              <div className="flex flex-wrap gap-1">
                {loot.map((l, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#2a1f10', color: '#c8a84b', border: '1px solid #c8a84b44' }}>
                    {l.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showButton && (
        <button className="btn-primary px-8 py-3 text-lg fade-in" onClick={onContinue}>
          Back to Town
        </button>
      )}
    </div>
  )
}
