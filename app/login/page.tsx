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
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #1a0f00 0%, #0d0d0d 70%)' }}>
      <div className="text-center max-w-md w-full">
        <div className="text-8xl mb-6">🦖</div>
        <h1 className="text-5xl font-bold mb-2" style={{ color: '#c8a84b', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
          CRETACEOUS<br />CARNAGE
        </h1>
        <p className="text-base mt-4 mb-8" style={{ color: '#5a4a3a' }}>
          65 million years ago, dinosaurs built an underground fighting league so brutal that historians refuse to acknowledge it existed. This is that game.
        </p>

        <div className="panel">
          <div className="flex mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }}
                className="flex-1 py-2 text-sm font-bold transition rounded"
                style={{
                  background: mode === m ? '#c8a84b' : 'transparent',
                  color: mode === m ? '#0d0d0d' : '#5a4a3a',
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
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#e8d5b0', fontFamily: 'Georgia' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg"
              style={{ background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#e8d5b0', fontFamily: 'Georgia' }}
            />

            {error && <p className="text-sm" style={{ color: '#bf4040' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: '#6abf6a' }}>{message}</p>}

            <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Enter the Arena' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs" style={{ color: '#3a2a1a' }}>
          By signing up you agree to occasionally lose a dinosaur you were emotionally attached to.
        </p>
      </div>
    </div>
  )
}
