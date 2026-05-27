import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SPECIES } from '@/lib/game-data'

const OBITUARY_LINES = [
  "was beloved by no one in particular but feared by many.",
  "lived fast, fought hard, and was carried out of the arena on a very tired stretcher.",
  "had dreams. Those dreams have ended.",
  "leaves behind no family, some bones, and a reputation for stubbornness.",
  "once headbutted a Swamp Croc for fun. It was not fun.",
  "never backed down from a fight. This is why they are dead.",
  "told friends they'd 'be fine.' They were not fine.",
  "is survived by nobody, as they ate most acquaintances.",
  "went down swinging. Which is impressive. And also fatal.",
  "will be remembered, briefly, by the arena betting pool.",
]

export default async function ObituaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!character) redirect('/create-character')
  if (character.alive) redirect('/town')

  // Check for unseen replays — watch your death before the obituary
  const { data: unseenBattle } = await supabase
    .from('battles')
    .select('id')
    .or(`and(challenger_id.eq.${character.id},challenger_seen.eq.false),and(challenged_id.eq.${character.id},challenged_seen.eq.false)`)
    .not('battle_result', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (unseenBattle) redirect(`/replay/${unseenBattle.id}`)

  const sp = SPECIES.find(s => s.id === character.species)
  const obitLine = OBITUARY_LINES[Math.floor(Math.random() * OBITUARY_LINES.length)]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0606 0%, #0a0906 70%)' }}>
      <div className="max-w-lg w-full">
        <div className="mb-6 flex justify-center">
          {sp?.image
            ? <img src={sp.image} alt={sp.name} className="w-40 h-40 rounded-lg object-cover"
                style={{ filter: 'grayscale(1) brightness(0.35)', border: '1px solid #2a1e0e' }} />
            : <span className="text-8xl" style={{ filter: 'grayscale(1) brightness(0.4)' }}>{sp?.emoji || '🦕'}</span>}
        </div>

        <h1 className="text-4xl font-bold mb-2" style={{
          color: '#a08050',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.06em',
          textShadow: '0 2px 6px rgba(0,0,0,0.9)',
        }}>
          {character.name}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#7a6040' }}>
          Lvl {character.level} {sp?.name} · {character.kills} kills · {character.wins}W / {character.losses}L
        </p>

        <div className="my-8 p-6 rounded" style={{
          background: 'linear-gradient(135deg, #161008 0%, #0e0a06 100%)',
          border: '1px solid #3a2810',
          boxShadow: '0 4px 16px rgba(0,0,0,0.9)',
        }}>
          <p className="text-lg italic mb-4" style={{ color: '#a08050' }}>
            Here lies <strong style={{ color: '#a08040', fontFamily: 'var(--font-cinzel, Georgia)' }}>{character.name}</strong>,
          </p>
          <p className="text-base italic leading-relaxed" style={{ color: '#a08050' }}>
            who {obitLine}
          </p>
          <div className="my-4" style={{ height: '1px', background: 'linear-gradient(to right, transparent, #3a2810, transparent)' }} />
          <p className="text-sm" style={{ color: '#8a7040' }}>
            They earned {character.bones} bones and spent most of them on things that did not save them.
          </p>
        </div>

        <p className="text-sm mb-8" style={{ color: '#6a5038', fontStyle: 'italic' }}>
          Death is permanent. Your legacy is not.<br />Start a new gladiator and carry the shame forward.
        </p>

        <Link href="/create-character">
          <button className="btn-primary text-base px-8 py-3">
            Rise Again ☠️ → 🦕
          </button>
        </Link>
      </div>
    </div>
  )
}
