'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { TAVERN_QUESTS, TAVERN_ITEMS, TavernItem, TavernItemEffect, StatKey } from '@/lib/game-data'

const RUMORS = [
  "A Spinosaurus named 'Dave' has gone undefeated for three weeks. Nobody knows how Dave does it. Dave won't say.",
  "The Healer recently treated a Pachycephalosaurus for self-inflicted head trauma. 'It was worth it,' they said.",
  "Someone in the upper tier has been betting bones on every fight. They are either very rich or very in debt. Possibly both.",
  "A T-Rex was seen shopping for accessories. Observers report it was 'very serious about the war paint'.",
  "Three Velociraptors entered the Bone Pit together. Only two came out. The third one is fine — it left through a different exit.",
  "Grubclaw has unveiled a new sword. It has four fingers. This is suspicious.",
  "An Ankylosaurus fought so long that both it and its opponent fell asleep. The judges called a draw and quietly left.",
  "The tavern ran out of fermented fern juice last Tuesday. Violence has increased 40%.",
  "A Pterodactyl filed a formal complaint about being called a dinosaur. The complaint was dismissed.",
  "Word is a new challenger has arrived from the Eastern Swamps. Nobody has seen them fight yet. Everyone is nervous.",
]

const HEALER_COST_PER_HP = 2

const TIER_LABELS = [
  { label: 'Basic Supplies', filter: (i: TavernItem) => !i.statReq },
  { label: 'Specialist Goods', filter: (i: TavernItem) => i.statReq && Object.keys(i.statReq).length === 1 },
  { label: 'Expert Preparations', filter: (i: TavernItem) => i.statReq && Object.keys(i.statReq).length >= 2 },
]

function describeEffects(effects: TavernItemEffect[], maxHp: number, hp: number): { text: string; color: string }[] {
  return effects.map(e => {
    if (e.type === 'heal') return { text: `+${Math.min(e.amount, maxHp - hp)} HP now`, color: '#6ab0bf' }
    if (e.type === 'xp') return { text: `+${e.amount} XP now`, color: '#d4a843' }
    return { text: `Next fight: +${e.bonus} ${e.stat}`, color: '#5abf6a' }
  })
}

type DiceOutcome = 'win' | 'loss' | 'cheat_win' | 'cheat_caught' | 'draw' | null

