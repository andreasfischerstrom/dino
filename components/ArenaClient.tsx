'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Mob, GearTemplate, Species, DaringOption, xpForLevel, STATS, STAT_MAX } from '@/lib/game-data'
import { DailyBoss } from '@/lib/daily-boss'
import BattleViewer from './BattleViewer'

type Tab = 'fight' | 'duels'

interface Props {
  character: Record<string, unknown>
  equippedGear: (GearTemplate | undefined)[]
  mobs: Mob[]
  others: Record<string, unknown>[]
  incomingChallenges: Record<string, unknown>[]
  outgoingChallenges: Record<string, unknown>[]
  species: Species[]
  daringOptions: DaringOption[]
  dailyBoss: DailyBoss
  foughtToday: boolean
  locationName: string
  defaultTab?: Tab
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
  character, equippedGear: _equippedGear, mobs, others,
  incomingChallenges, outgoingChallenges,
  species, daringOptions, dailyBoss, foughtToday,
  locationName, defaultTab = 'fight',
}: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab || 'fight')

  // Shared settings
  const [daring, setDaring] = useState(character.daring as string || 'measured')
  const [surrenderAt, setSurrenderAt] = useState(character.surrender_at as number ?? 20)

  // Battle state
  const [battleData, setBattleData] = useState<Record<string, unknown> | null>(null)
  const [battleOpponent, setBattleOpponent] = useState<{ name: string; image: string; userSide?: 'a' | 'b'; mobId?: string } | null>(null)
  const [error, setError] = useState('')

  // Fight tab
  const [pendingMob, setPendingMob] = useState<Mob | null>(null)
  const [fightLoading, setFightLoading] = useState(false)
  const [activeManagement, setActiveManagement] = useState(false)

  const [showDailyTrial, setShowDailyTrial] = useState(false)

  // Duels tab
  const [search, setSearch] = useState('')
  const [challengeTarget, setChallengeTarget] = useState<Record<string, unknown> | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [confirmingChallenge, setConfirmingChallenge] = useState<Record<string, unknown> | null>(null)
  const [showChallengeSection, setShowChallengeSection] = useState(false)

  const charLevel = character.level as number
  const charSpecies = species.find(s => s.id === (character.species as string))
  const filteredOthers = useMemo(() =>
    search.trim() === '' ? others : others.filter(o => (o.name as string).toLowerCase().includes(search.toLowerCase())),
    [others, search]
  )

  async function startFight() {
    if (!pendingMob) return
    setFightLoading(true); setError('')
    const res = await fetch('/api/battle/mob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobId: pendingMob.id, daring, surrenderAt }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Something went wrong'); setFightLoading(false); return }
    setBattleData(json)
    setBattleOpponent({ name: pendingMob.name, image: pendingMob.image || pendingMob.emoji, mobId: pendingMob.id })
    setFightLoading(false)
    setPendingMob(null)
  }

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

  // Battle viewer
  if (battleData && battleOpponent) {
    const nextLevelXp = xpForLevel((character.level as number) + 1)
    const isMobFight = !battleOpponent.userSide
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
          const result = battleData.result as Record<string, unknown>
          const died = isMobFight
            ? (result.newHp as number) === 0
            : battleOpponent.userSide === 'b'
              ? !(result.defenderAlive as boolean)
              : (result.newHp as number) === 0
          window.location.href = died ? '/obituary' : '/town'
        }}
        mobId={battleOpponent.mobId}
        initialDaring={daring}
        surrenderAt={surrenderAt}
        daringOptions={daringOptions}
        activeManagement={isMobFight ? activeManagement : false}
      />
    )
  }

  const xpReward = charLevel * 180 + 600
  const bonesReward = charLevel * 40 + 100

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl page-title">{locationName}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: '#0e0a06', border: '1px solid #2a1e10' }}>
        {(['fight', 'duels'] as Tab[]).map(t => {
          const active = tab === t
          const badge = t === 'duels' && incomingChallenges.length > 0 ? incomingChallenges.length : 0
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                position: 'relative',
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-cinzel, Georgia)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                fontWeight: active ? 700 : 400,
                color: active ? '#d4a843' : '#6a5040',
                background: active ? '#1a1208' : 'transparent',
                border: active ? '1px solid #3a2810' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t === 'fight' ? 'Beasts' : 'Duels'}
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#c0392b', color: '#fff',
                  borderRadius: '9px', fontSize: '10px', fontWeight: 700,
                  minWidth: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', lineHeight: 1,
                }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      {/* ── Beasts Tab ── */}
      {tab === 'fight' && (
        <>
          {/* Daily Trial — collapsed by default */}
          <div className="mb-5 rounded-lg overflow-hidden" style={{
            border: `1px solid ${!foughtToday ? '#6a4a18' : '#2a1e10'}`,
            boxShadow: !foughtToday ? '0 0 20px rgba(212,168,67,0.06)' : 'none',
          }}>
            <button
              onClick={() => setShowDailyTrial(s => !s)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              style={{
                background: !foughtToday
                  ? 'linear-gradient(135deg, #1e1608 0%, #160f06 100%)'
                  : '#110e08',
                borderBottom: showDailyTrial ? '1px solid #2a1e10' : 'none',
                cursor: 'pointer',
              }}
            >
              <Icon icon="game-icons:trophy-cup" width={20} height={20} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs tracking-widest uppercase" style={{
                  color: !foughtToday ? '#d4a843' : '#5a4830',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.1em',
                }}>Daily Trial</p>
                <p className="text-xs" style={{ color: !foughtToday ? '#8a6838' : '#3a2e18' }}>
                  {foughtToday ? 'Complete — resets in ' : `${dailyBoss.fullName} · fight to the death`}
                  {foughtToday && <Countdown />}
                </p>
              </div>
              {!foughtToday && (
                <span className="text-xs px-2 py-0.5 rounded font-bold shrink-0" style={{
                  background: '#2a1a08', color: '#d4a843', border: '1px solid #5a3a10',
                }}>Available</span>
              )}
              <span className="text-xs shrink-0" style={{ color: '#4a3820' }}>{showDailyTrial ? '▲' : '▼'}</span>
            </button>

            {showDailyTrial && (
              <div className="p-5" style={{ background: 'linear-gradient(180deg, #140f06 0%, #0d0a05 100%)' }}>
                <div className="flex gap-4 mb-4">
                  <div className="text-5xl shrink-0 flex items-center justify-center w-16 h-16 rounded-lg" style={{ background: '#1a1208', border: '1px solid #3a2810' }}>
                    {dailyBoss.speciesEmoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg leading-tight mb-0.5" style={{ color: '#e8c870', fontFamily: 'var(--font-cinzel, Georgia)', textShadow: '0 0 20px rgba(212,168,67,0.3)' }}>{dailyBoss.fullName}</p>
                    <p className="text-xs mb-2" style={{ color: '#8a6a38' }}>Level {dailyBoss.level} {dailyBoss.speciesName}</p>
                    <p className="text-sm italic" style={{ color: '#7a6040', lineHeight: '1.5' }}>&ldquo;{dailyBoss.flavor}&rdquo;</p>
                  </div>
                </div>
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
                  <Icon icon="ph:warning" width={14} height={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>You fight at Bold daring. No surrender. If your HP reaches zero, your character dies permanently.</span>
                </div>
                {foughtToday ? (
                  <div className="text-center py-3 rounded" style={{ background: '#0e0c06', border: '1px solid #2a1e0e' }}>
                    <p className="text-sm" style={{ color: '#5a4a28' }}>Trial complete for today. Come back tomorrow.</p>
                  </div>
                ) : (
                  <button onClick={fightDaily} disabled={dailyLoading} className="w-full py-3 rounded font-bold text-sm transition-all" style={{ background: dailyLoading ? '#1a1208' : 'linear-gradient(135deg, #5a3a08 0%, #3a2408 100%)', border: '1px solid #8a6020', color: dailyLoading ? '#6a5030' : '#e8c870', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em', boxShadow: dailyLoading ? 'none' : '0 0 20px rgba(212,168,67,0.15)', cursor: 'pointer' }}>
                    {dailyLoading ? 'Entering the arena...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icon icon="game-icons:crossed-swords" width={16} height={16} />Enter the Trial</span>}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {mobs.map(mob => {
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
                        ? <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#1a1208', color: '#5a4a30', border: '1px solid #3a2a1044', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Icon icon="lucide:lock" width={10} height={10} />Lvl {mob.level}</span>
                        : <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}44` }}>Lvl {mob.level} · {difficulty}</span>
                      }
                    </div>
                    <p className="text-sm mb-1" style={{ color: '#a08050' }}>{mob.description}</p>
                    {locked
                      ? <p className="text-xs" style={{ color: '#6a4a28' }}>Reach level {mob.level - 3} to challenge this opponent. {levelsNeeded === 1 ? 'One more level.' : `${levelsNeeded} levels away.`}</p>
                      : <p className="text-xs" style={{ color: '#a08050' }}>Rewards: {mob.xpReward} XP · {mob.bonesReward[0]}–{mob.bonesReward[1]} bones</p>
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

          {pendingMob && (
            <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 50 }} onClick={() => setPendingMob(null)}>
              <div className="w-full" style={{ maxWidth: '420px', background: '#120d07', border: '1px solid #3a2810', borderRadius: '12px', boxShadow: '0 24px 64px rgba(0,0,0,0.95)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center" style={{ background: 'linear-gradient(to bottom, #1a1208, #120d07)', borderBottom: '1px solid #2a1e10' }}>
                  {pendingMob.image
                    ? <img src={pendingMob.image} alt={pendingMob.name} className="w-20 h-20 rounded-full object-cover mb-4" style={{ border: '2px solid #5a4028', boxShadow: '0 4px 16px rgba(0,0,0,0.8)' }} />
                    : <span className="text-6xl mb-4 leading-none">{pendingMob.emoji}</span>}
                  <h3 className="text-xl font-bold page-title mb-1">{pendingMob.name}</h3>
                  {(() => {
                    const difficulty = pendingMob.level <= charLevel - 2 ? 'Easy' : pendingMob.level <= charLevel + 1 ? 'Fair' : 'Hard'
                    const diffColor = difficulty === 'Easy' ? '#2a6428' : difficulty === 'Fair' ? '#d4a843' : '#9b1818'
                    return <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}55` }}>Lvl {pendingMob.level} · {difficulty}</span>
                  })()}
                </div>

                <div className="px-6 py-5 space-y-5" style={{ borderBottom: '1px solid #2a1e10' }}>
                  <p className="text-xs font-bold tracking-widest" style={{ color: '#4a3820', fontFamily: 'var(--font-cinzel, Georgia)' }}>BATTLE SETTINGS</p>
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>DARING</label>
                    <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input">
                      {daringOptions.map(d => <option key={d.key} value={d.key}>{d.label} — {d.description}</option>)}
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
                      {surrenderAt === 0 ? 'Fight to the death — your character can permanently die.' : `You'll likely survive a loss.`}
                    </p>
                  </div>
                </div>

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
                      position: 'relative', transition: 'background 0.18s, border-color 0.18s',
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

                <div className="px-6 py-5 space-y-2">
                  <button className="btn-primary w-full py-3 text-base" onClick={startFight} disabled={fightLoading}>
                    {fightLoading ? 'Preparing...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icon icon="game-icons:crossed-swords" width={16} height={16} />Enter the Pit</span>}
                  </button>
                  <button className="btn-ghost w-full py-2 text-sm" onClick={() => setPendingMob(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Duels Tab ── */}
      {tab === 'duels' && (
        <>
          {/* Incoming challenges */}
          {incomingChallenges.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📨</span>
                <h2 className="font-bold text-sm tracking-widest uppercase" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.10em' }}>Incoming Challenges</h2>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: '#2a0808', color: '#bf5a5a', border: '1px solid #6a1818' }}>{incomingChallenges.length}</span>
              </div>
              <div className="space-y-2">
                {incomingChallenges.map(c => {
                  const challenger = c.challenger as Record<string, unknown>
                  const cSpecies = species.find(s => s.id === (challenger.species as string))
                  const cImg = (challenger.image_url as string | null) || cSpecies?.image || null
                  return (
                    <div key={c.id as string} className="panel" style={{ borderLeft: '3px solid #7a2020' }}>
                      <div className="flex items-center gap-3">
                        {cImg
                          ? <img src={cImg} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #4a3520', flexShrink: 0 }} />
                          : <span className="text-2xl shrink-0">{cSpecies?.emoji ?? '🦕'}</span>
                        }
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{challenger.name as string} challenges you</p>
                          <p className="text-xs" style={{ color: '#a08050' }}>
                            Lvl {challenger.level as number} {cSpecies?.name} · Their daring: {c.challenger_daring as string}
                            {(c.challenger_surrender_at as number) === 0 ? ' · Fight to the death' : ` · Surrenders at ${c.challenger_surrender_at}% HP`}
                          </p>
                        </div>
                        <button className="btn-primary text-xs px-4 py-2 shrink-0" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }} onClick={() => setConfirmingChallenge(c)}><Icon icon="game-icons:crossed-swords" width={13} height={13} />Accept</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Challenge a player */}
          <div className="mb-6">
            <button onClick={() => setShowChallengeSection(s => !s)} className="w-full flex items-center justify-between px-4 py-3 rounded text-left" style={{ background: showChallengeSection ? '#1a1208' : '#120e06', border: '1px solid #3a2810', borderRadius: showChallengeSection ? '6px 6px 0 0' : '6px', cursor: 'pointer' }}>
              <div className="flex items-center gap-2">
                <Icon icon="game-icons:crossed-swords" width={16} height={16} style={{ color: '#d4a843' }} />
                <span className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Challenge a Player</span>
                {others.length > 0 && <span className="text-xs" style={{ color: '#5a4a30' }}>{others.length} available</span>}
              </div>
              <span className="text-xs" style={{ color: '#5a4a30' }}>{showChallengeSection ? '▲' : '▼'}</span>
            </button>
            {showChallengeSection && (
              <div className="rounded-b p-4 space-y-4" style={{ background: '#0e0b06', border: '1px solid #3a2810', borderTop: 'none' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4" style={{ borderBottom: '1px solid #2a1e0e' }}>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Your Daring</label>
                    <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input text-xs">
                      {daringOptions.map(d => <option key={d.key} value={d.key}>{d.label} — {d.description}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Surrender at {surrenderAt}% HP</label>
                    <input type="range" min={0} max={50} value={surrenderAt} onChange={e => setSurrenderAt(Number(e.target.value))} className="w-full mb-1" />
                    <p className="text-xs" style={{ color: surrenderAt === 0 ? '#c05050' : '#6a5030' }}>
                      {surrenderAt === 0 ? 'Fight to the death — your character can die.' : `You tap out at ${surrenderAt}% HP.`}
                    </p>
                  </div>
                </div>
                <input type="search" autoComplete="off" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="game-input text-sm" />
                {filteredOthers.length === 0 && (
                  <p className="text-sm" style={{ color: '#6a5030', fontStyle: 'italic' }}>
                    {search ? `No gladiators named "${search}".` : 'No other gladiators found. The arena echoes.'}
                  </p>
                )}
                <div className="space-y-2">
                  {filteredOthers.map(other => {
                    const otherSpecies = species.find(s => s.id === (other.species as string))
                    const otherImg = (other.image_url as string | null) || otherSpecies?.image || null
                    const isTarget = challengeTarget?.id === other.id
                    return (
                      <div key={other.id as string} className="panel flex items-center gap-3" style={{ borderColor: isTarget ? '#7a5020' : '#3a2810', borderTop: isTarget ? '2px solid #d4a843' : undefined }}>
                        {otherImg
                          ? <img src={otherImg} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #4a3520', flexShrink: 0 }} />
                          : <span className="text-2xl shrink-0">{otherSpecies?.emoji || '🦕'}</span>
                        }
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>{other.name as string}</p>
                          <p className="text-xs" style={{ color: '#a08050' }}>Lvl {other.level as number} {otherSpecies?.name} · {other.wins as number}W {other.losses as number}L · {other.kills as number} kills</p>
                        </div>
                        <button className={isTarget ? 'btn-ghost text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'} onClick={() => setChallengeTarget(isTarget ? null : other)}>
                          {isTarget ? 'Cancel' : 'Select'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Outgoing challenges */}
          {outgoingChallenges.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2 tracking-widest uppercase" style={{ color: '#5a4a30', fontFamily: 'var(--font-cinzel, Georgia)' }}>Awaiting Response</p>
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
          {confirmingChallenge && (() => {
            const challenger = confirmingChallenge.challenger as Record<string, unknown>
            const cSpecies = species.find(s => s.id === (challenger?.species as string))
            const cImg = (challenger?.image_url as string | null) || cSpecies?.image || null
            const cStats = challenger?.stats as Record<string, number> | null
            const [showChallengerStats, setShowChallengerStats] = useState(false)
            return (
              <div className="fixed inset-0 flex items-center justify-center px-4 z-50" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setConfirmingChallenge(null)}>
                <div className="panel w-full" style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', borderTop: '2px solid #7a2020', boxShadow: '0 8px 32px rgba(0,0,0,0.95)' }} onClick={e => e.stopPropagation()}>
                  {/* Challenger identity */}
                  <div className="flex items-center gap-3 mb-3">
                    {cImg
                      ? <img src={cImg} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7a2020', flexShrink: 0 }} />
                      : <span className="text-3xl shrink-0">{cSpecies?.emoji ?? '🦕'}</span>
                    }
                    <div>
                      <h3 className="font-bold page-title" style={{ fontSize: '1.1rem' }}>
                        {challenger?.name as string} challenges you
                      </h3>
                      <p className="text-xs" style={{ color: '#6a5030' }}>
                        Lvl {challenger?.level as number} {cSpecies?.name} · Daring: <strong style={{ color: '#d4a843' }}>{confirmingChallenge.challenger_daring as string}</strong>
                        {(confirmingChallenge.challenger_surrender_at as number) === 0
                          ? <span style={{ color: '#c05050' }}> · To the death</span>
                          : <> · Surrenders at <strong style={{ color: '#d4a843' }}>{confirmingChallenge.challenger_surrender_at as number}%</strong></>}
                      </p>
                    </div>
                  </div>

                  {/* Challenger stats toggle */}
                  {cStats && (
                    <div className="mb-3">
                      <button
                        className="w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between"
                        style={{ background: showChallengerStats ? '#1a1408' : '#120e06', border: '1px solid #3a2810', cursor: 'pointer' }}
                        onClick={() => setShowChallengerStats(s => !s)}>
                        <span style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Their Stats</span>
                        <span style={{ color: '#5a4830' }}>{showChallengerStats ? '▴' : '▾'}</span>
                      </button>
                      {showChallengerStats && (
                        <div className="px-3 py-2 rounded-b space-y-1.5" style={{ background: '#0e0b06', border: '1px solid #3a2810', borderTop: 'none' }}>
                          {STATS.map(stat => {
                            const val = cStats[stat.key] || 0
                            return (
                              <div key={stat.key} className="flex items-center gap-2">
                                <span className="text-xs w-20 shrink-0 flex items-center gap-1" style={{ color: '#7a6a4a' }}><Icon icon={stat.icon} width={11} height={11} />{stat.label}</span>
                                <div className="flex-1 stat-bar">
                                  <div className="stat-bar-fill" style={{ width: `${Math.min(100, (val / STAT_MAX) * 100)}%` }} />
                                </div>
                                <span className="text-xs w-4 text-right font-bold shrink-0" style={{ color: '#c8a84b' }}>{val}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid #2a1e10', marginBottom: '12px' }} />
                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>Your settings</p>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Your Daring</label>
                      <select value={daring} onChange={e => setDaring(e.target.value)} className="game-input text-xs">
                        {daringOptions.map(d => <option key={d.key} value={d.key}>{d.label} — {d.description}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: '#a08050' }}>Surrender at {surrenderAt}% HP</label>
                      <input type="range" min={0} max={50} value={surrenderAt} onChange={e => setSurrenderAt(Number(e.target.value))} className="w-full mb-1" />
                      <p className="text-xs" style={{ color: surrenderAt === 0 ? '#c05050' : '#6a5030' }}>
                        {surrenderAt === 0 ? 'Fight to the death — your character can die.' : `You tap out at ${surrenderAt}% HP.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1" disabled={!!acceptingId} onClick={() => acceptChallenge(confirmingChallenge.id as string)}>
                      {acceptingId ? 'Fighting...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icon icon="game-icons:crossed-swords" width={14} height={14} />Accept</span>}
                    </button>
                    <button className="btn-ghost flex-1" onClick={() => setConfirmingChallenge(null)}>Decline</button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Challenge confirmation modal */}
          {challengeTarget && showChallengeSection && (
            <div className="fixed inset-0 flex items-center justify-center px-4 z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
              <div className="panel max-w-sm w-full space-y-4" style={{ borderTop: '2px solid #5a4028', boxShadow: '0 8px 32px rgba(0,0,0,0.95)' }}>
                <h3 className="font-bold page-title" style={{ fontSize: '1.1rem' }}>Challenge {challengeTarget.name as string}?</h3>
                <p className="text-sm" style={{ color: '#a08050' }}>
                  You&apos;ll fight at <strong style={{ color: '#d4a843' }}>{daring}</strong> daring
                  {surrenderAt === 0
                    ? <span style={{ color: '#c05050' }}> with no surrender — fight to the death.</span>
                    : <span>, surrendering at <strong style={{ color: '#d4a843' }}>{surrenderAt}%</strong> HP.</span>}
                </p>
                <p className="text-xs" style={{ color: '#5a4a30' }}>They won&apos;t see your settings until they accept. Their daring is their choice.</p>
                <div className="flex gap-3">
                  <button className="btn-primary flex-1" onClick={sendChallenge} disabled={challengeLoading}>
                    {challengeLoading ? 'Sending...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icon icon="game-icons:crossed-swords" width={14} height={14} />Send Challenge</span>}
                  </button>
                  <button className="btn-ghost flex-1" onClick={() => setChallengeTarget(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
