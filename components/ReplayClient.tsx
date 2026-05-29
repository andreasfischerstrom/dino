'use client'
import { useState } from 'react'
import BattleViewer from './BattleViewer'

interface CharacterSnapshot {
  hp: number; maxHp: number; xp: number; xpForNextLevel: number
  bones: number; image: string; name: string; level: number; statPoints: number
}

interface Props {
  battleId: string
  events: unknown[]
  battleResult: Record<string, unknown>
  viewerSnapshot: CharacterSnapshot
  opponentName: string
  opponentImage: string
  userSide: 'a' | 'b'
  viewerSurvived: boolean
  opponentWasChallenger: boolean  // for the intro copy
}

export default function ReplayClient({
  battleId, events, battleResult, viewerSnapshot,
  opponentName, opponentImage, userSide, viewerSurvived, opponentWasChallenger,
}: Props) {
  const [watching, setWatching] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  // Always mark seen via API before navigating — ensures the DB is updated before
  // the town page renders server-side and checks for unseen battles.
  async function markSeenAndGo() {
    try {
      await fetch('/api/battle/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId }),
      })
    } catch {}
    window.location.href = viewerSurvived ? '/town' : '/obituary'
  }

  function dismiss() {
    setDismissing(true)
    markSeenAndGo()
  }

  const cinzel = 'var(--font-cinzel, Georgia)'

  if (watching) {
    // Normalize so BattleViewer always sees the viewer as fighter A.
    // When userSide='b', swap hpA/hpB and attacker in events, and flip the result winner.
    type RawEvent = { hpA: number; hpB: number; maxHpA: number; maxHpB: number; attacker?: 'a' | 'b'; [k: string]: unknown }
    const normalizedEvents = userSide === 'b'
      ? (events as RawEvent[]).map(e => ({
          ...e,
          hpA: e.hpB, hpB: e.hpA,
          maxHpA: e.maxHpB, maxHpB: e.maxHpA,
          attacker: e.attacker === 'a' ? 'b' : e.attacker === 'b' ? 'a' : e.attacker,
        }))
      : events

    const normalizedResult = userSide === 'b'
      ? {
          ...battleResult,
          winner: battleResult.winner === 'a' ? 'b' : battleResult.winner === 'b' ? 'a' : battleResult.winner,
          attackerAlive: (battleResult as Record<string, unknown>).defenderAlive,
          defenderAlive: (battleResult as Record<string, unknown>).attackerAlive,
        }
      : battleResult

    return (
      <BattleViewer
        battleData={{ events: normalizedEvents, result: normalizedResult }}
        fighterA={viewerSnapshot}
        fighterBName={opponentName}
        fighterBImage={opponentImage}
        userSide="a"
        onComplete={markSeenAndGo}
        viewerSnapshot={viewerSnapshot}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
      <p className="text-sm mb-6 fade-in" style={{ color: '#6a5038', fontStyle: 'italic' }}>
        While you were away…
      </p>

      <div className="mb-6 fade-in">
        {opponentImage.startsWith('http') || opponentImage.startsWith('/')
          ? <img src={opponentImage} alt={opponentName}
              className="w-28 h-28 rounded-lg object-cover mx-auto"
              style={{ border: '3px solid #5a4028', boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }} />
          : <div className="text-8xl leading-none">{opponentImage}</div>
        }
      </div>

      <h2 className="text-2xl font-bold mb-3 fade-in" style={{ color: '#d4a843', fontFamily: cinzel, letterSpacing: '0.04em' }}>
        {opponentName}
      </h2>

      <p className="text-base mb-8 fade-in" style={{ color: '#a08050' }}>
        {opponentWasChallenger
          ? <>challenged <strong style={{ color: '#d4a843' }}>{viewerSnapshot.name}</strong> to a fight.</>
          : <><strong style={{ color: '#d4a843' }}>{viewerSnapshot.name}</strong> accepted your challenge.</>
        }
      </p>

      <button className="btn-primary px-10 py-3 text-base fade-in" onClick={() => setWatching(true)}>
        Watch the fight
      </button>

      <button
        className="mt-4 fade-in text-sm"
        style={{ color: '#5a4a30', background: 'none', border: 'none', cursor: 'pointer' }}
        disabled={dismissing}
        onClick={dismiss}>
        {dismissing ? 'Going to town…' : 'Skip → Go to Town'}
      </button>
    </div>
  )
}
