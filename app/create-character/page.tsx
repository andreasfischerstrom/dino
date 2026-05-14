'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIES, STATS, BASE_STATS, StatKey, Species } from '@/lib/game-data'
import SignOutButton from '@/components/SignOutButton'

export default function CreateCharacter() {
  const router = useRouter()
  const [step, setStep] = useState<'species' | 'stats' | 'name'>('species')
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [name, setName] = useState('')
  const [distributed, setDistributed] = useState<Record<StatKey, number>>({
    strength: 0, agility: 0, constitution: 0, ferocity: 0,
    hide: 0, stamina: 0, jaw: 0, cunning: 0, roar: 0,
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [activeStat, setActiveStat] = useState<StatKey | null>(null)
  const [statsOpen, setStatsOpen] = useState(false)
  const totalPoints = selectedSpecies?.bonusPoints ?? 12
  const pointsUsed = Object.values(distributed).reduce((a, b) => a + b, 0)
  const pointsLeft = totalPoints - pointsUsed

  function adjustStat(key: StatKey, delta: number) {
    const current = distributed[key]
    if (delta > 0 && pointsLeft <= 0) return
    if (delta < 0 && current <= 0) return
    setDistributed(prev => ({ ...prev, [key]: current + delta }))
  }

  function getEffectiveStat(key: StatKey): number {
    const base = BASE_STATS[key]
    const species = selectedSpecies?.baseStats[key] ?? 0
    const dist = distributed[key]
    return Math.max(1, base + species + dist)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileImage(file)
    const reader = new FileReader()
    reader.onload = () => setProfilePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleCreate() {
    if (!selectedSpecies || !name.trim()) return
    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('species', selectedSpecies.id)
    formData.append('stats', JSON.stringify(distributed))
    if (profileImage) formData.append('image', profileImage)

    const res = await fetch('/api/character/create', { method: 'POST', body: formData })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Something went wrong'); setSaving(false); return }
    router.push('/town')
  }

  const steps = ['species', 'stats', 'name'] as const
  const stepLabels = ['Species', 'Stats', 'Name']

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <div className="flex justify-end mb-4">
        <SignOutButton />
      </div>
      <h1 className="text-4xl font-bold mb-2 text-center page-title">
        Forge Your Warrior
      </h1>
      <p className="text-center mb-8 text-sm" style={{ color: '#4a3a22', fontStyle: 'italic' }}>
        Choose wisely. You cannot un-choose. That's kind of the whole thing.
      </p>

      {/* Step indicator */}
      <div className="flex gap-2 justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: step === s ? 'linear-gradient(to bottom, #e0ba40, #a87018)' : steps.indexOf(step) > i ? '#3a2810' : '#1a1408',
                  color: step === s ? '#160c00' : steps.indexOf(step) > i ? '#7a5a30' : '#3a2810',
                  border: `1px solid ${step === s ? '#7a5010' : '#2a1e0e'}`,
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  boxShadow: step === s ? '0 2px 5px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                }}>
                {i + 1}
              </div>
              <span className="text-xs" style={{
                color: step === s ? '#d4a843' : '#3a2810',
                fontFamily: 'var(--font-cinzel, Georgia)',
                fontSize: '10px',
                letterSpacing: '0.04em',
              }}>{stepLabels[i]}</span>
            </div>
            {i < 2 && <div className="w-8 h-px mb-4" style={{ background: '#2a1e0e' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Species */}
      {step === 'species' && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold page-title" style={{ fontSize: '1.25rem' }}>Choose Your Species</h2>
            <button
              onClick={() => setStatsOpen(o => !o)}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded"
              style={{ color: '#a08040', background: '#1a1408', border: '1px solid #3a2810', cursor: 'pointer' }}>
              {statsOpen ? '▾' : '▸'} Stats guide
            </button>
          </div>
          {statsOpen && (
            <div className="panel mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5" style={{ padding: '0.875rem 1rem' }}>
              {STATS.map(s => (
                <p key={s.key} className="text-xs" style={{ color: '#5a4a30' }}>
                  <span className="mr-1">{s.emoji}</span>
                  <strong style={{ color: '#7a6a4a' }}>{s.label}:</strong> {s.description}
                </p>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecies(s)}
                className="text-left p-4 rounded species-card"
                style={{
                  background: selectedSpecies?.id === s.id
                    ? 'linear-gradient(135deg, #2a1e0e 0%, #1e1408 100%)'
                    : 'linear-gradient(135deg, #1a1408 0%, #141008 100%)',
                  border: `1px solid ${selectedSpecies?.id === s.id ? '#7a5020' : '#3a2810'}`,
                  borderTop: selectedSpecies?.id === s.id ? '2px solid #d4a843' : '1px solid #3a2810',
                  boxShadow: selectedSpecies?.id === s.id ? '0 0 12px rgba(212,168,67,0.1)' : 'none',
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <img src={s.image} alt={s.name} className="w-14 h-14 rounded object-cover shrink-0"
                    style={{ border: '1px solid #4a3520' }} />
                  <div>
                    <p className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{s.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#7a6a4a' }}>{s.tagline}</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#4a3a22' }}>{s.flavor}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(s.baseStats).map(([k, v]) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: (v as number) > 0 ? '#0e2410' : '#2a0e0e',
                        color: (v as number) > 0 ? '#5abf6a' : '#bf5a5a',
                        border: `1px solid ${(v as number) > 0 ? '#2a6428' : '#6a2828'}`,
                      }}>
                      {(v as number) > 0 ? '+' : ''}{v} {k}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary" disabled={!selectedSpecies} onClick={() => setStep('stats')}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Stats */}
      {step === 'stats' && selectedSpecies && (
        <div className="fade-in">
          <h2 className="text-xl font-bold mb-1 page-title" style={{ fontSize: '1.25rem' }}>Distribute Your Points</h2>
          <p className="text-sm mb-4" style={{ color: '#4a3a22' }}>
            You have{' '}
            <span style={{ color: '#d4a843', fontWeight: 'bold', fontFamily: 'var(--font-cinzel, Georgia)' }}>{pointsLeft}</span>
            {' '}of{' '}
            <span style={{ color: '#d4a843', fontWeight: 'bold', fontFamily: 'var(--font-cinzel, Georgia)' }}>{totalPoints}</span>
            {' '}points remaining.
          </p>
          <div className="panel space-y-1">
            {STATS.map(stat => {
              const effective = getEffectiveStat(stat.key)
              const bonus = distributed[stat.key]
              const isActive = activeStat === stat.key
              return (
                <div key={stat.key}>
                  <div className="flex items-center gap-3 py-2 rounded cursor-pointer"
                    style={{ background: isActive ? 'rgba(212,168,67,0.05)' : 'transparent' }}
                    onClick={() => setActiveStat(isActive ? null : stat.key)}>
                    <div className="w-6 text-center">{stat.emoji}</div>
                    <div className="w-28 text-sm font-bold" style={{ color: isActive ? '#d4a843' : '#e8d5b0', fontFamily: 'var(--font-cinzel, Georgia)' }}>{stat.label}</div>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill" style={{ width: `${Math.min(100, effective * 7)}%` }} />
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => adjustStat(stat.key, -1)} disabled={bonus <= 0}
                        className="w-7 h-7 rounded text-sm font-bold disabled:opacity-30 transition"
                        style={{ background: '#2a1e0e', color: '#d4a843', border: '1px solid #4a3520' }}>−</button>
                      <span className="w-6 text-center font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{effective}</span>
                      <button onClick={() => adjustStat(stat.key, 1)} disabled={pointsLeft <= 0}
                        className="w-7 h-7 rounded text-sm font-bold disabled:opacity-30 transition"
                        style={{ background: '#2a1e0e', color: '#d4a843', border: '1px solid #4a3520' }}>+</button>
                    </div>
                  </div>
                  {isActive && (
                    <p className="text-xs pb-2 pl-9 pr-2" style={{ color: '#7a6a4a', fontStyle: 'italic' }}>
                      {stat.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-6 flex justify-between">
            <button className="btn-ghost" onClick={() => setStep('species')}>← Back</button>
            <button className="btn-primary" onClick={() => setStep('name')}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Name & Image */}
      {step === 'name' && selectedSpecies && (
        <div className="fade-in">
          <h2 className="text-xl font-bold mb-1 page-title" style={{ fontSize: '1.25rem' }}>Name Your Beast</h2>
          <p className="text-sm mb-6" style={{ color: '#4a3a22', fontStyle: 'italic' }}>
            This name will be shouted by the arena crowd. Make it count. Or make it funny. Both are valid.
          </p>

          <div className="panel space-y-6" style={{ borderTop: '2px solid #5a4028' }}>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Warrior Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
                placeholder='e.g. "Sir Chompsalot" or "Death from Above"'
                className="game-input text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Profile Image (optional)</label>
              <div className="flex items-center gap-4">
                {profilePreview ? (
                  <img src={profilePreview} alt="preview" className="w-20 h-20 rounded object-cover"
                    style={{ border: '2px solid #5a4028', boxShadow: '0 2px 6px rgba(0,0,0,0.7)' }} />
                ) : (
                  <img src={selectedSpecies.image} alt={selectedSpecies.name}
                    className="w-20 h-20 rounded object-cover opacity-60"
                    style={{ border: '2px dashed #3a2810' }} />
                )}
                <button className="btn-ghost text-sm" onClick={() => fileRef.current?.click()}>
                  {profilePreview ? 'Change Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <p className="text-xs mt-2" style={{ color: '#2a1e10' }}>
                JPG, PNG, GIF — max 2MB. If omitted, your species emoji will be used.
              </p>
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid #2a1e0e' }}>
              <p className="text-xs mb-2" style={{ color: '#4a3a22', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>SUMMARY</p>
              <div className="flex items-center gap-3">
                <img src={selectedSpecies.image} alt={selectedSpecies.name} className="w-12 h-12 rounded object-cover" style={{ border: '1px solid #4a3520' }} />
                <div>
                  <p className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{name || '(no name yet)'}</p>
                  <p className="text-sm" style={{ color: '#7a6a4a' }}>{selectedSpecies.name}</p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm" style={{ color: '#c05050' }}>{error}</p>}

          <div className="mt-6 flex justify-between">
            <button className="btn-ghost" onClick={() => setStep('stats')}>← Back</button>
            <button className="btn-primary" disabled={!name.trim() || saving}
              onClick={handleCreate}>
              {saving ? 'Creating...' : 'Enter the Arena ⚔️'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
