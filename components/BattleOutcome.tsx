'use client'
import { useState, useEffect } from 'react'
import { xpForLevel, levelFromXp } from '@/lib/game-data'
import { Icon } from '@iconify/react'

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

function xpPct(xp: number, level: number) {
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  return Math.min(100, Math.max(0, Math.round(((xp - start) / (end - start)) * 100)))
}

export default function BattleOutcome({
  won, survived, fighterName, fighterImage,
  hpBefore, hpAfter, maxHp,
  xpBefore, xpAfter,
  bonesBefore, bonesAfter,
  leveledUp, onContinue,
}: Props) {
  const oldLevel = levelFromXp(xpBefore)
  const newLevel = levelFromXp(xpAfter)
  const newLevelEnd = xpForLevel(newLevel + 1)

  const hpPctBefore = Math.round((hpBefore / maxHp) * 100)
  const hpPctAfter  = Math.round((hpAfter  / maxHp) * 100)
  const xpPctOldStart = xpPct(xpBefore, oldLevel)
  const xpPctNewEnd   = xpPct(xpAfter,  newLevel)

  const [showStats, setShowStats]     = useState(false)
  const [showButton, setShowButton]   = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [hpBarPct, setHpBarPct]       = useState(hpPctBefore)
  const [xpBarPct, setXpBarPct]       = useState(xpPctOldStart)
  const [xpTransition, setXpTransition] = useState(true)
  const [currentXpLevel, setCurrentXpLevel] = useState(oldLevel)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const t = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timers.push(id) }

    t(() => setShowStats(true), 600)
    t(() => setHpBarPct(hpPctAfter), 700)

    if (leveledUp) {
      // Phase 1: fill to 100%
      t(() => { setXpTransition(true); setXpBarPct(100) }, 700)
      // Phase 2: flash the level-up banner
      t(() => setShowLevelUp(true), 1900)
      // Phase 3: reset bar instantly to 0% on new level
      t(() => {
        setXpTransition(false)
        setXpBarPct(0)
        setCurrentXpLevel(newLevel)
      }, 2200)
      // Phase 4: animate up to new XP within new level
      t(() => { setXpTransition(true); setXpBarPct(xpPctNewEnd) }, 2350)
      t(() => setShowButton(true), 3600)
    } else {
      t(() => { setXpTransition(true); setXpBarPct(xpPctNewEnd) }, 700)
      t(() => setShowButton(true), 2800)
    }

    return () => timers.forEach(clearTimeout)
  }, [])

  const displayedHp    = useCountTo(hpBefore,    hpAfter,    700)
  const displayedXp    = useCountTo(xpBefore,    xpAfter,    1100)
  const displayedBones = useCountTo(bonesBefore, bonesAfter, 1500)

  const bonusDelta = bonesAfter - bonesBefore
  const xpDelta    = xpAfter - xpBefore
  const hpDelta    = hpAfter - hpBefore

  const headingColor = won ? '#d4a843' : (survived ? '#a08050' : '#9b1818')
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

  const xpLevelStart = xpForLevel(currentXpLevel)
  const xpLevelEnd   = xpForLevel(currentXpLevel + 1)

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

      {showLevelUp && (
        <div className="fade-in mb-4 px-6 py-3 rounded" style={{
          background: 'linear-gradient(135deg, #2a1e08, #1a1408)',
          border: '1px solid #d4a843',
          boxShadow: '0 0 24px rgba(212,168,67,0.25)',
        }}>
          <p className="font-bold text-lg page-title flex items-center justify-center gap-1" style={{ color: '#d4a843', letterSpacing: '0.12em' }}>
            <Icon icon="game-icons:upgrade" width={12} height={12} style={{ color: '#5abf6a' }} /> LEVEL UP!
          </p>
          <p className="text-sm" style={{ color: '#c8b890' }}>
            {fighterName} reached level {newLevel}
          </p>
        </div>
      )}

      {showStats && (
        <div className="w-full panel space-y-5 mb-6 fade-in text-left" style={{ borderTop: '2px solid #5a4028' }}>

          {/* HP */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
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
                width: `${hpBarPct}%`,
                background: hpBarColor(hpPctAfter),
                borderRadius: '2px',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.25)',
              }} />
            </div>
          </div>

          {/* XP */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: '#267a38' }}>✦ XP — Lv {currentXpLevel}</span>
              <span style={{ color: '#5abf6a' }}>
                {displayedXp - xpLevelStart}/{xpLevelEnd - xpLevelStart}
                {showButton && xpDelta > 0 && <span className="ml-1 font-bold">(+{xpDelta})</span>}
              </span>
            </div>
            <div className="hud-bar" style={{ flex: 'none', width: '100%', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${xpBarPct}%`,
                background: 'linear-gradient(to bottom, #38b050 0%, #267a38 60%, #164820 100%)',
                borderRadius: '2px',
                transition: xpTransition ? 'width 1.1s cubic-bezier(0.4,0,0.2,1)' : 'none',
                boxShadow: showLevelUp && xpBarPct === 100
                  ? 'inset 0 1px 0 rgba(150,255,150,0.2), 0 0 8px rgba(80,200,80,0.5)'
                  : 'inset 0 1px 0 rgba(150,255,150,0.2)',
              }} />
            </div>
          </div>

          {/* Bones */}
          <div className="flex justify-between text-sm items-center">
            <span style={{ color: '#a08050' }} className="flex items-center gap-1"><Icon icon="ph:bone-fill" width={14} height={14} /> Bones</span>
            <span className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
              {displayedBones}
              {showButton && bonusDelta !== 0 && (
                <span className="ml-1 text-xs" style={{ color: bonusDelta > 0 ? '#5abf6a' : '#bf5a5a' }}>
                  ({bonusDelta > 0 ? '+' : ''}{bonusDelta})
                </span>
              )}
            </span>
          </div>

        </div>
      )}

      {showButton && (
        <button className="btn-primary px-8 py-3 text-base fade-in" onClick={onContinue}>
          {survived ? 'Back to Town' : 'View Obituary'}
        </button>
      )}
    </div>
  )
}
