'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOWNS } from '@/lib/game-data'

const HIDDEN_ON = ['/login', '/create-character', '/auth']

const BASE_TABS = [
  { href: '/town',   labelKey: null,    staticLabel: 'Home', icon: '🏰' },
  { href: '/arena',  labelKey: 'arena', staticLabel: null,   icon: '🏟️' },
  { href: '/tavern', labelKey: 'tavern', staticLabel: null,  icon: '🍺' },
  { href: '/map',    labelKey: null,    staticLabel: 'Map',  icon: '🗺️' },
] as const

interface NavData {
  bones: number
  challengeCount: number
  currentTown: number
}

function ChallengeBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span style={{
      position: 'absolute', top: '-4px', right: '-6px',
      background: '#c0392b',
      color: '#fff',
      borderRadius: '9px',
      fontSize: '10px',
      fontWeight: 700,
      minWidth: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3px',
      lineHeight: 1,
      pointerEvents: 'none',
    }}>
      {count}
    </span>
  )
}

function SignOutBtn() {
  const router = useRouter()
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <button onClick={signOut} style={{
      background: 'transparent',
      border: '1px solid #4a3828',
      color: '#8a7060',
      fontSize: '11px',
      padding: '4px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'var(--font-cinzel, Georgia)',
      letterSpacing: '0.04em',
      transition: 'color 0.15s, border-color 0.15s',
    }}>
      Sign out
    </button>
  )
}

export default function NavBar() {
  const pathname = usePathname()
  const [data, setData] = useState<NavData | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: char } = await supabase
        .from('characters').select('id, bones, current_town').eq('user_id', user.id).single()
      if (!char) return
      const { count } = await supabase
        .from('challenges').select('*', { count: 'exact', head: true })
        .eq('challenged_id', char.id).eq('status', 'pending')
      setData({ bones: char.bones, challengeCount: count || 0, currentTown: (char.current_town as number) ?? 1 })
    }
    load()
  }, [pathname])

  if (HIDDEN_ON.some(p => pathname.startsWith(p))) return null

  const townDef = TOWNS.find(t => t.id === (data?.currentTown ?? 1)) ?? TOWNS[0]
  const tabs = BASE_TABS.map(t => ({
    ...t,
    label: t.labelKey ? townDef.locations[t.labelKey] : t.staticLabel!,
  }))

  return (
    <>
      {/* Desktop top bar — md and above */}
      <nav className="hidden md:flex items-center px-6 gap-6" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 40,
        background: 'rgba(8,6,4,0.97)',
        borderBottom: '1px solid #2a1e10',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      }}>
        {/* Logo */}
        <Link href="/town" style={{
          fontFamily: 'var(--font-cinzel-deco, var(--font-cinzel, Georgia))',
          color: '#d4a843',
          fontWeight: 700,
          fontSize: '17px',
          letterSpacing: '0.06em',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(212,168,67,0.25)',
          flexShrink: 0,
        }}>
          Jurassic Brawl
        </Link>

        {/* Center nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
          {tabs.map(tab => {
            const active = pathname === tab.href || (tab.href !== '/town' && pathname.startsWith(tab.href))
            const isArena = tab.href === '/arena'
            return (
              <Link key={tab.href} href={tab.href} style={{
                position: 'relative',
                padding: '5px 13px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-cinzel, Georgia)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                fontWeight: active ? 700 : 400,
                color: active ? '#d4a843' : '#a08050',
                background: active ? 'rgba(212,168,67,0.07)' : 'transparent',
                textDecoration: 'none',
                transition: 'color 0.15s, background 0.15s',
                whiteSpace: 'nowrap',
                borderBottom: active ? '1px solid rgba(212,168,67,0.4)' : '1px solid transparent',
              }}>
                {tab.label}
                {isArena && data && data.challengeCount > 0 && (
                  <ChallengeBadge count={data.challengeCount} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right: bones + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {data !== null && (
            <span style={{
              fontSize: '13px',
              color: '#a08858',
              fontFamily: 'var(--font-cinzel, Georgia)',
              letterSpacing: '0.04em',
            }}>
              🦴 {data.bones.toLocaleString()}
            </span>
          )}
          <SignOutBtn />
        </div>
      </nav>

      {/* Mobile bottom bar — below md */}
      <nav className="md:hidden flex items-stretch" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,6,4,0.97)',
        borderTop: '1px solid #2a1e10',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.8)',
      }}>
        {tabs.map(tab => {
          const active = pathname === tab.href || (tab.href !== '/town' && pathname.startsWith(tab.href))
          const isArena = tab.href === '/arena'
          const hasBadge = isArena && data && data.challengeCount > 0
          return (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '8px 0',
                minHeight: '56px',
                position: 'relative',
                color: active ? '#d4a843' : '#8a6840',
                transition: 'color 0.15s',
              }}>
                {active && (
                  <span style={{
                    position: 'absolute',
                    top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '32px', height: '2px',
                    background: 'linear-gradient(to right, transparent, #d4a843, transparent)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <span style={{ fontSize: '20px', lineHeight: 1, position: 'relative' }}>
                  {tab.icon}
                  {hasBadge && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-5px',
                      background: '#c0392b',
                      borderRadius: '50%',
                      width: '8px', height: '8px',
                      display: 'block',
                      boxShadow: '0 0 4px rgba(192,57,43,0.6)',
                    }} />
                  )}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.04em',
                  fontWeight: active ? 700 : 400,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
