import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES, STATS, GEAR, GEAR_SLOTS, xpForLevel } from '@/lib/game-data'
import { getEquippedGear, computeGearBonus } from '@/lib/stats'
import DeleteCharacterButton from '@/components/DeleteCharacterButton'
import CharacterCard from '@/components/CharacterCard'
import ReadOnlyStatsPanel from '@/components/ReadOnlyStatsPanel'
import { Icon } from '@iconify/react'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single()

  if (!character) return <div className="p-8 text-center" style={{ color: '#5a4a3a' }}>Character not found or has been eaten.</div>

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id, equipped')
    .eq('character_id', id)

  const { data: battles } = await supabase
    .from('battles')
    .select('id, winner_id, challenger_id, challenged_id, challenger_survived, challenged_survived, battle_result, created_at')
    .or(`challenger_id.eq.${id},challenged_id.eq.${id}`)
    .order('created_at', { ascending: false })
    .limit(10)

  const opponentIds = [...new Set((battles || []).map((b: Record<string, unknown>) =>
    b.challenger_id === id ? b.challenged_id : b.challenger_id
  ))].filter(Boolean) as string[]
  const { data: opponents } = opponentIds.length
    ? await supabase.from('characters').select('id, name, level, species').in('id', opponentIds)
    : { data: [] }
  const opponentMap = Object.fromEntries((opponents || []).map((c: Record<string, unknown>) => [c.id, c]))

  const sp = SPECIES.find(s => s.id === character.species)
  const isOwn = character.user_id === user.id

  const equippedGearTemplates = getEquippedGear(inventory || [])
  const gearBonus = computeGearBonus(equippedGearTemplates)
  const buffs: { stat: string; bonus: number; label: string }[] = character.buffs || []

  const statsRows = STATS.map(stat => {
    const base = (character.stats as Record<string, number>)[stat.key] || 0
    const gear = (gearBonus[stat.key] as number) || 0
    const buff = buffs.find(b => b.stat === stat.key)?.bonus || 0
    return { key: stat.key, label: stat.label, emoji: stat.emoji, icon: stat.icon, description: stat.description, base, gear, buff, total: base + gear + buff }
  })

  const slots = GEAR_SLOTS.map(slot => {
    const item = equippedGearTemplates.find(g => g.slot === slot.key)
    return { key: slot.key, label: slot.label, emoji: slot.emoji, item: item ? { name: item.name, emoji: item.emoji } : null }
  })

  const currentLevelXp = xpForLevel(character.level as number)
  const nextLevelXp = xpForLevel((character.level as number) + 1)

  // Inline equipment management (own profile)
  const ownedGear = (inventory || [])
    .map((i: { gear_id: string }) => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean) as typeof GEAR
  const initialEquippedGearIds = (inventory || [])
    .filter((i: { equipped: boolean }) => i.equipped)
    .map((i: { gear_id: string }) => i.gear_id)

  // Read-only stats for other players' profiles
  const hpPct = Math.round((character.hp / character.max_hp) * 100)
  const readOnlyStats = STATS.map(stat => ({
    key: stat.key,
    label: stat.label,
    emoji: stat.emoji,
    icon: stat.icon,
    description: stat.description,
    value: (character.stats as Record<string, number>)[stat.key] || 0,
  }))

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex-1" style={{ color: character.alive ? '#c8a84b' : '#8a7a5a' }}>
          {!character.alive && <><Icon icon="game-icons:skull-crossed-bones" width={14} height={14} />{' '}</>}{character.name}
        </h1>
      </div>

      {isOwn ? (
        <CharacterCard
          name={character.name as string}
          image={(character.image_url as string | null) || sp?.image || null}
          speciesEmoji={sp?.emoji ?? '🦕'}
          speciesName={sp?.name ?? ''}
          level={character.level as number}
          hp={character.hp as number}
          maxHp={character.max_hp as number}
          xp={character.xp as number}
          xpCurrent={currentLevelXp}
          xpForNext={nextLevelXp}
          statPoints={(character.stat_points as number) || 0}
          characterId={character.id as string}
          kills={character.kills as number}
          wins={character.wins as number}
          losses={character.losses as number}
          bones={character.bones as number}
          stats={statsRows}
          slots={slots}
          buffs={buffs}
          passiveName={sp?.passive?.name}
          passiveDescription={sp?.passive?.description}
          lastRegenAt={character.last_regen_at as string | undefined}
          regenPerMinute={(character.max_hp as number) / 60}
          ownedGear={ownedGear}
          initialEquippedGearIds={initialEquippedGearIds}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Identity */}
          <div className="panel">
            <div className="flex items-center gap-4 mb-4">
              {character.image_url || sp?.image
                ? <img src={(character.image_url || sp?.image) as string} alt={character.name as string} className="w-20 h-20 rounded-lg object-cover" style={{ border: '2px solid #c8a84b' }} />
                : <div className="text-6xl">{sp?.emoji}</div>}
              <div>
                <p className="font-bold" style={{ color: '#c8a84b' }}>{character.name}</p>
                <p className="text-sm" style={{ color: '#8a7a5a' }}>Lvl {character.level} {sp?.name}</p>
                {!character.alive && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#8b2020' }}><Icon icon="game-icons:skull-crossed-bones" width={14} height={14} /> Deceased</p>}
              </div>
            </div>
            <div className="space-y-1 text-sm" style={{ color: '#8a7a5a' }}>
              <p className="flex items-center gap-1 flex-wrap"><Icon icon="game-icons:death-skull" width={14} height={14} /> {character.kills} kills · <Icon icon="lucide:circle-check" width={12} height={12} style={{ color: '#5abf6a' }} /> {character.wins}W / {character.losses}L</p>
              <p className="flex items-center gap-1"><Icon icon="ph:bone-fill" width={14} height={14} /> {character.bones} bones</p>
            </div>
            {character.alive && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#5a4a3a' }}>
                  <span>HP</span><span>{character.hp}/{character.max_hp}</span>
                </div>
                <div className="stat-bar">
                  <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Stats (read-only with tooltips) */}
          <ReadOnlyStatsPanel stats={readOnlyStats} />
        </div>
      )}

      {/* Equipped gear (other profiles only — CharacterCard handles this for own) */}
      {!isOwn && initialEquippedGearIds.length > 0 && (
        <div className="panel mb-6">
          <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>Equipped Gear</h2>
          <div className="flex flex-wrap gap-3">
            {ownedGear.filter(g => initialEquippedGearIds.includes(g.id)).map(item => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ background: '#0d0d0d', border: '1px solid #c8a84b' }}>
                <span>{item.emoji}</span>
                <span className="text-sm" style={{ color: '#e8d5b0' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battle history */}
      {battles && battles.length > 0 && (
        <div className="panel">
          <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>Recent Battles</h2>
          <div className="space-y-0">
            {battles.map((b: Record<string, unknown>) => {
              const isChallenger = b.challenger_id === id
              const won = b.winner_id === id
              const survived = isChallenger ? b.challenger_survived : b.challenged_survived
              const side = isChallenger ? 'a' : 'b'
              const result = b.battle_result as Record<string, unknown> | null
              const sideResult = result?.[side] as Record<string, unknown> | undefined
              const isMob = (result?.opponentType as string | undefined) === 'mob'
              const opponentId = (isChallenger ? b.challenged_id : b.challenger_id) as string | undefined
              const opponent = opponentId ? opponentMap[opponentId] as Record<string, unknown> | undefined : undefined
              const opSp = SPECIES.find(s => s.id === opponent?.species)
              const mobName = result?.opponentName as string | undefined
              const xpGained = sideResult?.xpGained as number | undefined
              const bonesDelta = sideResult?.bonesDelta as number | undefined
              const hpBefore = sideResult?.hpBefore as number | undefined
              const hpAfter = sideResult?.hpAfter as number | undefined
              const maxHp = sideResult?.maxHp as number | undefined

              return (
                <div key={b.id as string} className="py-3" style={{ borderBottom: '1px solid #1a1410' }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-sm font-bold" style={{ color: won ? '#6abf6a' : b.winner_id ? '#bf6a6a' : '#a08050' }}>
                        {won
                          ? <span className="flex items-center gap-1"><Icon icon="lucide:circle-check" width={12} height={12} style={{ color: '#5abf6a' }} /> Win</span>
                          : b.winner_id
                          ? <span className="flex items-center gap-1"><Icon icon="lucide:x" width={12} height={12} style={{ color: '#bf5a5a' }} /> Loss</span>
                          : <span className="flex items-center gap-1"><Icon icon="game-icons:laurels" width={12} height={12} /> Draw</span>}
                        {!survived && <span style={{ color: '#8b2020' }}> · Fatal</span>}
                      </span>
                      {isMob && mobName && (
                        <span className="ml-2 text-sm" style={{ color: '#8a7a5a' }}>
                          vs <span style={{ color: '#c8a84b' }}>{mobName}</span>
                          <span className="ml-1 text-xs px-1 rounded" style={{ background: '#1a1208', color: '#6a5030', border: '1px solid #3a2810' }}>mob</span>
                        </span>
                      )}
                      {!isMob && opponent && (
                        <span className="ml-2 text-sm" style={{ color: '#8a7a5a' }}>
                          vs {opSp?.emoji} <span style={{ color: '#c8a84b' }}>{opponent.name as string}</span>
                          <span style={{ color: '#5a4a3a' }}> Lvl {opponent.level as number}</span>
                          <span className="ml-1 text-xs px-1 rounded" style={{ background: '#0e1e08', color: '#4a8f5a', border: '1px solid #2a5a20' }}>PvP</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#5a4a3a' }}>
                      {new Date(b.created_at as string).toLocaleDateString()}
                    </span>
                  </div>

                  {sideResult && (
                    <div className="flex flex-wrap gap-1.5">
                      {hpBefore !== undefined && hpAfter !== undefined && maxHp !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a0a0a', color: '#8a5a5a', border: '1px solid #2a1414' }}>
                          ❤ {hpBefore}→{hpAfter}
                        </span>
                      )}
                      {xpGained !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: xpGained > 0 ? '#0a1a0a' : '#141414', color: xpGained > 0 ? '#4a8f5a' : '#5a5a5a', border: `1px solid ${xpGained > 0 ? '#1a4a1a' : '#2a2a2a'}` }}>
                          ✦ {xpGained > 0 ? `+${xpGained}` : xpGained} XP
                        </span>
                      )}
                      {bonesDelta !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1" style={{ background: bonesDelta > 0 ? '#1a1408' : '#141408', color: bonesDelta > 0 ? '#a08050' : '#6a5a3a', border: `1px solid ${bonesDelta > 0 ? '#3a2810' : '#2a2010'}` }}>
                          <Icon icon="ph:bone-fill" width={14} height={14} /> {bonesDelta > 0 ? `+${bonesDelta}` : bonesDelta}
                        </span>
                      )}
                      {!!sideResult.leveledUp && (
                        <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1" style={{ background: '#1a1408', color: '#d4a843', border: '1px solid #4a3010' }}><Icon icon="game-icons:upgrade" width={12} height={12} style={{ color: '#5abf6a' }} /> Level up</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Retire — bottom of page, only for own living character */}
      {isOwn && character.alive && (
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #1e1408' }}>
          <DeleteCharacterButton />
        </div>
      )}
    </div>
  )
}
