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
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #1e0e00 0%, #0a0906 70%)' }}>
      <div className="text-center max-w-md w-full">
        <div className="mb-4 mx-auto relative" style={{ width: '100%', maxWidth: 360, overflow: 'hidden' }}>
          <img src="/images/login-battle.png" alt="Two dinosaurs battling in the arena"
            style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{
            background: `
              linear-gradient(to bottom, rgba(10,9,6,0.85) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 65%, rgba(10,9,6,0.95) 100%),
              linear-gradient(to right, rgba(10,9,6,0.8) 0%, transparent 25%, transparent 75%, rgba(10,9,6,0.8) 100%)
            `,
          }}>
            <h1 className="game-logo text-5xl mb-2 leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 32px rgba(212,168,67,0.3)' }}>
              JURASSIC<br />BRAWL
            </h1>
          </div>
        </div>

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
