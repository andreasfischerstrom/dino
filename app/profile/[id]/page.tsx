import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES, STATS, GEAR } from '@/lib/game-data'
import DeleteCharacterButton from '@/components/DeleteCharacterButton'

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
    .select('id, winner_id, challenger_id, challenged_id, challenger_survived, challenged_survived, created_at')
    .or(`challenger_id.eq.${id},challenged_id.eq.${id}`)
    .order('created_at', { ascending: false })
    .limit(10)

  const sp = SPECIES.find(s => s.id === character.species)
  const hpPct = Math.round((character.hp / character.max_hp) * 100)
  const equippedGear = (inventory || [])
    .filter((i: { equipped: boolean }) => i.equipped)
    .map((i: { gear_id: string }) => GEAR.find(g => g.id === i.gear_id))
    .filter(Boolean)

  const isOwn = character.user_id === user.id

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl font-bold flex-1" style={{ color: character.alive ? '#c8a84b' : '#8a7a5a' }}>
          {character.alive ? '' : '☠️ '}{character.name}
        </h1>
        {isOwn && <DeleteCharacterButton />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Identity */}
        <div className="panel">
          <div className="flex items-center gap-4 mb-4">
            {character.image_url
              ? <img src={character.image_url} alt={character.name} className="w-20 h-20 rounded-lg object-cover" style={{ border: '2px solid #c8a84b' }} />
              : <div className="text-6xl">{sp?.emoji}</div>}
            <div>
              <p className="font-bold" style={{ color: '#c8a84b' }}>{character.name}</p>
              <p className="text-sm" style={{ color: '#8a7a5a' }}>Lvl {character.level} {sp?.name}</p>
              {!character.alive && <p className="text-xs mt-1" style={{ color: '#8b2020' }}>☠️ Deceased</p>}
            </div>
          </div>
          <div className="space-y-1 text-sm" style={{ color: '#8a7a5a' }}>
            <p>💀 {character.kills} kills · ✅ {character.wins}W / {character.losses}L</p>
            <p>🦴 {character.bones} bones</p>
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

        {/* Stats */}
        <div className="panel">
          <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>Stats</h2>
          <div className="space-y-2">
            {STATS.map(stat => {
              const val = (character.stats as Record<string, number>)[stat.key] || 0
              return (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-sm w-4">{stat.emoji}</span>
                  <span className="text-xs w-20" style={{ color: '#8a7a5a' }}>{stat.label}</span>
                  <div className="flex-1 stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${Math.min(100, val * 7)}%` }} />
                  </div>
                  <span className="text-xs w-4 text-right font-bold" style={{ color: '#c8a84b' }}>{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Equipped gear */}
      {equippedGear.length > 0 && (
        <div className="panel mb-6">
          <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>Equipped Gear</h2>
          <div className="flex flex-wrap gap-3">
            {equippedGear.map((item: typeof GEAR[number] | undefined) => item && (
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
          <div className="space-y-2">
            {battles.map((b: Record<string, unknown>) => {
              const isChallenger = b.challenger_id === id
              const won = b.winner_id === id
              const survived = isChallenger ? b.challenger_survived : b.challenged_survived
              return (
                <div key={b.id as string} className="flex items-center justify-between py-2 text-sm"
                  style={{ borderBottom: '1px solid #1a1410' }}>
                  <span style={{ color: won ? '#6abf6a' : '#bf6a6a' }}>
                    {won ? '✅ Win' : b.winner_id ? '❌ Loss' : '🤝 Draw'}
                    {!survived && ' (fatal)'}
                  </span>
                  <span className="text-xs" style={{ color: '#5a4a3a' }}>
                    {new Date(b.created_at as string).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
