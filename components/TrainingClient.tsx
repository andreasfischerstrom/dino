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
  const [activeManagement, setActiveManagement] = useState(false)

  const charLevel = character.level as number
  const availableMobs = mobs
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
          level: character.level as number,
          statPoints: (character.stat_points || 0) as number,
        }}
        fighterBName={selectedMob.name}
        fighterBImage={selectedMob.image || selectedMob.emoji}
        onComplete={() => { window.location.href = '/town' }}
        mobId={selectedMob.id}
        initialDaring={daring}
        surrenderAt={surrenderAt}
        daringOptions={daringOptions}
        activeManagement={activeManagement}
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

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="space-y-3">
        {availableMobs.map(mob => {
          const locked = mob.level > charLevel + 3
          const levelsNeeded = mob.level - charLevel - 3
          const difficulty = mob.level <= charLevel - 2 ? 'Easy' : mob.level <= charLevel + 1 ? 'Fair' : 'Hard'
          const diffColor = difficulty === 'Easy' ? '#2a6428' : difficulty === 'Fair' ? '#d4a843' : '#9b1818'
          return (
            <div key={mob.id} className="panel flex items-center gap-4" style={{ opacity: locked ? 0.45 : 1 }}>
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                {mob.image
                  ? <img src={mob.image} alt={mob.name} className="w-12 h-12 rounded-full object-cover" style={{ border: `2px solid ${locked ? '#3a2a18' : '#5a4028'}` }} />
                  : <span className="text-4xl">{mob.emoji}</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold" style={{ color: locked ? '#7a6040' : '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{mob.name}</h3>
                  {locked
                    ? <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#1a1208', color: '#5a4a30', border: '1px solid #3a2a1044' }}>
                        🔒 Lvl {mob.level}
                      </span>
                    : <span className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}44` }}>
                        Lvl {mob.level} · {difficulty}
                      </span>
                  }
                </div>
                <p className="text-sm mb-1" style={{ color: '#a08050' }}>{mob.description}</p>
                {locked
                  ? <p className="text-xs" style={{ color: '#6a4a28' }}>
                      Reach level {mob.level - 3} to challenge this opponent.
                      {levelsNeeded === 1 ? ' One more level.' : ` ${levelsNeeded} levels away.`}
                    </p>
                  : <p className="text-xs" style={{ color: '#a08050' }}>
                      Rewards: {mob.xpReward} XP · {mob.bonesReward[0]}–{mob.bonesReward[1]} bones
                    </p>
                }
              </div>
              <button
                className={locked ? 'btn-ghost whitespace-nowrap' : 'btn-primary whitespace-nowrap'}
                disabled={locked}
                onClick={() => !locked && setPendingMob(mob)}
                style={locked ? { cursor: 'not-allowed', opacity: 0.5 } : {}}>
                {locked ? 'Locked' : 'Fight'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Pre-fight modal */}
      {pendingMob && (
        <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 50 }}>
          <div className="w-full" style={{ maxWidth: '420px', background: '#120d07', border: '1px solid #3a2810', borderRadius: '12px', boxShadow: '0 24px 64px rgba(0,0,0,0.95), 0 0 0 1px rgba(90,64,40,0.3)', overflow: 'hidden' }}>

            {/* Header */}
            <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center" style={{ background: 'linear-gradient(to bottom, #1a1208, #120d07)', borderBottom: '1px solid #2a1e10' }}>
              {pendingMob.image
                ? <img src={pendingMob.image} alt={pendingMob.name} className="w-20 h-20 rounded-full object-cover mb-4" style={{ border: '2px solid #5a4028', boxShadow: '0 4px 16px rgba(0,0,0,0.8)' }} />
                : <span className="text-6xl mb-4 leading-none">{pendingMob.emoji}</span>}
              <h3 className="text-xl font-bold page-title mb-1">{pendingMob.name}</h3>
              {(() => {
                const difficulty = pendingMob.level <= charLevel - 2 ? 'Easy' : pendingMob.level <= charLevel + 1 ? 'Fair' : 'Hard'
                const diffColor = difficulty === 'Easy' ? '#2a6428' : difficulty === 'Fair' ? '#d4a843' : '#9b1818'
                return (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}55` }}>
                    Lvl {pendingMob.level} · {difficulty}
                  </span>
                )
              })()}
            </div>

            {/* Settings */}
            <div className="px-6 py-5 space-y-5" style={{ borderBottom: '1px solid #2a1e10' }}>
              <p className="text-xs font-bold tracking-widest" style={{ color: '#4a3820', fontFamily: 'var(--font-cinzel, Georgia)' }}>BATTLE SETTINGS</p>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>DARING</label>
                <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input">
                  {daringOptions.map(d => (
                    <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>SURRENDER</label>
                  <span className="text-sm font-bold" style={{ color: surrenderAt === 0 ? '#bf4040' : '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
                    {surrenderAt === 0 ? 'Never' : `at ${surrenderAt}% HP`}
                  </span>
                </div>
                <input type="range" min={0} max={50} value={surrenderAt} onChange={e => setSurrenderAt(Number(e.target.value))} className="w-full" />
                <p className="text-xs mt-2" style={{ color: surrenderAt === 0 ? '#bf6060' : '#6a5030' }}>
                  {surrenderAt === 0 ? '⚠️ Fight to the death — your character can permanently die.' : `You'll likely survive a loss.`}
                </p>
              </div>
            </div>

            {/* Active management toggle */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #2a1e10' }}>
              <label className="flex items-center gap-4 cursor-pointer select-none">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#e8d5b0' }}>Actively manage the fight</p>
                  <p className="text-xs mt-0.5" style={{ color: activeManagement ? '#7eb880' : '#6a5030' }}>
                    {activeManagement ? 'Pause between rounds to adjust daring' : 'Set daring once and let it play out'}
                  </p>
                </div>
                <input type="checkbox" role="switch" checked={activeManagement} onChange={e => setActiveManagement(e.target.checked)} className="sr-only" />
                <div className="shrink-0" style={{
                  width: '48px', height: '28px', borderRadius: '14px',
                  background: activeManagement ? '#2d6e2a' : '#2e2518',
                  border: `2px solid ${activeManagement ? '#5abf6a' : '#5a4530'}`,
                  position: 'relative',
                  transition: 'background 0.18s, border-color 0.18s',
                  boxShadow: activeManagement ? '0 0 8px rgba(90,191,106,0.3)' : 'inset 0 1px 3px rgba(0,0,0,0.5)',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: activeManagement ? '#7ee88a' : '#a08868',
                    position: 'absolute', top: '2px',
                    left: activeManagement ? '24px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1), background 0.18s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }} />
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-2">
              <button className="btn-primary w-full py-3 text-base" onClick={startFight} disabled={loading}>
                {loading ? 'Preparing...' : 'Enter the Pit ⚔️'}
              </button>
              <button className="btn-ghost w-full py-2 text-sm" onClick={() => setPendingMob(null)}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
