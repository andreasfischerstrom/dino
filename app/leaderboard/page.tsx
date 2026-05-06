import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES } from '@/lib/game-data'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: top } = await supabase
    .from('characters')
    .select('id, name, species, level, wins, losses, kills, alive, bones')
    .order('kills', { ascending: false })
    .limit(25)

  const { data: dead } = await supabase
    .from('characters')
    .select('id, name, species, level, wins, losses, kills')
    .eq('alive', false)
    .order('kills', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl font-bold" style={{ color: '#c8a84b' }}>Hall of Carnage</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: '#5a4a3a' }}>
        The living, ranked by body count. The dead, remembered below.
      </p>

      <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>⚔️ Active Gladiators</h2>
      <div className="panel mb-8">
        {(top || []).length === 0 && <p className="text-sm" style={{ color: '#5a4a3a' }}>The arena is empty. This is either peaceful or terrifying.</p>}
        {(top || []).map((char, i) => {
          const sp = SPECIES.find(s => s.id === char.species)
          return (
            <Link key={char.id} href={`/profile/${char.id}`}
              className="flex items-center gap-4 py-3 block transition hover:opacity-80"
              style={{ borderBottom: i < (top?.length || 0) - 1 ? '1px solid #3d2e1e' : 'none', textDecoration: 'none' }}>
              <span className="w-8 text-center font-bold text-lg" style={{ color: i < 3 ? '#c8a84b' : '#5a4a3a' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span className="text-2xl">{sp?.emoji || '🦕'}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: '#e8d5b0' }}>{char.name}</p>
                <p className="text-xs" style={{ color: '#5a4a3a' }}>Lvl {char.level} {sp?.name}</p>
              </div>
              <div className="text-right text-xs" style={{ color: '#8a7a5a' }}>
                <p>💀 {char.kills} kills</p>
                <p>{char.wins}W / {char.losses}L</p>
              </div>
            </Link>
          )
        })}
      </div>

      <h2 className="font-bold mb-3" style={{ color: '#8b2020' }}>☠️ Hall of the Fallen</h2>
      <div className="panel">
        {(dead || []).length === 0 && <p className="text-sm" style={{ color: '#5a4a3a' }}>Nobody has died yet. Give it time.</p>}
        {(dead || []).map((char, i) => {
          const sp = SPECIES.find(s => s.id === char.species)
          return (
            <div key={char.id} className="flex items-center gap-4 py-3"
              style={{ borderBottom: i < (dead?.length || 0) - 1 ? '1px solid #3d2e1e' : 'none', opacity: 0.7 }}>
              <span className="text-2xl grayscale">{sp?.emoji || '🦕'}</span>
              <div className="flex-1">
                <p className="font-bold text-sm line-through" style={{ color: '#8a7a5a' }}>{char.name}</p>
                <p className="text-xs" style={{ color: '#3a2a1a' }}>Lvl {char.level} {sp?.name} · Died in battle</p>
              </div>
              <div className="text-right text-xs" style={{ color: '#5a4a3a' }}>
                <p>💀 {char.kills} kills</p>
                <p>{char.wins}W / {char.losses}L</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
