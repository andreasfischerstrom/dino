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

  async function handleComplete() {
    await fetch('/api/battle/mark-seen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId }),
    })
    window.location.href = viewerSurvived ? '/town' : '/obituary'
  }

  const cinzel = 'var(--font-cinzel, Georgia)'

  if (watching) {
    // fighterA is always the viewer for BattleOutcome purposes (matching ArenaClient pattern)
    // userSide tells BattleViewer which event HP stream belongs to the viewer
    const fighterA: CharacterSnapshot = userSide === 'a'
      ? viewerSnapshot
      : {
          // When viewer is 'b', BattleViewer still needs a fighterA (the challenger).
          // We use opponentName/image for the portrait but viewerSnapshot fields don't matter
          // since BattleOutcome is driven by localResult, not fighterA stats when userSide='b'.
          // We still pass viewerSnapshot so BattleOutcome shows viewer's HP/XP transition.
          ...viewerSnapshot,
          name: opponentName,
          image: opponentImage,
        }

    const fighterBName = userSide === 'a' ? opponentName : viewerSnapshot.name
    const fighterBImage = userSide === 'a' ? opponentImage : viewerSnapshot.image

    return (
      <BattleViewer
        battleData={{ events, result: battleResult }}
        fighterA={fighterA}
        fighterBName={fighterBName}
        fighterBImage={fighterBImage}
        userSide={userSide}
        onComplete={handleComplete}
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
    </div>
  )
}
