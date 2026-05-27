export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES, STATS, GEAR_SLOTS, xpForLevel, maxHp } from '@/lib/game-data'
import { getEquippedGear, computeGearBonus } from '@/lib/stats'
import SignOutButton from '@/components/SignOutButton'
import CharacterCard from '@/components/CharacterCard'
import { alreadyFoughtToday, generateDailyBoss, todayUTC } from '@/lib/daily-boss'

const regenPerMinute = (maxHp: number) => maxHp / 60

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Deterministic pick so text doesn't change on re-render
function pick<T>(arr: T[], seed: string, offset = 0): T {
  let h = offset * 2654435761
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  return arr[Math.abs(h) % arr.length]
}

interface FeedEntry {
  key: string
  icon: string
  text: string
  fatal?: boolean
  notable?: boolean
  createdAt: string
  mine?: boolean
}

function buildFeed(
  battles: Record<string, unknown>[],
  charMap: Record<string, { name: string }>,
  newArrivals: { id: string; name: string; species: string; created_at: string }[],
  myId: string,
): FeedEntry[] {
  const entries: FeedEntry[] = []

  for (const b of battles) {
    const result = b.battle_result as Record<string, unknown>
    const isMob = (result?.opponentType as string) === 'mob'
    const challId = b.challenger_id as string
    const challedId = b.challenged_id as string | null
    const winnerId = b.winner_id as string | null
    const challSurvived = b.challenger_survived as boolean
    const challedSurvived = b.challenged_survived as boolean
    const challName = charMap[challId]?.name ?? 'A fighter'
    const seed = b.id as string
    const mine = challId === myId || challedId === myId

    if (isMob) {
      const mob = (result?.opponentName as string) ?? 'a creature'
      const aResult = result?.a as Record<string, unknown> | undefined
      const leveledUp = !!aResult?.leveledUp
      const newLevel = aResult?.newLevel as number | undefined

      if (!challSurvived) {
        const text = pick([
          `${challName} was torn apart by ${mob} and won't be coming back`,
          `${mob} made an example of ${challName} in the Bone Pit`,
          `${challName} entered the Bone Pit. ${mob} made sure they didn't leave`,
        ], seed)
        entries.push({ key: seed + '-death', icon: '☠️', text, fatal: true, createdAt: b.created_at as string, mine })
      } else if (winnerId === challId) {
        if (leveledUp && newLevel) {
          const text = pick([
            `${challName} defeated ${mob} and reached level ${newLevel}`,
            `Level ${newLevel}. ${challName} is getting dangerous`,
            `${challName} carved through ${mob} and emerged stronger — level ${newLevel}`,
          ], seed)
          entries.push({ key: seed + '-lvl', icon: '⬆️', text, notable: true, createdAt: b.created_at as string, mine })
        } else {
          const text = pick([
            `${challName} put ${mob} down in the Bone Pit`,
            `${mob} learned to fear ${challName} today`,
            `${challName} left ${mob} in a heap and walked out grinning`,
            `Another ${mob} felled. ${challName} barely broke a sweat`,
          ], seed)
          entries.push({ key: seed, icon: '⚔️', text, createdAt: b.created_at as string, mine })
        }
      } else {
        const text = pick([
          `${challName} thought better of fighting ${mob} and retreated`,
          `${mob} sent ${challName} running. A tactical withdrawal, apparently`,
          `${challName} escaped ${mob} with their life. Barely`,
        ], seed)
        entries.push({ key: seed, icon: '🛡️', text, createdAt: b.created_at as string, mine })
      }
    } else {
      // PvP
      const challedName = challedId ? (charMap[challedId]?.name ?? 'a challenger') : 'a challenger'
      const challedMine = challedId === myId

      if (!winnerId) {
        const text = pick([
          `${challName} and ${challedName} fought to a bloody standstill`,
          `Neither ${challName} nor ${challedName} would yield. The crowd left unsatisfied`,
          `${challName} vs ${challedName} — no winner, no glory`,
        ], seed)
        entries.push({ key: seed, icon: '🤝', text, createdAt: b.created_at as string, mine: mine || challedMine })
      } else {
        const winnerName = charMap[winnerId]?.name ?? 'A fighter'
        const loserId = winnerId === challId ? challedId : challId
        const loserName = loserId ? (charMap[loserId]?.name ?? 'their opponent') : 'their opponent'
        const loserSurvived = winnerId === challId ? challedSurvived : challSurvived
        const wMine = winnerId === myId || loserId === myId

        if (!loserSurvived) {
          const text = pick([
            `${winnerName} struck down ${loserName} in the Colosseum. ${loserName} will not return`,
            `${loserName} is dead. ${winnerName} made sure of it`,
            `The Colosseum claims another — ${loserName} fell to ${winnerName}`,
          ], seed)
          entries.push({ key: seed, icon: '💀', text, fatal: true, createdAt: b.created_at as string, mine: wMine })
        } else {
          const text = pick([
            `${winnerName} put ${loserName} in the dirt`,
            `${loserName} walked away humbled. ${winnerName} made their point`,
            `The Colosseum roared as ${winnerName} bested ${loserName}`,
            `${winnerName} vs ${loserName} — no contest`,
          ], seed)
          entries.push({ key: seed, icon: '⚔️', text, createdAt: b.created_at as string, mine: wMine })
        }
      }
    }
  }

  // New arrivals
  for (const c of newArrivals) {
    if (c.id === myId) continue
    const sp = SPECIES.find(s => s.id === c.species)
    const text = pick([
      `${sp?.emoji ?? ''} ${c.name} has arrived. Another fighter enters the fray`,
      `A new ${sp?.name ?? 'creature'} named ${c.name} just walked through the gates`,
      `${c.name} is here. The pit grows more crowded`,
    ], c.id)
    entries.push({ key: 'arrival-' + c.id, icon: '🦕', text, createdAt: c.created_at, notable: true })
  }

  // Sort by time, newest first, take top 10
  return entries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}

