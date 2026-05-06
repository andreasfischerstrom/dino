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

  const sp = SPECIES.find(s => s.id === character.species)
  const obitLine = OBITUARY_LINES[Math.floor(Math.random() * OBITUARY_LINES.length)]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0808 0%, #0d0d0d 70%)' }}>
      <div className="max-w-lg">
        <div className="text-8xl mb-6 grayscale opacity-60">{sp?.emoji || '🦕'}</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#8a7a5a' }}>
          {character.name}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#5a4a3a' }}>
          Lvl {character.level} {sp?.name} · {character.kills} kills · {character.wins}W / {character.losses}L
        </p>
        <div className="my-8 p-6 rounded-lg" style={{ background: '#1a1410', border: '1px solid #3d2e1e' }}>
          <p className="text-lg italic mb-4" style={{ color: '#8a7a5a' }}>
            Here lies <strong style={{ color: '#c8a84b' }}>{character.name}</strong>,
          </p>
          <p className="text-base italic" style={{ color: '#5a4a3a' }}>
            who {obitLine}
          </p>
          <p className="text-sm mt-4" style={{ color: '#3a2a1a' }}>
            They earned {character.bones} bones and spent most of them on things that did not save them.
          </p>
        </div>
        <p className="text-sm mb-6" style={{ color: '#5a4a3a' }}>
          Death is permanent. Your legacy is not. Start a new gladiator and carry the shame forward.
        </p>
        <Link href="/create-character">
          <button className="btn-primary text-lg px-8 py-4">
            Rise Again ☠️ → 🦕
          </button>
        </Link>
      </div>
    </div>
  )
}
