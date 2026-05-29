'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { SPECIES, xpForLevel } from '@/lib/game-data'
import { Icon } from '@iconify/react'

const HIDDEN_ON = ['/login', '/create-character', '/auth', '/intro']

const BASE_TABS = [
  { href: '/town',        labelKey: null, staticLabel: 'Home',     icon: 'game-icons:castle' },
  { href: '/leaderboard', labelKey: null, staticLabel: 'Rankings', icon: 'game-icons:trophy-cup' },
  { href: '/map',         labelKey: null, staticLabel: 'Map',      icon: 'game-icons:compass' },
] as const

interface NavData {
  id: string
  bones: number
  challengeCount: number
  currentTown: number
  hp: number
  maxHp: number
  xp: number
  level: number
  name: string
  imageUrl: string | null
  speciesImage: string | null
  speciesEmoji: string
  lastRegenAt: string | null
}

const HP_COLOR = '#c04040'

function Avatar({ imageUrl, speciesImage, speciesEmoji, level, size = 28 }: { imageUrl: string | null; speciesImage: string | null; speciesEmoji: string; level: number; size?: number }) {
  const src = imageUrl || speciesImage
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {src
        ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid #4a3520', display: 'block' }} />
        : <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a1208', border: '1px solid #4a3520', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>{speciesEmoji}</div>
      }
      <span style={{
        position: 'absolute', bottom: '-5px', right: '-8px',
        background: '#120e06', border: '1px solid #4a3520',
        borderRadius: '6px', fontSize: '13px',
        fontFamily: 'var(--font-cinzel, Georgia)',
        color: '#e8c060', padding: '0 4px',
        lineHeight: '20px', fontWeight: 700,
        pointerEvents: 'none',
      }}>{level}</span>
    </div>
  )
}

