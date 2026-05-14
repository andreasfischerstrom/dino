'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mob, GearTemplate, Species, xpForLevel } from '@/lib/game-data'
import BattleViewer from './BattleViewer'

interface Props {
  character: Record<string, unknown>
  equippedGear: (GearTemplate | undefined)[]
  mobs: Mob[]
  species: Species[]
}

export default function TrainingClient({ character, equippedGear, mobs, species }: Props) {
  const [fighting, setFighting] = useState(false)
  const [battleData, setBattleData] = useState<Record<string, unknown> | null>(null)
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charLevel = character.level as number
  const availableMobs = mobs.filter(m => m.level <= charLevel + 3)
  const sp = species.find(s => s.id === (character.species as string))

  async function startFight(mob: Mob) {
    setLoading(true); setError(''); setSelectedMob(mob)
    const res = await fetch('/api/battle/mob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobId: mob.id }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Something went wrong'); setLoading(false); return }
    setBattleData(json)
    setFighting(true)
    setLoading(false)
  }

  if (fighting && battleData && selectedMob) {
    const nextLevelXp = xpForLevel((character.level as number) + 1)
    return (
      <BattleViewer
        battleData={battleData}
        fighterA={{
          hp: character.hp as number,
          maxHp: character.max_hp as number,
          xp: character.xp as number,
          xpForNextLevel: nextLevelXp,
          bones: character.bones as number,
          image: (character.image_url as string) || sp?.image || sp?.emoji || '🦕',
          name: character.name as string,
        }}
        fighterBName={selectedMob.name}
        fighterBImage={selectedMob.emoji}
        onComplete={() => { window.location.href = '/town' }}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title">The Bone Pit</h1>
      </div>
      <p className="mb-6 text-sm" style={{ color: '#4a3a22', fontStyle: 'italic' }}>
        Train against the local wildlife. Gain XP and bones. Try not to think too hard about what they do with the bodies.
      </p>

      {error && <p className="mb-4 text-sm" style={{ color: '#c05050' }}>{error}</p>}

      <div className="space-y-3">
        {availableMobs.map(mob => {
          const difficulty = mob.level <= charLevel - 2 ? 'Easy' : mob.level <= charLevel + 1 ? 'Fair' : 'Hard'
          const diffColor = difficulty === 'Easy' ? '#2a6428' : difficulty === 'Fair' ? '#d4a843' : '#9b1818'
          return (
            <div key={mob.id} className="panel flex items-center gap-4">
              <div className="text-4xl w-12 text-center">{mob.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{mob.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}44` }}>
                    Lvl {mob.level} · {difficulty}
                  </span>
                </div>
                <p className="text-sm mb-1" style={{ color: '#7a6a4a' }}>{mob.description}</p>
                <p className="text-xs" style={{ color: '#4a3a22' }}>
                  Rewards: {mob.xpReward} XP · {mob.bonesReward[0]}–{mob.bonesReward[1]} bones
                </p>
              </div>
              <button className="btn-primary whitespace-nowrap" disabled={loading}
                onClick={() => startFight(mob)}>
                {loading && selectedMob?.id === mob.id ? 'Preparing...' : 'Fight'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