export default async function TownPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')

  const { data: unseenBattle } = await supabase
    .from('battles')
    .select('id, challenger_id, challenged_id')
    .or(`and(challenger_id.eq.${character.id},challenger_seen.eq.false),and(challenged_id.eq.${character.id},challenged_seen.eq.false)`)
    .not('battle_result', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (unseenBattle) redirect(`/replay/${unseenBattle.id}`)
  if (!character.alive) redirect('/obituary')

  const lastVisitRaw = character.last_regen_at ?? character.created_at

  if (character.hp < character.max_hp) {
    const lastRegen = new Date(lastVisitRaw)
    const minutesElapsed = Math.min((Date.now() - lastRegen.getTime()) / 60000, 1440)
    if (!isNaN(minutesElapsed) && minutesElapsed > 0) {
      const regenAmount = Math.floor(minutesElapsed * regenPerMinute(character.max_hp))
      if (regenAmount >= 1) {
        const newHp = Math.min(character.max_hp, character.hp + regenAmount)
        await supabase.from('characters').update({ hp: newHp, last_regen_at: new Date().toISOString() }).eq('id', character.id)
        character.hp = newHp
      } else {
        await supabase.from('characters').update({ last_regen_at: new Date().toISOString() }).eq('id', character.id)
      }
    }
  } else {
    await supabase.from('characters').update({ last_regen_at: new Date().toISOString() }).eq('id', character.id)
  }

  const daysSinceVisit = (Date.now() - new Date(lastVisitRaw).getTime()) / (1000 * 60 * 60 * 24)
  const returnLine = (() => {
    if (daysSinceVisit < 1) return null
    const days = Math.floor(daysSinceVisit)
    if (days === 1) return pick([
      'A day away. The pit survived without you.',
      'You were gone a day. Things got along just fine.',
      'One day. Not long enough to be forgotten. Yet.',
    ], character.id, 0)
    if (days <= 3) return pick([
      `${days} days gone. Your bones are still here, at least.`,
      `Back after ${days} days. The arena didn't wait.`,
      `${days} days away. No one filled your spot — no one wanted it.`,
    ], character.id, 1)
    if (days <= 6) return pick([
      `Nearly a week. The dust on your boots shows it.`,
      `${days} days. Whatever kept you, it better have been worth it.`,
      `${days} days absent. The town noticed. Sort of.`,
    ], character.id, 2)
    return pick([
      `${days} days. A long absence for a fighter of your standing.`,
      `You've been gone ${days} days. The pit has a long memory.`,
      `${days} days away. Some thought you weren't coming back.`,
    ], character.id, 3)
  })()

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id, equipped')
    .eq('character_id', character.id)

  const equippedGear = getEquippedGear(inventory || [])
  const gearBonus = computeGearBonus(equippedGear)
  const buffs: { stat: string; bonus: number; label: string }[] = character.buffs || []

  const baseConstitution = (character.stats as Record<string, number>).constitution || 0
  const gearConBonus = (gearBonus['constitution'] as number) || 0
  const effectiveMaxHp = maxHp(baseConstitution + gearConBonus)
  if (effectiveMaxHp !== character.max_hp) {
    const syncedHp = Math.min(character.hp, effectiveMaxHp)
    await supabase.from('characters').update({ max_hp: effectiveMaxHp, hp: syncedHp }).eq('id', character.id)
    character.max_hp = effectiveMaxHp
    character.hp = syncedHp
  }

  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const [
    { data: incomingChallenges },
    { data: recentBattles },
    { data: newArrivals },
  ] = await Promise.all([
    supabase
      .from('challenges')
      .select('id, challenger:challenger_id(name, species, level)')
      .eq('challenged_id', character.id)
      .eq('status', 'pending'),
    supabase
      .from('battles')
      .select('id, winner_id, challenger_id, challenged_id, challenger_survived, challenged_survived, battle_result, created_at')
      .not('battle_result', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('characters')
      .select('id, name, species, created_at')
      .gt('created_at', twoDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const dailyBoss = generateDailyBoss(todayUTC(), character.level)
  const foughtToday = alreadyFoughtToday(character.last_daily_at ?? null)

  const feedBattles = recentBattles || []
  const feedCharIds = [...new Set(feedBattles.flatMap(b => [b.challenger_id, b.challenged_id]).filter(Boolean))] as string[]
  const { data: feedChars } = feedCharIds.length
    ? await supabase.from('characters').select('id, name').in('id', feedCharIds)
    : { data: [] }
  const charMap = Object.fromEntries((feedChars || []).map(c => [c.id, { name: c.name as string }]))

  const feed = buildFeed(feedBattles, charMap, newArrivals || [], character.id as string)

  const species = SPECIES.find(s => s.id === character.species)
  const xpCurrent = xpForLevel(character.level)
  const xpForNext = xpForLevel(character.level + 1)
  const hpPct = Math.round((character.hp / character.max_hp) * 100)

  const statRows = STATS.map(stat => {
    const base = (character.stats as Record<string, number>)[stat.key] || 0
    const gear = gearBonus[stat.key] || 0
    const buff = buffs.filter(b => b.stat === stat.key).reduce((s, b) => s + b.bonus, 0)
    return { key: stat.key, label: stat.label, emoji: stat.emoji, description: stat.description, base, gear, buff, total: base + gear + buff }
  })

  const slotItems = GEAR_SLOTS.map(s => ({
    key: s.key,
    label: s.label,
    emoji: s.emoji,
    item: equippedGear.find(g => g.slot === s.key)
      ? { name: equippedGear.find(g => g.slot === s.key)!.name, emoji: equippedGear.find(g => g.slot === s.key)!.emoji }
      : null,
  }))

  const challenges = incomingChallenges || []

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">

      <div className="md:hidden flex justify-end mb-4">
        <SignOutButton />
      </div>

      {returnLine && (
        <p className="text-sm mb-4" style={{
          color: '#7a6848',
          fontStyle: 'italic',
          paddingLeft: '2px',
        }}>
          {returnLine}
        </p>
      )}

      <CharacterCard
        name={character.name}
        image={character.image_url ?? species?.image ?? null}
        speciesEmoji={species?.emoji ?? '🦕'}
        speciesName={species?.name ?? ''}
        level={character.level}
        hp={character.hp}
        maxHp={character.max_hp}
        xp={character.xp}
        xpCurrent={xpCurrent}
        xpForNext={xpForNext}
        statPoints={character.stat_points || 0}
        characterId={character.id}
        kills={character.kills}
        wins={character.wins}
        losses={character.losses}
        bones={character.bones}
        stats={statRows}
        slots={slotItems}
        buffs={buffs}
        passiveName={species?.passive?.name}
        passiveDescription={species?.passive?.description}
        lastRegenAt={character.last_regen_at ?? character.created_at}
        regenPerMinute={regenPerMinute(character.max_hp)}
      />

      {hpPct < 30 && (
        <div className="mt-4 p-3 rounded text-sm" style={{
          background: 'linear-gradient(135deg, #2a0808 0%, #1a0505 100%)',
          border: '1px solid #7a1515',
          color: '#c06060',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          ⚠️ HP critically low ({hpPct}%). Visit the Tavern before challenging anyone.
        </div>
      )}

      {/* Events — always visible */}
      <div className="mt-4 panel">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{
          color: '#7a6848',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.1em',
        }}>
          Awaiting you
        </p>
        <div className="space-y-2">
          {challenges.length > 0 ? (
            challenges.map((c: Record<string, unknown>) => {
              const challenger = c.challenger as Record<string, unknown> | null
              const sp = SPECIES.find(s => s.id === challenger?.species)
              return (
                <Link key={c.id as string} href="/arena" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{
                    background: '#1a0e06', border: '1px solid #5a2e10',
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>⚔️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: '#e8d5b0' }}>
                        {sp?.emoji} {challenger?.name as string ?? 'Someone'}{' '}
                        <span style={{ color: '#a07848', fontWeight: 400 }}>has challenged you</span>
                      </p>
                      <p className="text-xs" style={{ color: '#a07848' }}>Lvl {challenger?.level as number} · Accept or decline in the Colosseum</p>
                    </div>
                    <span style={{ color: '#d4a843', fontSize: '12px', flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{
              border: '1px solid #2a2018',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0, opacity: 0.35 }}>⚔️</span>
              <p className="text-sm" style={{ color: '#6a5840' }}>No challenges pending</p>
            </div>
          )}

          {!foughtToday ? (
            <Link href="/arena" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{
                background: '#0e1a0a', border: '1px solid #3a5018',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#e8d5b0' }}>Daily trial ready</p>
                  <p className="text-xs" style={{ color: '#7aaa48' }}>{dailyBoss.fullName} awaits · Fight in the Colosseum</p>
                </div>
                <span style={{ color: '#d4a843', fontSize: '12px', flexShrink: 0 }}>→</span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{
              border: '1px solid #2a2018',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0, opacity: 0.35 }}>🏆</span>
              <p className="text-sm" style={{ color: '#6a5840' }}>Daily trial complete · Come back tomorrow</p>
            </div>
          )}
        </div>
      </div>

      {/* World feed */}
      {feed.length > 0 && (
        <div className="mt-4 panel">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{
            color: '#7a6848',
            fontFamily: 'var(--font-cinzel, Georgia)',
            letterSpacing: '0.1em',
          }}>
            From the arena
          </p>
          <p className="text-xs mb-4" style={{ color: '#6a5840', fontStyle: 'italic' }}>
            Word travels fast in a small settlement.
          </p>
          <div>
            {feed.map((entry, i) => (
              <div key={entry.key} className="flex items-start gap-3 py-2.5" style={{
                borderTop: i > 0 ? '1px solid #110d08' : 'none',
              }}>
                <span style={{
                  fontSize: '13px',
                  lineHeight: '21px',
                  flexShrink: 0,
                  width: '20px',
                  textAlign: 'center',
                }}>
                  {entry.icon}
                </span>
                <p className="flex-1 text-sm leading-relaxed" style={{
                  color: entry.mine
                    ? '#c8a84b'
                    : entry.fatal
                      ? '#c07060'
                      : entry.notable
                        ? '#9aaa60'
                        : '#9a8a6a',
                  fontStyle: entry.notable ? 'italic' : 'normal',
                }}>
                  {entry.text}
                </p>
                <span className="text-xs shrink-0 pt-0.5" style={{ color: '#6a5840', minWidth: '40px', textAlign: 'right' }}>
                  {relativeTime(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