function HpBar({ hp, maxHp, compact }: { hp: number; maxHp: number; compact?: boolean }) {
  const pct = Math.round((hp / maxHp) * 100)
  return (
    <div title={`${hp} / ${maxHp} HP`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
        <Icon icon="ph:heart-fill" width={9} height={9} style={{ color: HP_COLOR, flexShrink: 0 }} />
        <span style={{ fontSize: '10px', color: '#7a5838', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.01em' }}>
          {compact ? `${pct}%` : `${hp}/${maxHp}`}
        </span>
      </div>
      <div style={{ height: compact ? '4px' : '5px', background: '#1a1208', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: HP_COLOR, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function XpBar({ xp, level, compact }: { xp: number; level: number; compact?: boolean }) {
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const span = ceil - floor
  const pct = span > 0 ? Math.round(((xp - floor) / span) * 100) : 0
  return (
    <div style={{ marginTop: '4px' }} title={`${xp - floor} / ${span} XP to next level`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
        <span style={{ fontSize: 9, color: '#2a7a38', lineHeight: 1, flexShrink: 0 }}>✦</span>
        <span style={{ fontSize: '10px', color: compact ? '#2a5a30' : '#4a8a52', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.01em' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: compact ? '3px' : '4px', background: '#0e1e0e', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#2d7a3a', borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function ChallengeBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span style={{
      position: 'absolute', top: '-4px', right: '-6px',
      background: '#c0392b', color: '#fff',
      borderRadius: '9px', fontSize: '10px', fontWeight: 700,
      minWidth: '16px', height: '16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 3px', lineHeight: 1, pointerEvents: 'none',
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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let charId: string | null = null
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: char } = await supabase
        .from('characters')
        .select('id, bones, current_town, hp, max_hp, xp, name, image_url, level, species, last_regen_at')
        .eq('user_id', user.id)
        .single()
      if (!char) return
      charId = char.id as string
      const { count } = await supabase
        .from('challenges').select('*', { count: 'exact', head: true })
        .eq('challenged_id', char.id).eq('status', 'pending')
      const sp = SPECIES.find(s => s.id === (char.species as string))
      setData({
        id: char.id as string,
        bones: char.bones as number,
        challengeCount: count || 0,
        currentTown: (char.current_town as number) ?? 1,
        hp: char.hp as number,
        maxHp: char.max_hp as number,
        xp: char.xp as number,
        level: char.level as number,
        name: char.name as string,
        imageUrl: char.image_url as string | null,
        speciesImage: sp?.image ?? null,
        speciesEmoji: sp?.emoji ?? '🦕',
        lastRegenAt: char.last_regen_at as string | null,
      })

      // Subscribe to live character updates (battles, purchases, server-side regen)
      channel = supabase
        .channel(`nav-char-${char.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${char.id}`,
        }, (payload) => {
          const c = payload.new as Record<string, unknown>
          setData(prev => prev ? {
            ...prev,
            hp: c.hp as number,
            maxHp: c.max_hp as number,
            xp: c.xp as number,
            level: c.level as number,
            bones: c.bones as number,
            lastRegenAt: c.last_regen_at as string | null,
          } : prev)
        })
        .subscribe()
    }

    load()

    return () => {
      if (channel) channel.unsubscribe()
    }
  }, [pathname])

  // Client-side HP simulation — mirrors CharacterCard logic so both stay in sync
  const navHpRef = useRef(data?.hp ?? 0)
  useEffect(() => {
    if (!data || data.hp >= data.maxHp || !data.lastRegenAt) return
    navHpRef.current = data.hp
    const regenPerMinute = data.maxHp / 60
    const msPerHp = 60000 / regenPerMinute
    const elapsed = Date.now() - new Date(data.lastRegenAt).getTime()
    const msUntilNext = msPerHp - (elapsed % msPerHp)
    let timeout: ReturnType<typeof setTimeout>
    function tick() {
      navHpRef.current = Math.min(data!.maxHp, navHpRef.current + 1)
      setData(prev => prev ? { ...prev, hp: navHpRef.current } : prev)
      if (navHpRef.current < data!.maxHp) timeout = setTimeout(tick, msPerHp)
    }
    timeout = setTimeout(tick, msUntilNext)
    return () => clearTimeout(timeout)
  }, [data?.lastRegenAt, data?.maxHp]) // eslint-disable-line react-hooks/exhaustive-deps

  if (HIDDEN_ON.some(p => pathname.startsWith(p))) return null

  const tabs = BASE_TABS.map(t => ({ ...t, label: t.staticLabel }))

  return (
    <>
      {/* Desktop top bar — md and above */}
      <nav className="hidden md:grid items-center px-6" style={{
        gridTemplateColumns: '1fr auto 1fr',
        position: 'fixed', top: 0, left: 0, right: 0, height: '84px', zIndex: 40,
        background: 'rgba(8,6,4,0.97)',
        borderBottom: '1px solid #2a1e10',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      }}>
        {/* Logo — left column */}
        <Link href="/town" style={{
          fontFamily: 'var(--font-cinzel-deco, var(--font-cinzel, Georgia))',
          color: '#d4a843', fontWeight: 700, fontSize: '21px',
          letterSpacing: '0.06em', textDecoration: 'none',
          whiteSpace: 'nowrap', textShadow: '0 0 20px rgba(212,168,67,0.25)',
          justifySelf: 'start', alignSelf: 'center',
        }}>
          Jurassic Brawl
        </Link>

        {/* Center nav links — middle column, always viewport-centered */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {tabs.map(tab => {
            const active = pathname === tab.href || (tab.href !== '/town' && pathname.startsWith(tab.href))
            const hovered = hoveredTab === tab.href
            const isHome = tab.href === '/town'
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onMouseEnter={() => setHoveredTab(tab.href)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  position: 'relative',
                  padding: '6px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 700 : 400,
                  color: active ? '#d4a843' : hovered ? '#c8924a' : '#7a6040',
                  background: active ? 'rgba(212,168,67,0.10)' : hovered ? 'rgba(212,168,67,0.05)' : 'transparent',
                  border: active ? '1px solid rgba(212,168,67,0.22)' : '1px solid transparent',
                  boxShadow: active ? '0 0 16px rgba(212,168,67,0.08), inset 0 1px 0 rgba(212,168,67,0.06)' : 'none',
                  textShadow: active ? '0 0 14px rgba(212,168,67,0.35)' : hovered ? '0 0 10px rgba(212,168,67,0.18)' : 'none',
                  textDecoration: 'none',
                  transition: 'color 0.18s, background 0.18s, border-color 0.18s, box-shadow 0.18s, text-shadow 0.18s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {isHome && data && data.challengeCount > 0 && (
                  <ChallengeBadge count={data.challengeCount} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right — last column, pushed to end */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifySelf: 'end' }}>
          {data !== null && (
            <>
              <Link href={`/profile/${data.id}`} style={{ textDecoration: 'none' }}>
                <Avatar imageUrl={data.imageUrl} speciesImage={data.speciesImage} speciesEmoji={data.speciesEmoji} level={data.level} size={46} />
              </Link>
              <div style={{ width: 96, marginLeft: '8px' }}>
                <HpBar hp={data.hp} maxHp={data.maxHp} />
                <XpBar xp={data.xp} level={data.level} />
              </div>
              <span style={{ fontSize: '12px', color: '#8a7040', fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon icon="ph:bone-fill" width={13} height={13} />
                {data.bones.toLocaleString()}
              </span>
            </>

          )}
          <SignOutBtn />
        </div>
      </nav>

      {/* Mobile top HUD — below md */}
      <div className="md:hidden flex items-center gap-3 px-4" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '56px', zIndex: 41,
        paddingTop: 'env(safe-area-inset-top)',
        background: 'rgba(8,6,4,0.97)',
        borderBottom: '1px solid #1e1408',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.8)',
      }}>
        {data !== null && (
          <>
            <Link href={`/profile/${data.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Avatar imageUrl={data.imageUrl} speciesImage={data.speciesImage} speciesEmoji={data.speciesEmoji} level={data.level} size={34} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '12px', color: '#c8a870', fontWeight: 700,
                fontFamily: 'var(--font-cinzel, Georgia)', letterSpacing: '0.04em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{data.name}</p>
            </div>
            <div style={{ flex: 1, minWidth: '60px' }}>
              <HpBar hp={data.hp} maxHp={data.maxHp} compact />
              <XpBar xp={data.xp} level={data.level} compact />
            </div>
            <span style={{ fontSize: '11px', color: '#a08858', fontFamily: 'var(--font-cinzel, Georgia)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon icon="ph:bone-fill" width={13} height={13} />
              {data.bones.toLocaleString()}
            </span>
          </>
        )}
      </div>

      {/* Mobile bottom nav */}
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
          const isHome = tab.href === '/town'
          const hasBadge = isHome && data && data.challengeCount > 0
          return (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', padding: '8px 0', minHeight: '56px',
                position: 'relative',
                color: active ? '#d4a843' : '#8a6840',
                transition: 'color 0.15s',
              }}>
                {active && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '32px', height: '2px',
                    background: 'linear-gradient(to right, transparent, #d4a843, transparent)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <span style={{ fontSize: '20px', lineHeight: 1, position: 'relative', display: 'flex' }}>
                  <Icon icon={tab.icon} width={22} height={22} />
                  {hasBadge && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-5px',
                      background: '#c0392b', borderRadius: '50%',
                      width: '8px', height: '8px', display: 'block',
                      boxShadow: '0 0 4px rgba(192,57,43,0.6)',
                    }} />
                  )}
                </span>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.04em', fontWeight: active ? 700 : 400,
                  textTransform: 'uppercase', lineHeight: 1,
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
