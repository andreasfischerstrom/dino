'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Species, DaringOption } from '@/lib/game-data'
import BattleViewer from './BattleViewer'

interface Props {
  character: Record<string, unknown>
  others: Record<string, unknown>[]
  incomingChallenges: Record<string, unknown>[]
  outgoingChallenges: Record<string, unknown>[]
  species: Species[]
  daringOptions: DaringOption[]
}

export default function ArenaClient({ character, others, incomingChallenges, outgoingChallenges, species, daringOptions }: Props) {
  const [tab, setTab] = useState<'fight' | 'incoming' | 'outgoing'>('fight')
  const [search, setSearch] = useState('')
  const [challengeTarget, setChallengeTarget] = useState<Record<string, unknown> | null>(null)
  const [daring, setDaring] = useState(character.daring as string || 'measured')
  const [surrenderAt, setSurrenderAt] = useState(character.surrender_at as number ?? 20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [battleData, setBattleData] = useState<Record<string, unknown> | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  async function sendChallenge() {
    if (!challengeTarget) return
    setLoading(true); setError('')
    const res = await fetch('/api/challenge/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengedId: challengeTarget.id, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setLoading(false); return }
    setLoading(false)
    setChallengeTarget(null)
    window.location.reload()
  }

  async function acceptChallenge(challengeId: string) {
    setAcceptingId(challengeId); setError('')
    const res = await fetch('/api/challenge/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setAcceptingId(null); return }
    setBattleData(json)
    const challenge = incomingChallenges.find(c => c.id === challengeId)
    setChallengeTarget((challenge?.challenger as Record<string, unknown>) || null)
    setAcceptingId(null)
  }

  const charSpecies = species.find(s => s.id === (character.species as string))
  const filteredOthers = useMemo(() =>
    search.trim() === '' ? others : others.filter(o => (o.name as string).toLowerCase().includes(search.toLowerCase())),
    [others, search]
  )

  if (battleData && challengeTarget) {
    const opponentSpecies = species.find(s => s.id === (challengeTarget.species as string))
    const nextLevelXp = Math.floor(100 * Math.pow((character.level as number) + 1, 1.6))
    return (
      <BattleViewer
        battleData={battleData}
        fighterA={{
          hp: character.hp as number,
          maxHp: character.max_hp as number,
          xp: character.xp as number,
          xpForNextLevel: nextLevelXp,
          bones: character.bones as number,
          image: (character.image_url as string) || charSpecies?.image || charSpecies?.emoji || '🦕',
          name: character.name as string,
        }}
        fighterBName={challengeTarget.name as string}
        fighterBImage={(challengeTarget.image_url as string) || opponentSpecies?.image || opponentSpecies?.emoji || '🦕'}
        userSide='b'
        onComplete={() => { window.location.href = '/town' }}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title">The Colosseum</h1>
      </div>

      {/* Pre-fight settings */}
      <div className="panel mb-6" style={{ borderTop: '2px solid #5a4028' }}>
        <h2 className="font-bold mb-3" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Pre-Fight Settings</h2>
        <p className="text-xs mb-4" style={{ color: '#4a3a22' }}>
          These apply to all challenges you send or accept. Set them before engaging anyone.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <p className="text-xs mt-1" style={{ color: '#4a3a22' }}>
              {surrenderAt === 0
                ? '⚠️ You fight to the death. Your character will die if they lose.'
                : `You surrender at ${surrenderAt}% HP — likely to survive a loss.`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['fight', 'incoming', 'outgoing'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-btn ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {t === 'fight' ? '⚔️ Challenge' : t === 'incoming' ? `📨 Incoming (${incomingChallenges.length})` : `📤 Outgoing (${outgoingChallenges.length})`}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: '#c05050' }}>{error}</p>}

      {tab === 'fight' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="game-input mb-1"
          />
          {filteredOthers.length === 0 && (
            <p className="text-sm" style={{ color: '#4a3a22', fontStyle: 'italic' }}>
              {search ? `No gladiators named "${search}" found. They're either dead or hiding.` : 'No other gladiators found. The arena echoes with your loneliness.'}
            </p>
          )}
          {filteredOthers.map(other => {
            const otherSpecies = species.find(s => s.id === (other.species as string))
            return (
              <div key={other.id as string} className="panel row-hover flex items-center gap-4">
                <div className="text-3xl">{otherSpecies?.emoji || '🦕'}</div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{other.name as string}</p>
                  <p className="text-xs" style={{ color: '#4a3a22' }}>
                    Lvl {other.level as number} {otherSpecies?.name} · {other.wins as number}W / {other.losses as number}L · {other.kills as number} kills
                  </p>
                </div>
                <button className="btn-ghost text-sm"
                  onClick={() => setChallengeTarget(challengeTarget?.id === other.id ? null : other)}>
                  {challengeTarget?.id === other.id ? 'Cancel' : 'Challenge'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'incoming' && (
        <div className="space-y-3">
          {incomingChallenges.length === 0 && (
            <p className="text-sm" style={{ color: '#4a3a22', fontStyle: 'italic' }}>No incoming challenges. Either you're universally respected or universally ignored.</p>
          )}
          {incomingChallenges.map(c => {
            const challenger = c.challenger as Record<string, unknown>
            const cSpecies = species.find(s => s.id === (challenger.species as string))
            return (
              <div key={c.id as string} className="panel row-hover">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cSpecies?.emoji}</span>
                  <div>
                    <p className="font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{challenger.name as string} challenges you!</p>
                    <p className="text-xs" style={{ color: '#4a3a22' }}>
                      Lvl {challenger.level as number} {cSpecies?.name} · Daring: {c.challenger_daring as string}
                    </p>
                  </div>
                </div>
                <button className="btn-primary text-sm"
                  disabled={acceptingId === c.id as string}
                  onClick={() => acceptChallenge(c.id as string)}>
                  {acceptingId === c.id ? 'Resolving...' : 'Accept & Fight'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'outgoing' && (
        <div className="space-y-3">
          {outgoingChallenges.length === 0 && (
            <p className="text-sm" style={{ color: '#4a3a22', fontStyle: 'italic' }}>No pending challenges. Go threaten someone.</p>
          )}
          {outgoingChallenges.map(c => {
            const challenged = c.challenged as Record<string, unknown>
            return (
              <div key={c.id as string} className="panel text-sm" style={{ color: '#7a6a4a' }}>
                Challenge sent to <span style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{challenged.name as string}</span> — waiting for them to accept.
              </div>
            )
          })}
        </div>
      )}

      {/* Challenge modal */}
      {challengeTarget && tab === 'fight' && (
        <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel max-w-sm w-full space-y-4" style={{ borderTop: '2px solid #5a4028', boxShadow: '0 8px 32px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.8)' }}>
            <h3 className="font-bold text-lg page-title" style={{ fontSize: '1.125rem' }}>
              Challenge {challengeTarget.name as string}?
            </h3>
            <p className="text-sm" style={{ color: '#7a6a4a' }}>
              You'll fight with Daring: <strong style={{ color: '#d4a843' }}>{daring}</strong> and surrender at <strong style={{ color: '#d4a843' }}>{surrenderAt}%</strong> HP.
              {surrenderAt === 0 && <span style={{ color: '#c05050' }}> This is a death match.</span>}
            </p>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={sendChallenge} disabled={loading}>
                {loading ? 'Sending...' : 'Send Challenge ⚔️'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setChallengeTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