export default function TavernClient({ character }: { character: Record<string, unknown> }) {
  const [tab, setTab] = useState<'shop' | 'heal' | 'quest' | 'dice'>('shop')
  const [bones, setBones] = useState(character.bones as number)
  const [hp, setHp] = useState(character.hp as number)
  const maxHp = character.max_hp as number
  const charStats = (character.stats || {}) as Record<StatKey, number>
  const cunning = charStats.cunning || 0
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [rumor] = useState(() => RUMORS[Math.floor(Math.random() * RUMORS.length)])

  // Dice game state
  const [diceBet, setDiceBet] = useState(20)
  const [diceCheat, setDiceCheat] = useState(false)
  const [dicePlayed, setDicePlayed] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const [diceResult, setDiceResult] = useState<{
    playerDice: number[]; houseDice: number[]
    playerTotal: number; houseTotal: number
    outcome: DiceOutcome; boneDelta: number; newHp?: number
  } | null>(null)
  const [playerShown, setPlayerShown] = useState(0)
  const [houseShown, setHouseShown] = useState(0)
  const [showOutcome, setShowOutcome] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const [quest] = useState(() => {
    if (Math.random() > 0.70) return null
    return TAVERN_QUESTS[Math.floor(Math.random() * TAVERN_QUESTS.length)]
  })
  const [questOutcome, setQuestOutcome] = useState<string | null>(null)
  const [questDone, setQuestDone] = useState(false)

  const hpMissing = maxHp - hp
  const healCost = hpMissing * HEALER_COST_PER_HP
  const hpPct = Math.round((hp / maxHp) * 100)

  function meetsStatReq(item: TavernItem): boolean {
    if (!item.statReq) return true
    return Object.entries(item.statReq).every(([stat, min]) => (charStats[stat as StatKey] || 0) >= (min as number))
  }

  function statReqLabel(item: TavernItem): string {
    if (!item.statReq) return ''
    return Object.entries(item.statReq)
      .map(([stat, min]) => `${stat} ≥ ${min}`)
      .join(', ')
  }

  async function heal() {
    if (hpMissing <= 0) { setMessage("You're already at full health."); return }
    if (bones < healCost) { setMessage(`Need ${healCost} bones. You have ${bones}. The healer shrugs.`); return }
    setLoading('heal')
    const res = await fetch('/api/tavern/heal', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setMessage(json.error); setLoading(null); return }
    setBones(json.newBones)
    setHp(maxHp)
    setMessage("Several large leaves and some mud later — you feel better.")
    setLoading(null)
  }

  async function buyItem(itemId: string) {
    setLoading(itemId); setMessage('')
    const res = await fetch('/api/tavern/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    const json = await res.json()
    if (!res.ok) { setMessage(json.error); setLoading(null); return }
    setBones(json.newBones)
    if (json.newHp !== undefined) setHp(Math.min(maxHp, json.newHp))
    const item = TAVERN_ITEMS.find(i => i.id === itemId)
    setMessage(`Purchased: ${item?.name}. ${item?.flavorText}`)
    setLoading(null)
  }

  async function handleQuest(accepted: boolean) {
    if (!quest || questDone) return
    setLoading('quest')
    const res = await fetch('/api/tavern/quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId: quest.id, accepted }),
    })
    const json = await res.json()
    if (!res.ok) { setMessage(json.error || 'Something went wrong.'); setLoading(null); return }
    setQuestOutcome(accepted ? quest.acceptOutcome : quest.declineOutcome)
    setQuestDone(true)
    if (json.newBones !== undefined) setBones(json.newBones)
    if (json.newHp !== undefined) setHp(Math.min(maxHp, Math.max(1, json.newHp)))
    setLoading(null)
  }

  const DIE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅']

  function schedule(ms: number, fn: () => void) {
    const t = setTimeout(fn, ms)
    timeouts.current.push(t)
    return t
  }

  async function playDice() {
    if (dicePlayed) return
    setDiceRolling(true)
    setPlayerShown(0)
    setHouseShown(0)
    setShowOutcome(false)

    const res = await fetch('/api/tavern/dice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet: diceBet, cheat: diceCheat }),
    })
    const json = await res.json()
    if (!res.ok) { setMessage(json.error); setDiceRolling(false); return }

    setBones(json.newBones)
    if (json.newHp !== undefined) setHp(json.newHp)
    setDiceResult(json)
    setDiceRolling(false)

    // Reveal player dice one at a time, then house dice, then outcome
    schedule(400,  () => setPlayerShown(1))
    schedule(900,  () => setPlayerShown(2))
    schedule(1400, () => setPlayerShown(3))
    schedule(2200, () => setHouseShown(1))
    schedule(2700, () => setHouseShown(2))
    schedule(3200, () => setHouseShown(3))
    schedule(4000, () => { setShowOutcome(true); setDicePlayed(true) })
  }

  const tabs = [
    { key: 'shop' as const, label: '🛒 Shop' },
    { key: 'heal' as const, label: '🌿 Healer' },
    { key: 'dice' as const, label: '🎲 Bone Dice' },
    { key: 'quest' as const, label: `⚡ Quest${quest ? '' : ' (none)'}` },
  ]

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title">Tar Pit Tavern</h1>
        <span className="ml-auto text-sm font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>🦴 {bones}</span>
      </div>
      <p className="text-sm mb-4" style={{ color: '#a08050', fontStyle: 'italic' }}>
        Smells like smoke and bad decisions. You feel at home.
      </p>

      <div className="panel mb-4 py-3" style={{ borderLeft: '3px solid #4a3520' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.08em' }}>
          OVERHEARD AT THE BAR
        </p>
        <p className="text-sm italic" style={{ color: '#a08050' }}>"{rumor}"</p>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setMessage('') }}
            className={`tab-btn ${tab === t.key ? 'tab-active' : 'tab-inactive'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {message && <div className="alert-success mb-4">{message}</div>}

      {tab === 'shop' && (
        <div className="space-y-6">
          <p className="text-xs" style={{ color: '#a08050' }}>
            Consumables apply at the start of your next fight. Heals and XP apply immediately.
            Items marked 🔒 require higher stats to purchase.
          </p>
          {TIER_LABELS.map(tier => {
            const items = TAVERN_ITEMS.filter(tier.filter)
            if (items.length === 0) return null
            return (
              <div key={tier.label}>
                <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{
                  color: '#a08050',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                }}>{tier.label}</p>
                <div className="space-y-2">
                  {items.map(item => {
                    const canAfford = bones >= item.price
                    const unlocked = meetsStatReq(item)
                    const isHeal = item.effects.some(e => e.type === 'heal')
                    const fullAlready = isHeal && hp >= maxHp
                    const disabled = !canAfford || loading === item.id || fullAlready || !unlocked
                    const effectDescs = describeEffects(item.effects, maxHp, hp)

                    return (
                      <div key={item.id} className="panel flex items-start gap-4"
                        style={{ opacity: unlocked ? 1 : 0.6 }}>
                        <div className="text-3xl w-10 text-center shrink-0 mt-0.5">{item.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm" style={{
                              color: unlocked ? '#d4a843' : '#5a4a30',
                              fontFamily: 'var(--font-cinzel, Georgia)',
                            }}>{item.name}</p>
                            {!unlocked && <span className="text-xs">🔒</span>}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: '#a08050' }}>{item.description}</p>
                          <div className="flex flex-wrap gap-x-3 mt-0.5">
                            {effectDescs.map((d, i) => (
                              <p key={i} className="text-xs" style={{ color: d.color }}>{d.text}</p>
                            ))}
                          </div>
                          {!unlocked && (
                            <p className="text-xs mt-1" style={{ color: '#7a5a3a' }}>
                              Requires: {statReqLabel(item)}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold mb-1" style={{ color: '#d4a843' }}>🦴 {item.price}</p>
                          <button
                            className="btn-primary text-xs px-3 py-1"
                            disabled={disabled}
                            onClick={() => buyItem(item.id)}>
                            {loading === item.id ? '...' : !unlocked ? 'Locked' : !canAfford ? 'No bones' : fullAlready ? 'Full HP' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'heal' && (
        <div className="panel space-y-5">
          <div>
            <p className="font-bold mb-0.5" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>The Healer</p>
            <p className="text-xs" style={{ color: '#a08050' }}>
              An elderly Stegosaurus of dubious medical credentials. {HEALER_COST_PER_HP} bones per HP. No refunds.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: '#8b1515' }}>❤ Health</span>
              <span style={{ color: '#a08050' }}>{hp} / {maxHp}</span>
            </div>
            <div className="hud-bar mb-3">
              <div className="hud-bar-hp" style={{ width: `${hpPct}%` }} />
            </div>

            {hpMissing > 0 ? (
              <div className="rounded p-4 space-y-3" style={{ background: '#0e0c08', border: '1px solid #3a2810' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#a08050' }}>Full heal cost</span>
                  <span className="text-base font-bold" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>🦴 {healCost}</span>
                </div>
                <button className="btn-primary w-full py-2.5" onClick={heal} disabled={loading === 'heal' || bones < healCost}>
                  {loading === 'heal' ? 'Healing...' : bones < healCost ? `Need ${healCost - bones} more bones` : `Heal to Full`}
                </button>
              </div>
            ) : (
              <div className="alert-success">✓ Fully healed. The healer seems mildly disappointed.</div>
            )}
          </div>

          <p className="text-xs" style={{ color: '#5a4a30', borderTop: '1px solid #2a1e0e', paddingTop: '0.75rem' }}>
            HP also regenerates passively — full recovery takes 1 hour. Single-use salves in the shop cost less.
          </p>
        </div>
      )}

      {tab === 'dice' && (
        <div className="panel space-y-5">
          <div>
            <p className="font-bold mb-0.5" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Bone Dice</p>
            <p className="text-xs" style={{ color: '#a08050' }}>
              Roll 3 dice against the house. Highest total wins. One game per visit.
            </p>
          </div>

          {!dicePlayed && !diceRolling && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2" style={{ color: '#a08050' }}>
                  <span>Your bet</span>
                  <span className="font-bold" style={{ color: '#d4a843' }}>🦴 {diceBet}</span>
                </div>
                <input
                  type="range" min={1} max={Math.min(300, bones)} value={diceBet}
                  onChange={e => setDiceBet(Number(e.target.value))}
                  className="w-full accent-yellow-600"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#5a4a30' }}>
                  <span>1</span><span>300</span>
                </div>
              </div>

              <div className="rounded p-3 space-y-1" style={{ background: '#0e0c08', border: '1px solid #3a2810' }}>
                <div className="flex justify-between text-xs" style={{ color: '#a08050' }}>
                  <span>Win pays</span><span style={{ color: '#5abf6a' }}>+🦴 {diceBet}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#a08050' }}>
                  <span>Cheat win pays</span><span style={{ color: '#d4a843' }}>+🦴 {diceBet * 2}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: '#a08050' }}>
                  <span>Caught cheating</span><span style={{ color: '#bf5a5a' }}>-🦴 {Math.ceil(diceBet * 1.2)} + 30% HP</span>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer select-none rounded p-3"
                style={{ background: '#120e06', border: `1px solid ${diceCheat ? '#6a3010' : '#2a1e0e'}` }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: diceCheat ? '#d4804a' : '#a08050' }}>Load the dice</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a4a30' }}>
                    {diceCheat
                      ? `Catch chance: ${Math.round(Math.max(5, 45 - cunning * 4))}% — your cunning (${cunning}) helps`
                      : 'Increase payout. Increase risk. Your cunning helps dodge detection.'}
                  </p>
                </div>
                <div className="relative shrink-0 ml-3">
                  <input type="checkbox" className="sr-only" checked={diceCheat} onChange={e => setDiceCheat(e.target.checked)} />
                  <div style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: diceCheat ? '#7a3010' : '#2e2518',
                    border: `1px solid ${diceCheat ? '#c05020' : '#4a3520'}`,
                    transition: 'all 0.2s',
                    boxShadow: diceCheat ? '0 0 8px rgba(200,80,30,0.3)' : 'none',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: diceCheat ? '23px' : '3px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: diceCheat ? '#e8804a' : '#a08868',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              </label>

              <button
                className="btn-primary w-full py-3"
                disabled={bones < diceBet}
                onClick={playDice}>
                {bones < diceBet ? 'Not enough bones' : 'Roll'}
              </button>
            </div>
          )}

          {diceRolling && (
            <div className="text-center py-8">
              <p className="text-4xl mb-3 animate-pulse">🎲🎲🎲</p>
              <p className="text-sm" style={{ color: '#a08050' }}>The dice are rolling...</p>
            </div>
          )}

          {diceResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded p-3 text-center" style={{ background: '#0e0c08', border: '1px solid #3a2810' }}>
                  <p className="text-xs mb-2 font-bold" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>You</p>
                  <div className="flex justify-center gap-2 mb-2" style={{ minHeight: '2rem' }}>
                    {[0,1,2].map(i => (
                      <span key={i} className="text-3xl transition-all duration-300" style={{
                        opacity: playerShown > i ? 1 : 0.15,
                        transform: playerShown > i ? 'scale(1)' : 'scale(0.6)',
                      }}>
                        {playerShown > i ? DIE_FACES[diceResult.playerDice[i]-1] : '🎲'}
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#d4a843', opacity: playerShown >= 3 ? 1 : 0, transition: 'opacity 0.3s' }}>{diceResult.playerTotal}</p>
                </div>
                <div className="rounded p-3 text-center" style={{ background: '#0e0c08', border: '1px solid #3a2810' }}>
                  <p className="text-xs mb-2 font-bold" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>House</p>
                  <div className="flex justify-center gap-2 mb-2" style={{ minHeight: '2rem' }}>
                    {[0,1,2].map(i => (
                      <span key={i} className="text-3xl transition-all duration-300" style={{
                        opacity: houseShown > i ? 1 : playerShown >= 3 ? 0.15 : 0,
                        transform: houseShown > i ? 'scale(1)' : 'scale(0.6)',
                      }}>
                        {houseShown > i ? DIE_FACES[diceResult.houseDice[i]-1] : '🎲'}
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#a08050', opacity: houseShown >= 3 ? 1 : 0, transition: 'opacity 0.3s' }}>{diceResult.houseTotal}</p>
                </div>
              </div>

              {showOutcome && <div className="rounded p-4 text-center fade-in" style={{
                background: diceResult.outcome === 'cheat_caught' ? '#2a0808'
                  : diceResult.outcome === 'win' || diceResult.outcome === 'cheat_win' ? '#0a1f0a'
                  : '#1a1208',
                border: `1px solid ${diceResult.outcome === 'cheat_caught' ? '#7a1515'
                  : diceResult.outcome === 'win' || diceResult.outcome === 'cheat_win' ? '#2a6428'
                  : '#3a2810'}`,
              }}>
                {diceResult.outcome === 'win' && (
                  <>
                    <p className="font-bold mb-1" style={{ color: '#5abf6a', fontFamily: 'var(--font-cinzel, Georgia)' }}>Victory</p>
                    <p className="text-xs" style={{ color: '#a08050' }}>The house pays up. They look displeased.</p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#5abf6a' }}>+🦴 {diceResult.boneDelta}</p>
                  </>
                )}
                {diceResult.outcome === 'cheat_win' && (
                  <>
                    <p className="font-bold mb-1" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>Cunning Victory</p>
                    <p className="text-xs" style={{ color: '#a08050' }}>Nobody noticed. Probably.</p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#d4a843' }}>+🦴 {diceResult.boneDelta}</p>
                  </>
                )}
                {diceResult.outcome === 'loss' && (
                  <>
                    <p className="font-bold mb-1" style={{ color: '#bf5a5a', fontFamily: 'var(--font-cinzel, Georgia)' }}>Defeat</p>
                    <p className="text-xs" style={{ color: '#a08050' }}>The house wins. It usually does.</p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#bf5a5a' }}>{diceResult.boneDelta} 🦴</p>
                  </>
                )}
                {diceResult.outcome === 'cheat_caught' && (
                  <>
                    <p className="font-bold mb-1" style={{ color: '#bf5a5a', fontFamily: 'var(--font-cinzel, Georgia)' }}>Caught.</p>
                    <p className="text-xs" style={{ color: '#c07070' }}>The bar goes quiet. Then everyone stands up.</p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#bf5a5a' }}>{diceResult.boneDelta} 🦴 · -{Math.floor(maxHp * 0.30)} HP</p>
                  </>
                )}
                {diceResult.outcome === 'draw' && (
                  <>
                    <p className="font-bold mb-1" style={{ color: '#a08050', fontFamily: 'var(--font-cinzel, Georgia)' }}>Draw</p>
                    <p className="text-xs" style={{ color: '#a08050' }}>Identical totals. Your bet is returned.</p>
                  </>
                )}
              </div>}

              {showOutcome && <p className="text-xs text-center" style={{ color: '#5a4a30' }}>Come back tomorrow for another game.</p>}
            </div>
          )}
        </div>
      )}

      {tab === 'quest' && (
        <div>
          {!quest ? (
            <div className="panel text-center py-8">
              <p className="text-3xl mb-3">🎲</p>
              <p className="text-sm" style={{ color: '#a08050' }}>Nothing unusual happening right now. Come back later. Or don't. The tavern will be here either way.</p>
            </div>
          ) : (
            <div className="panel" style={{ borderColor: questDone ? '#4a3520' : '#6a5a2a', borderTop: `2px solid ${questDone ? '#4a3520' : '#9a8030'}` }}>
              <p className="font-bold mb-3" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)' }}>⚡ A Situation Has Developed</p>
              {!questDone ? (
                <>
                  <p className="text-sm mb-4" style={{ color: '#e8d5b0' }}>{quest.prompt}</p>
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1 text-sm" disabled={loading === 'quest'} onClick={() => handleQuest(true)}>
                      {quest.acceptLabel}
                    </button>
                    <button className="btn-ghost flex-1 text-sm" disabled={loading === 'quest'} onClick={() => handleQuest(false)}>
                      {quest.declineLabel}
                    </button>
                  </div>
                </>
              ) : (
                <div className="fade-in space-y-3">
                  <p className="text-sm italic" style={{ color: '#a08050' }}>{questOutcome}</p>
                  {(quest.bonesDelta || quest.hpDelta || quest.xpDelta) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {quest.bonesDelta != null && quest.bonesDelta !== 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: quest.bonesDelta > 0 ? '#0e2410' : '#2a0808', color: quest.bonesDelta > 0 ? '#5abf6a' : '#bf5a5a', border: `1px solid ${quest.bonesDelta > 0 ? '#2a6428' : '#6a2828'}` }}>
                          🦴 {quest.bonesDelta > 0 ? `+${quest.bonesDelta}` : quest.bonesDelta} bones
                        </span>
                      )}
                      {quest.hpDelta != null && quest.hpDelta !== 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: quest.hpDelta > 0 ? '#0e2410' : '#2a0808', color: quest.hpDelta > 0 ? '#5abf6a' : '#bf5a5a', border: `1px solid ${quest.hpDelta > 0 ? '#2a6428' : '#6a2828'}` }}>
                          ❤ {quest.hpDelta > 0 ? `+${quest.hpDelta}` : quest.hpDelta} HP
                        </span>
                      )}
                      {quest.xpDelta != null && quest.xpDelta > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: '#0e2410', color: '#5abf6a', border: '1px solid #2a6428' }}>
                          ✦ +{quest.xpDelta} XP
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
