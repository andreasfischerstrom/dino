'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mob, GearTemplate, Species, DaringOption, xpForLevel } from '@/lib/game-data'
import BattleViewer from './BattleViewer'

interface Props {
  character: Record<string, unknown>
  equippedGear: (GearTemplate | undefined)[]
  mobs: Mob[]
  species: Species[]
  daringOptions: DaringOption[]
}

export default function TrainingClient({ character, equippedGear, mobs, species, daringOptions }: Props) {
  const [fighting, setFighting] = useState(false)
  const [battleData, setBattleData] = useState<Record<string, unknown> | null>(null)
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [pendingMob, setPendingMob] = useState<Mob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [daring, setDaring] = useState(character.daring as string || 'measured')
  const [surrenderAt, setSurrenderAt] = useState(character.surrender_at as number ?? 20)

  const charLevel = character.level as number
  const availableMobs = mobs.filter(m => m.level <= charLevel + 3)
  const sp = species.find(s => s.id === (character.species as string))

  async function startFight() {
    if (!pendingMob) return
    setLoading(true); setError(''); setSelectedMob(pendingMob)
    const res = await fetch('/api/battle/mob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobId: pendingMob.id, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Something went wrong'); setLoading(false); return }
    setBattleData(json)
    setFighting(true)
    setLoading(false)
    setPendingMob(null)
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
      <p className="mb-6 text-sm" style={{ color: '#a08050', fontStyle: 'italic' }}>
        Train against the local wildlife. Gain XP and bones. Try not to think too hard about what they do with the bodies.
      </p>

      {error && <p className="mb-4 text-sm" style={{ color: '#c05050' }}>{error}</p>}

      <div className="space-y-3">
        {availableMobs.map(mob => {
          const difficulty = mob.level <= charLevel - 2 ? 'Easy' : mob.level <= charLevel + 1 ? 'Fair' : 'Hard'
          const diffColor = difficulty === 'Easy' ? '#2a6428' : difficulty === 'Fair' ? '#d4a843' : '#9b1818'
          return (
            <div key={mob.id} className="panel row-hover flex items-center gap-4">
              <div className="text-4xl w-12 text-center">{mob.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{mob.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}44` }}>
                    Lvl {mob.level} · {difficulty}
                  </span>
                </div>
                <p className="text-sm mb-1" style={{ color: '#a08050' }}>{mob.description}</p>
                <p className="text-xs" style={{ color: '#a08050' }}>
                  Rewards: {mob.xpReward} XP · {mob.bonesReward[0]}–{mob.bonesReward[1]} bones
                </p>
              </div>
              <button className="btn-primary whitespace-nowrap"
                onClick={() => setPendingMob(mob)}>
                Fight
              </button>
            </div>
          )
        })}
      </div>

      {/* Pre-fight modal */}
      {pendingMob && (
        <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel max-w-sm w-full space-y-4" style={{ borderTop: '2px solid #5a4028', boxShadow: '0 8px 32px rgba(0,0,0,0.95)' }}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{pendingMob.emoji}</span>
              <h3 className="font-bold text-lg page-title">Fight {pendingMob.name}?</h3>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#e8d5b0', fontFamily: 'var(--font-cinzel, Georgia)' }}>Daring Level</label>
              <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input">
                {daringOptions.map(d => (
                  <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#e8d5b0', fontFamily: 'var(--font-cinzel, Georgia)' }}>
                Surrender at {surrenderAt}% HP
              </label>
              <input type="range" min={0} max={50} value={surrenderAt} onChange={e => setSurrenderAt(Number(e.target.value))} />
              <p className="text-xs mt-1" style={{ color: '#a08050' }}>
                {surrenderAt === 0
                  ? '⚠️ You fight to the death. Your character will die if they lose.'
                  : `You surrender at ${surrenderAt}% HP — likely to survive a loss.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={startFight} disabled={loading}>
                {loading ? 'Preparing...' : 'Fight! ⚔️'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setPendingMob(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
