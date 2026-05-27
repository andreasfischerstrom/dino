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
    .eq('alive', true)
    .order('kills', { ascending: false })
    .limit(25)

  const { data: dead } = await supabase
    .from('characters')
    .select('id, name, species, level, wins, losses, kills')
    .eq('alive', false)
    .order('level', { ascending: false })
    .order('kills', { ascending: false })
    .order('wins', { ascending: false })
    .limit(25)

  const rankDisplay = (i: number) => {
    if (i === 0) return { text: '🥇', gold: true }
    if (i === 1) return { text: '🥈', gold: false }
    if (i === 2) return { text: '🥉', gold: false }
    return { text: `#${i + 1}`, gold: false }
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/town" className="btn-ghost text-sm">← Town</Link>
        <h1 className="text-3xl page-title">Hall of Carnage</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: '#a08050', fontStyle: 'italic' }}>
        The living, ranked by body count. The dead, remembered below.
      </p>

      <h2 className="font-bold mb-3" style={{ color: '#d4a843', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>⚔️ Active Gladiators</h2>
      <div className="panel mb-8" style={{ padding: '0.5rem 0' }}>
        {(top || []).length === 0 && (
          <p className="text-sm px-6 py-4" style={{ color: '#a08050' }}>The arena is empty. This is either peaceful or terrifying.</p>
        )}
        {(top || []).map((char, i) => {
          const sp = SPECIES.find(s => s.id === char.species)
          const rank = rankDisplay(i)
          return (
            <Link key={char.id} href={`/profile/${char.id}`}
              className="flex items-center gap-4 px-4 py-3 block row-hover"
              style={{
                borderBottom: i < (top?.length || 0) - 1 ? '1px solid #2a1e0e' : 'none',
                textDecoration: 'none',
                background: i === 0 ? 'linear-gradient(90deg, rgba(212,168,67,0.06) 0%, transparent 100%)' : 'transparent',
                borderRadius: 0,
              }}
            >
              <span className="w-10 text-center font-bold" style={{
                color: rank.gold ? '#d4a843' : '#4a3a22',
                fontFamily: 'var(--font-cinzel, Georgia)',
                fontSize: i < 3 ? '1.1rem' : '0.875rem',
              }}>
                {rank.text}
              </span>
              {sp?.image
                ? <img src={sp.image} alt={sp.name} className="w-10 h-10 rounded object-cover" style={{ border: '1px solid #4a3520' }} />
                : <span className="text-2xl">{sp?.emoji || '🦕'}</span>}
              <div className="flex-1">
                <p className="font-bold text-sm" style={{
                  color: '#e8d5b0',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                }}>{char.name}</p>
                <p className="text-xs" style={{ color: '#a08050' }}>Lvl {char.level} {sp?.name}</p>
              </div>
              <div className="text-right text-xs" style={{ color: '#a08050' }}>
                <p>💀 {char.kills} kills</p>
                <p>{char.wins}W / {char.losses}L</p>
              </div>
            </Link>
          )
        })}
      </div>

      <h2 className="font-bold mb-3" style={{ color: '#7a2020', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.06em' }}>☠️ Hall of the Fallen</h2>
      <div className="panel" style={{ padding: '0.5rem 0' }}>
        {(dead || []).length === 0 && (
          <p className="text-sm px-6 py-4" style={{ color: '#a08050' }}>Nobody has died yet. Give it time.</p>
        )}
        {(dead || []).map((char, i) => {
          const sp = SPECIES.find(s => s.id === char.species)
          return (
            <Link key={char.id} href={`/profile/${char.id}`}
              className="flex items-center gap-4 px-4 py-3 block row-hover"
              style={{ borderBottom: i < (dead?.length || 0) - 1 ? '1px solid #1e1408' : 'none', textDecoration: 'none' }}>
              <span className="w-10 text-center text-base" style={{ color: '#4a3020' }}>☠</span>
              {sp?.image
                ? <img src={sp.image} alt={sp.name} className="w-10 h-10 rounded object-cover" style={{ border: '1px solid #2a1e0e', filter: 'grayscale(1) brightness(0.45)' }} />
                : <span className="text-2xl" style={{ filter: 'grayscale(1) brightness(0.5)' }}>{sp?.emoji || '🦕'}</span>}
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: '#6a5030', fontFamily: 'var(--font-cinzel, Georgia)' }}>{char.name}</p>
                <p className="text-xs" style={{ color: '#4a3820' }}>Lvl {char.level} {sp?.name} · Fell in battle</p>
              </div>
              <div className="text-right text-xs" style={{ color: '#5a4030' }}>
                <p>💀 {char.kills} kills</p>
                <p>{char.wins}W / {char.losses}L</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
