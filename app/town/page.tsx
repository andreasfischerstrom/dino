export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES, STATS, GEAR_SLOTS, xpForLevel, maxHp } from '@/lib/game-data'
import { getEquippedGear, computeGearBonus } from '@/lib/stats'
import SignOutButton from '@/components/SignOutButton'
import CharacterCard from '@/components/CharacterCard'

// Full regen in 1 hour: maxHp / 60 HP per minute
const regenPerMinute = (maxHp: number) => maxHp / 60

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
  if (!character.alive) redirect('/obituary')

  if (character.hp < character.max_hp) {
    const lastRegenRaw = character.last_regen_at ?? character.created_at
    const lastRegen = new Date(lastRegenRaw)
    const minutesElapsed = Math.min((Date.now() - lastRegen.getTime()) / 60000, 1440)
    if (!isNaN(minutesElapsed) && minutesElapsed > 0) {
      const regenAmount = Math.floor(minutesElapsed * regenPerMinute(character.max_hp))
      if (regenAmount >= 1) {
        const newHp = Math.min(character.max_hp, character.hp + regenAmount)
        await supabase.from('characters').update({ hp: newHp, last_regen_at: new Date().toISOString() }).eq('id', character.id)
        character.hp = newHp
      }
    }
  }

  const { data: inventory } = await supabase
    .from('inventory')
    .select('gear_id, equipped')
    .eq('character_id', character.id)

  const equippedGear = getEquippedGear(inventory || [])
  const gearBonus = computeGearBonus(equippedGear)
  const buffs: { stat: string; bonus: number; label: string }[] = character.buffs || []

  // Sync max_hp to effective value (base + gear constitution) in case it drifted
  const baseConstitution = (character.stats as Record<string, number>).constitution || 0
  const gearConBonus = (gearBonus['constitution'] as number) || 0
  const effectiveMaxHp = maxHp(baseConstitution + gearConBonus)
  if (effectiveMaxHp !== character.max_hp) {
    const syncedHp = Math.min(character.hp, effectiveMaxHp)
    await supabase.from('characters').update({ max_hp: effectiveMaxHp, hp: syncedHp }).eq('id', character.id)
    character.max_hp = effectiveMaxHp
    character.hp = syncedHp
  }

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

  const locations = [
    { href: '/training',              name: 'The Bone Pit',       desc: 'Train against mobs. Gain XP. Try not to embarrass yourself.',          img: '/images/bonepit.png' },
    { href: '/arena',                 name: 'The Colosseum',       desc: 'Challenge other players. Glory or death. Mostly glory, hopefully.',     img: '/images/colosseum.png' },
    { href: '/shop',                  name: "Grubclaw's Smithy",   desc: 'Buy weapons and armor. Grubclaw has three fingers. The quality varies.', img: '/images/smithy.png' },
    { href: '/tavern',                name: 'Tar Pit Tavern',      desc: 'Heal up, buy consumables, and take on questionable side quests.',       img: '/images/tavern.png' },
    { href: '/leaderboard',           name: 'Hall of Carnage',     desc: 'The top fighters. Ranked by kills, wins, and force of personality.',    img: '/images/halloffame.png' },
    { href: `/profile/${character.id}`, name: 'Your Profile',     desc: 'View your stats, gear, and battle history.',                            img: '/images/profile.png' },
  ]

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-4xl font-bold leading-none" style={{
            fontFamily: 'var(--font-cinzel-deco, var(--font-cinzel, Georgia))',
            color: '#d4a843',
            textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 24px rgba(212,168,67,0.2)',
            letterSpacing: '0.06em',
          }}>
            Jurassic Brawl
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#a08050', fontStyle: 'italic' }}>
            A mid-sized prehistoric settlement. Smells like ambition and bad choices.
          </p>
        </div>
        <SignOutButton />
      </div>

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
        <div className="mb-5 p-3 rounded text-sm" style={{
          background: 'linear-gradient(135deg, #2a0808 0%, #1a0505 100%)',
          border: '1px solid #7a1515',
          color: '#c06060',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 12px rgba(155,24,24,0.12)',
        }}>
          ⚠️ HP critically low ({hpPct}%). Visit the Tavern before challenging anyone.
          Passive regen: full HP in 1 hour.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <Link key={loc.href} href={loc.href} className="location-card" style={{ minHeight: '185px' }}>
            {loc.img && (
              <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${loc.img})` }} />
            )}
            <div className="absolute inset-0" style={{
              background: loc.img
                ? 'linear-gradient(to top, rgba(8,5,2,0.96) 35%, rgba(8,5,2,0.5) 70%, rgba(8,5,2,0.2) 100%)'
                : 'linear-gradient(135deg, #1a1410 0%, #0d0a06 100%)',
            }} />
            <div className="relative p-4 flex flex-col justify-end h-full" style={{ minHeight: '185px' }}>
              <h3 className="font-bold text-base mb-1" style={{
                color: '#d4a843',
                fontFamily: 'var(--font-cinzel, Georgia)',
                letterSpacing: '0.04em',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              }}>
                {loc.name}
              </h3>
              <p className="text-xs" style={{ color: '#8a7a58', lineHeight: '1.5' }}>{loc.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
