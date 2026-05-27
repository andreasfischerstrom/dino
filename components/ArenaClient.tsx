'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Species, DaringOption, xpForLevel } from '@/lib/game-data'
import { DailyBoss } from '@/lib/daily-boss'
import BattleViewer from './BattleViewer'

interface Props {
  character: Record<string, unknown>
  others: Record<string, unknown>[]
  incomingChallenges: Record<string, unknown>[]
  outgoingChallenges: Record<string, unknown>[]
  species: Species[]
  daringOptions: DaringOption[]
  dailyBoss: DailyBoss
  foughtToday: boolean
  locationName: string
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const ms = tomorrow.getTime() - now.getTime()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      setTimeLeft(`${h}h ${m}m`)
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [])
  return <span>{timeLeft}</span>
}

export default function ArenaClient({
  character, others, incomingChallenges, outgoingChallenges,
  species, daringOptions, dailyBoss, foughtToday, locationName,
}: Props) {
  const [daring, setDaring] = useState(character.daring as string || 'measured')
  const [surrenderAt, setSurrenderAt] = useState(character.surrender_at as number ?? 20)
  const [search, setSearch] = useState('')
  const [challengeTarget, setChallengeTarget] = useState<Record<string, unknown> | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [error, setError] = useState('')
  const [battleData, setBattleData] = useState<Record<string, unknown> | null>(null)
  const [battleOpponent, setBattleOpponent] = useState<{ name: string; image: string; userSide: 'a' | 'b' } | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [confirmingChallenge, setConfirmingChallenge] = useState<Record<string, unknown> | null>(null)
  const [showChallengeSection, setShowChallengeSection] = useState(false)

  const charSpecies = species.find(s => s.id === (character.species as string))
  const filteredOthers = useMemo(() =>
    search.trim() === '' ? others : others.filter(o => (o.name as string).toLowerCase().includes(search.toLowerCase())),
    [others, search]
  )

  async function fightDaily() {
    setDailyLoading(true); setError('')
    const res = await fetch('/api/colosseum/daily', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setDailyLoading(false); return }
    setBattleData(json)
    setBattleOpponent({ name: dailyBoss.fullName, image: dailyBoss.speciesEmoji, userSide: 'a' })
    setDailyLoading(false)
  }

  async function sendChallenge() {
    if (!challengeTarget) return
    setChallengeLoading(true); setError('')
    const res = await fetch('/api/challenge/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengedId: challengeTarget.id, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setChallengeLoading(false); return }
    setChallengeLoading(false)
    setChallengeTarget(null)
    window.location.reload()
  }

  async function acceptChallenge(challengeId: string) {
    if (!confirmingChallenge) return
    setAcceptingId(challengeId); setError('')
    const res = await fetch('/api/challenge/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setAcceptingId(null); return }
    const challenger = confirmingChallenge.challenger as Record<string, unknown>
    const cSpecies = species.find(s => s.id === (challenger?.species as string))
    setBattleData(json)
    setBattleOpponent({ name: challenger?.name as string, image: cSpecies?.image || cSpecies?.emoji || '🦕', userSide: 'b' })
    setConfirmingChallenge(null)
    setAcceptingId(null)
  }

  // Show battle
  if (battleData && battleOpponent) {
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
          image: (character.image_url as string) || charSpecies?.image || charSpecies?.emoji || '🦕',
          name: character.name as string,
          level: character.level as number,
          statPoints: (character.stat_points || 0) as number,
        }}
        fighterBName={battleOpponent.name}
        fighterBImage={battleOpponent.image}
        userSide={battleOpponent.userSide}
        onComplete={() => {
          const result = (battleData.result as Record<string, unknown>)
          const died = battleOpponent.userSide === 'b'
            ? !(result.defenderAlive as boolean)
            : (result.newHp as number) === 0
          window.location.href = died ? '/obituary' : '/town'
        }}
      />
    )
  }

  const xpReward = (character.level as number) * 180 + 600
  const bonesReward = (character.level as number) * 40 + 100

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title">{locationName}</h1>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {/* ── Daily Trial ── */}
      <div className="mb-8 rounded-lg overflow-hidden" style={{
        border: '1px solid #6a4a18',
        boxShadow: '0 0 40px rgba(212,168,67,0.08)',
      }}>
        {/* Header */}
        <div className="px-5 py-3 flex items-center gap-3" style={{
          background: 'linear-gradient(135deg, #2a1e08 0%, #1a1206 100%)',
          borderBottom: '1px solid #5a3a10',
        }}>
          <span className="text-xl">🏆</span>
          <div>
            <p className="font-bold text-sm tracking-widest uppercase" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.12em' }}>
              The Daily Trial
            </p>
            <p className="text-xs" style={{ color: '#7a5a28' }}>One chance. No surrender. Fight to the death.</p>
          </div>
          {foughtToday && (
            <span className="ml-auto text-xs px-2 py-1 rounded" style={{ background: '#1a1208', color: '#6a5030', border: '1px solid #3a2810' }}>
              Resets in <Countdown />
            </span>
          )}
        </div>

        {/* Boss card */}
        <div className="p-5" style={{ background: 'linear-gradient(180deg, #140f06 0%, #0d0a05 100%)' }}>
          <div className="flex gap-4 mb-4">
            <div className="text-5xl shrink-0 flex items-center justify-center w-16 h-16 rounded-lg" style={{ background: '#1a1208', border: '1px solid #3a2810' }}>
              {dailyBoss.speciesEmoji}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg leading-tight mb-0.5" style={{ color: '#e8c870', fontFamily: 'var(--font-cinzel, Georgia)', textShadow: '0 0 20px rgba(212,168,67,0.3)' }}>
                {dailyBoss.fullName}
              </p>
              <p className="text-xs mb-2" style={{ color: '#8a6a38' }}>
                Level {dailyBoss.level} {dailyBoss.speciesName}
              </p>
              <p className="text-sm italic" style={{ color: '#7a6040', lineHeight: '1.5' }}>
                "{dailyBoss.flavor}"
              </p>
            </div>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Win XP', value: `+${xpReward.toLocaleString()}`, color: '#5abf6a', bg: '#0a1a0a' },
              { label: 'Bones (clean win)', value: `up to +${Math.floor(bonesReward * 1.5)}`, color: '#d4a843', bg: '#1a1208' },
              { label: 'On loss', value: 'You die.', color: '#bf5a5a', bg: '#1a0808' },
            ].map(r => (
              <div key={r.label} className="rounded p-2.5 text-center" style={{ background: r.bg, border: '1px solid #2a1e0e' }}>
                <p className="text-xs mb-1" style={{ color: '#6a5030' }}>{r.label}</p>
                <p className="text-xs font-bold" style={{ color: r.color }}>{r.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 text-xs mb-4 p-3 rounded" style={{ background: '#100d06', border: '1px solid #2a1e0e', color: '#6a5030' }}>
            <span>⚠️</span>
            <span>You fight at Bold daring. No surrender. If your HP reaches zero, your character dies permanently.</span>
          </div>

          {foughtToday ? (
            <div className="text-center py-3 rounded" style={{ background: '#0e0c06', border: '1px solid #2a1e0e' }}>
              <p className="text-sm" style={{ color: '#5a4a28' }}>Trial complete for today. You either won gloriously or you're reading this from the afterlife.</p>
            </div>
          ) : (
            <button
              onClick={fightDaily}
              disabled={dailyLoading}
              className="w-full py-3 rounded font-bold text-sm transition-all"
              style={{
                background: dailyLoading ? '#1a1208' : 'linear-gradient(135deg, #5a3a08 0%, #3a2408 100%)',
                border: '1px solid #8a6020',
                color: dailyLoading ? '#6a5030' : '#e8c870',
                fontFamily: 'var(--font-cinzel, Georgia)',
                letterSpacing: '0.06em',
                boxShadow: dailyLoading ? 'none' : '0 0 20px rgba(212,168,67,0.15)',
              }}>
              {dailyLoading ? 'Entering the arena...' : 'Enter the Trial ⚔️'}
            </button>
          )}
        </div>
      </div>

      {/* ── Incoming challenges ── */}
      {incomingChallenges.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📨</span>
            <h2 className="font-bold text-sm tracking-widest uppercase" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.10em' }}>
              Incoming Challenges
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: '#2a0808', color: '#bf5a5a', border: '1px solid #6a1818' }}>
              {incomingChallenges.length}
            </span>
          </div>
          <div className="space-y-2">
            {incomingChallenges.map(c => {
              const challenger = c.challenger as Record<string, unknown>
              const cSpecies = species.find(s => s.id === (challenger.species as string))
              return (
                <div key={c.id as string} className="panel" style={{ borderLeft: '3px solid #7a2020' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{cSpecies?.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
                        {challenger.name as string} challenges you
                      </p>
                      <p className="text-xs" style={{ color: '#a08050' }}>
                        Lvl {challenger.level as number} {cSpecies?.name} · Their daring: {c.challenger_daring as string}
                        {(c.challenger_surrender_at as number) === 0 ? ' · Fight to the death' : ` · Surrenders at ${c.challenger_surrender_at}% HP`}
                      </p>
                    </div>
                    <button
                      className="btn-primary text-xs px-4 py-2 shrink-0"
                      onClick={() => setConfirmingChallenge(c)}>
                      Accept ⚔️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Challenge a player ── */}
      <div className="mb-6">
        <button
          onClick={() => setShowChallengeSection(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 rounded text-left"
          style={{
            background: showChallengeSection ? '#1a1208' : '#120e06',
            border: '1px solid #3a2810',
            borderRadius: showChallengeSection ? '6px 6px 0 0' : '6px',
          }}>
          <div className="flex items-center gap-2">
            <span>⚔️</span>
            <span className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>
              Challenge a Player
            </span>
            {others.length > 0 && (
              <span className="text-xs" style={{ color: '#5a4a30' }}>{others.length} available</span>
            )}
          </div>
          <span className="text-xs" style={{ color: '#5a4a30' }}>{showChallengeSection ? '▲' : '▼'}</span>
        </button>

        {showChallengeSection && (
          <div className="rounded-b p-4 space-y-4" style={{ background: '#0e0b06', border: '1px solid #3a2810', borderTop: 'none' }}>
            {/* Fight settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4" style={{ borderBottom: '1px solid #2a1e0e' }}>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Your Daring</label>
                <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input text-xs">
                  {daringOptions.map(d => (
                    <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>
                  Surrender at {surrenderAt}% HP
                </label>
                <input type="range" min={0} max={50} value={surrenderAt} onChange={e => setSurrenderAt(Number(e.target.value))} className="w-full mb-1" />
                <p className="text-xs" style={{ color: surrenderAt === 0 ? '#c05050' : '#6a5030' }}>
                  {surrenderAt === 0 ? '⚠️ Fight to the death — your character can die.' : `You tap out at ${surrenderAt}% HP.`}
                </p>
              </div>
            </div>

            <input
              type="search"
              autoComplete="off"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="game-input text-sm"
            />

            {filteredOthers.length === 0 && (
              <p className="text-sm" style={{ color: '#6a5030', fontStyle: 'italic' }}>
                {search ? `No gladiators named "${search}".` : 'No other gladiators found. The arena echoes.'}
              </p>
            )}

            <div className="space-y-2">
              {filteredOthers.map(other => {
                const otherSpecies = species.find(s => s.id === (other.species as string))
                const isTarget = challengeTarget?.id === other.id
                return (
                  <div key={other.id as string} className="panel flex items-center gap-3"
                    style={{ borderColor: isTarget ? '#7a5020' : '#3a2810', borderTop: isTarget ? '2px solid #d4a843' : undefined }}>
                    <span className="text-2xl shrink-0">{otherSpecies?.emoji || '🦕'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{other.name as string}</p>
                      <p className="text-xs" style={{ color: '#a08050' }}>
                        Lvl {other.level as number} {otherSpecies?.name} · {other.wins as number}W {other.losses as number}L · {other.kills as number} kills
                      </p>
                    </div>
                    <button
                      className={isTarget ? 'btn-ghost text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}
                      onClick={() => setChallengeTarget(isTarget ? null : other)}>
                      {isTarget ? 'Cancel' : 'Select'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Outgoing challenges ── */}
      {outgoingChallenges.length > 0 && (
        <div>
          <p className="text-xs font-bold mb-2 tracking-widest uppercase" style={{ color: '#5a4a30', fontFamily: 'var(--font-cinzel, Georgia)' }}>
            Awaiting Response
          </p>
          <div className="space-y-2">
            {outgoingChallenges.map(c => {
              const challenged = c.challenged as Record<string, unknown>
              return (
                <div key={c.id as string} className="panel text-xs" style={{ color: '#5a4a30' }}>
                  Challenge sent to{' '}
                  <span style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>{challenged.name as string}</span>
                  {' '}— waiting for them to accept.
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Accept challenge modal */}
      {confirmingChallenge && (
        <div className="fixed inset-0 flex items-center justify-center px-4 z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel max-w-sm w-full space-y-4" style={{ borderTop: '2px solid #7a2020', boxShadow: '0 8px 32px rgba(0,0,0,0.95)' }}>
            <div>
              <h3 className="font-bold page-title mb-1" style={{ fontSize: '1.1rem' }}>
                {(confirmingChallenge.challenger as Record<string, unknown>)?.name as string} challenges you
              </h3>
              <p className="text-xs" style={{ color: '#6a5030' }}>
                Their daring: <strong style={{ color: '#d4a843' }}>{confirmingChallenge.challenger_daring as string}</strong>
                {(confirmingChallenge.challenger_surrender_at as number) === 0
                  ? <span style={{ color: '#c05050' }}> · Fight to the death</span>
                  : <> · Surrenders at <strong style={{ color: '#d4a843' }}>{confirmingChallenge.challenger_surrender_at as number}%</strong> HP</>}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #2a1e10' }} />

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>Your settings</p>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Your Daring</label>
                <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input text-xs">
                  {daringOptions.map(d => (
                    <option key={d.key} value={d.key}>{d.label} — {d.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>
                  Surrender at {surrenderAt}% HP
                </label>
                <input type="range" min={0} max={50} value={surrenderAt}
                  onChange={e => setSurrenderAt(Number(e.target.value))} className="w-full mb-1" />
                <p className="text-xs" style={{ color: surrenderAt === 0 ? '#c05050' : '#6a5030' }}>
                  {surrenderAt === 0 ? '⚠️ Fight to the death — your character can die.' : `You tap out at ${surrenderAt}% HP.`}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1"
                disabled={!!acceptingId}
                onClick={() => acceptChallenge(confirmingChallenge.id as string)}>
                {acceptingId ? 'Fighting...' : 'Accept ⚔️'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setConfirmingChallenge(null)}>
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge confirmation modal */}
      {challengeTarget && showChallengeSection && (
        <div className="fixed inset-0 flex items-center justify-center px-4 z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel max-w-sm w-full space-y-4" style={{ borderTop: '2px solid #5a4028', boxShadow: '0 8px 32px rgba(0,0,0,0.95)' }}>
            <h3 className="font-bold page-title" style={{ fontSize: '1.1rem' }}>
              Challenge {challengeTarget.name as string}?
            </h3>
            <p className="text-sm" style={{ color: '#a08050' }}>
              You'll fight at <strong style={{ color: '#d4a843' }}>{daring}</strong> daring
              {surrenderAt === 0
                ? <span style={{ color: '#c05050' }}> with no surrender — fight to the death.</span>
                : <span>, surrendering at <strong style={{ color: '#d4a843' }}>{surrenderAt}%</strong> HP.</span>}
            </p>
            <p className="text-xs" style={{ color: '#5a4a30' }}>
              They won't see your settings until they accept. Their daring is their choice.
            </p>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={sendChallenge} disabled={challengeLoading}>
                {challengeLoading ? 'Sending...' : 'Send Challenge ⚔️'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setChallengeTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
