export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES, STATS, GEAR_SLOTS, xpForLevel } from '@/lib/game-data'
import { getEquippedGear, computeGearBonus } from '@/lib/stats'
import SignOutButton from '@/components/SignOutButton'
import CharacterCard from '@/components/CharacterCard'

const HP_REGEN_PER_MINUTE = 6

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

  // HP regen — calculated from last_regen_at, capped at 24h to prevent runaway
  if (character.hp < character.max_hp) {
    const lastRegenRaw = character.last_regen_at ?? character.created_at
    const lastRegen = new Date(lastRegenRaw)
    const minutesElapsed = Math.min((Date.now() - lastRegen.getTime()) / 60000, 1440)
    if (!isNaN(minutesElapsed) && minutesElapsed > 0) {
      const regenAmount = Math.floor(minutesElapsed * HP_REGEN_PER_MINUTE)
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

  const species = SPECIES.find(s => s.id === character.species)
  const xpCurrent = xpForLevel(character.level)
  const xpForNext = xpForLevel(character.level + 1)
  const hpPct = Math.round((character.hp / character.max_hp) * 100)

  // Pre-compute stat rows for CharacterCard
  const statRows = STATS.map(stat => {
    const base = (character.stats as Record<string, number>)[stat.key] || 0
    const gear = gearBonus[stat.key] || 0
    const buff = buffs.filter(b => b.stat === stat.key).reduce((s, b) => s + b.bonus, 0)
    return { key: stat.key, label: stat.label, emoji: stat.emoji, base, gear, buff, total: base + gear + buff }
  })

  // Pre-compute equipment slots for CharacterCard
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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#c8a84b' }}>Gorgon's Gulch</h1>
          <p className="text-sm mt-1" style={{ color: '#5a4a3a' }}>A mid-sized prehistoric settlement. Smells like ambition.</p>
        </div>
        <SignOutButton />
      </div>

      <CharacterCard
        name={character.name}
        image={character.image_url ?? null}
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
      />

      {hpPct < 30 && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#3a0f0f', border: '1px solid #8b2020', color: '#bf6a6a' }}>
          ⚠️ HP critically low ({hpPct}%). Visit the Tavern before challenging anyone. Regen: {HP_REGEN_PER_MINUTE} HP/min passively.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <Link key={loc.href} href={loc.href}
            className="hover:scale-[1.02] transition-transform block rounded-lg overflow-hidden relative"
            style={{ textDecoration: 'none', minHeight: '160px', border: '1px solid #3d2e1e' }}>
            {loc.img && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loc.img})` }} />}
            <div className="absolute inset-0" style={{ background: loc.img
              ? 'linear-gradient(to top, rgba(10,7,4,0.92) 40%, rgba(10,7,4,0.45) 100%)'
              : 'linear-gradient(135deg, #1a1410 0%, #0d0d0d 100%)' }} />
            <div className="relative p-4 flex flex-col justify-end h-full" style={{ minHeight: '160px' }}>
              <h3 className="font-bold text-base mb-1" style={{ color: '#c8a84b' }}>{loc.name}</h3>
              <p className="text-xs" style={{ color: '#8a7a5a' }}>{loc.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
