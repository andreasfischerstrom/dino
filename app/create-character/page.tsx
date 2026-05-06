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

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <div className="flex justify-end mb-2">
        <SignOutButton />
      </div>
      <h1 className="text-4xl font-bold mb-2 text-center" style={{ color: '#c8a84b' }}>
        Forge Your Warrior
      </h1>
      <p className="text-center mb-8 text-sm" style={{ color: '#5a4a3a' }}>
        Choose wisely. You cannot un-choose. That's kind of the whole thing.
      </p>

      {/* Step indicator */}
      <div className="flex gap-2 justify-center mb-8">
        {(['species', 'stats', 'name'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step === s ? 'text-black' : 'text-gray-600'}`}
              style={{ background: step === s ? '#c8a84b' : '#2a1f10' }}>
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px" style={{ background: '#3d2e1e' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Species */}
      {step === 'species' && (
        <div className="fade-in">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#c8a84b' }}>Choose Your Species</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecies(s)}
                className={`text-left p-4 rounded-lg border transition-all`}
                style={{
                  background: selectedSpecies?.id === s.id ? '#2a1f10' : '#1a1410',
                  borderColor: selectedSpecies?.id === s.id ? '#c8a84b' : '#3d2e1e',
                }}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold" style={{ color: '#c8a84b' }}>{s.name}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: '#8a7a5a' }}>{s.tagline}</p>
                <p className="text-xs" style={{ color: '#5a4a3a' }}>{s.flavor}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(s.baseStats).map(([k, v]) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: (v as number) > 0 ? '#1a3a1a' : '#3a1a1a', color: (v as number) > 0 ? '#6abf6a' : '#bf6a6a' }}>
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
          <h2 className="text-xl font-bold mb-1" style={{ color: '#c8a84b' }}>Distribute Your Points</h2>
          <p className="text-sm mb-4" style={{ color: '#5a4a3a' }}>
            You have <span style={{ color: '#c8a84b', fontWeight: 'bold' }}>{pointsLeft}</span> of <span style={{ color: '#c8a84b', fontWeight: 'bold' }}>{totalPoints}</span> points remaining.
            Base stats and species bonuses are already applied above.
          </p>
          <div className="panel space-y-3">
            {STATS.map(stat => {
              const effective = getEffectiveStat(stat.key)
              const bonus = distributed[stat.key]
              return (
                <div key={stat.key} className="flex items-center gap-3">
                  <div className="w-6 text-center">{stat.emoji}</div>
                  <div className="w-28 text-sm font-bold" style={{ color: '#e8d5b0' }}>{stat.label}</div>
                  <div className="flex-1 stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${Math.min(100, effective * 7)}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustStat(stat.key, -1)} disabled={bonus <= 0}
                      className="w-7 h-7 rounded text-sm font-bold disabled:opacity-30 transition"
                      style={{ background: '#3d2e1e', color: '#c8a84b' }}>−</button>
                    <span className="w-6 text-center font-bold" style={{ color: '#c8a84b' }}>{effective}</span>
                    <button onClick={() => adjustStat(stat.key, 1)} disabled={pointsLeft <= 0}
                      className="w-7 h-7 rounded text-sm font-bold disabled:opacity-30 transition"
                      style={{ background: '#3d2e1e', color: '#c8a84b' }}>+</button>
                  </div>
                  <div className="text-xs w-20" style={{ color: '#5a4a3a' }}>{stat.description.split('.')[0]}.</div>
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
          <h2 className="text-xl font-bold mb-1" style={{ color: '#c8a84b' }}>Name Your Beast</h2>
          <p className="text-sm mb-6" style={{ color: '#5a4a3a' }}>
            This name will be shouted by the arena crowd. Make it count. Or make it funny. Both are valid.
          </p>

          <div className="panel space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#c8a84b' }}>Warrior Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
                placeholder='e.g. "Sir Chompsalot" or "Death from Above"'
                className="w-full px-4 py-3 rounded-lg text-lg"
                style={{ background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#e8d5b0', fontFamily: 'Georgia, serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#c8a84b' }}>Profile Image (optional)</label>
              <div className="flex items-center gap-4">
                {profilePreview ? (
                  <img src={profilePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover"
                    style={{ border: '2px solid #c8a84b' }} />
                ) : (
                  <div className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
                    style={{ background: '#0d0d0d', border: '2px dashed #3d2e1e' }}>
                    {selectedSpecies.emoji}
                  </div>
                )}
                <button className="btn-ghost text-sm" onClick={() => fileRef.current?.click()}>
                  {profilePreview ? 'Change Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <p className="text-xs mt-2" style={{ color: '#3a2a1a' }}>
                JPG, PNG, GIF — max 2MB. If omitted, your species emoji will be used.
              </p>
            </div>

            {/* Summary */}
            <div className="pt-4" style={{ borderTop: '1px solid #3d2e1e' }}>
              <p className="text-sm mb-2" style={{ color: '#5a4a3a' }}>Summary</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedSpecies.emoji}</span>
                <div>
                  <p className="font-bold" style={{ color: '#c8a84b' }}>{name || '(no name yet)'}</p>
                  <p className="text-sm" style={{ color: '#8a7a5a' }}>{selectedSpecies.name}</p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

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
