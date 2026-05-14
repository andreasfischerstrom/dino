'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('Check your email for a confirmation link — then come back and log in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative" style={{
        backgroundImage: 'url(/images/login-battle.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(5,3,2,0.8) 0%, rgba(5,3,2,0.6) 40%, rgba(5,3,2,0.85) 100%)',
      }} />

      <div className="relative text-center max-w-md w-full">
        <h1 className="game-logo text-5xl mb-2 leading-tight" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 40px rgba(212,168,67,0.25)' }}>
          JURASSIC<br />BRAWL
        </h1>

        <div className="my-4" style={{ height: '1px', background: 'linear-gradient(to right, transparent, #5a4020, transparent)' }} />
        <p className="text-base mb-8 leading-relaxed" style={{ color: '#a08050', fontStyle: 'italic' }}>
          65 million years ago, dinosaurs built an underground fighting league so brutal
          that historians refuse to acknowledge it existed. This is that game.
        </p>

        <div className="panel" style={{ borderTop: '2px solid #5a4028' }}>
          <div className="flex mb-6 rounded overflow-hidden" style={{ border: '1px solid #4a3520' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }}
                className="flex-1 py-2.5 text-sm font-bold transition"
                style={{
                  background: mode === m ? 'linear-gradient(to bottom, #e0ba40, #a87018)' : 'transparent',
                  color: mode === m ? '#160c00' : '#5a4a30',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.05em',
                  boxShadow: mode === m ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="game-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="game-input"
            />

            {error && <p className="text-sm" style={{ color: '#c05050' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: '#5abf6a' }}>{message}</p>}

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Enter the Arena ⚔️' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs" style={{ color: '#8a7040' }}>
          By signing up you agree to occasionally lose a dinosaur you were emotionally attached to.
        </p>
      </div>
    </div>
  )
}
