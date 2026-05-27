'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/town',      label: 'Town',      icon: '🏰' },
  { href: '/training',  label: 'Pit',       icon: '⚔️' },
  { href: '/arena',     label: 'Colosseum', icon: '🏟️' },
  { href: '/tavern',    label: 'Tavern',    icon: '🍺' },
  { href: '/equipment', label: 'Gear',      icon: '🛡️' },
]

const HIDDEN_ON = ['/login', '/create-character', '/auth']

export default function BottomNav() {
  const pathname = usePathname()
  if (HIDDEN_ON.some(p => pathname.startsWith(p))) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(8,6,4,0.97)',
      borderTop: '1px solid #2a1e10',
      backdropFilter: 'blur(12px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.8)',
    }}>
      <div className="flex items-stretch">
        {TABS.map(tab => {
          const active = pathname === tab.href || (tab.href !== '/town' && pathname.startsWith(tab.href))
          return (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', flex: 1 }}>
              <div className="flex flex-col items-center justify-center gap-0.5 py-2" style={{
                minHeight: '56px',
                color: active ? '#d4a843' : '#4a3820',
                transition: 'color 0.15s',
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-cinzel, Georgia)',
                  letterSpacing: '0.04em',
                  fontWeight: active ? '700' : '400',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {tab.label}
                </span>
                {active && (
                  <span style={{
                    position: 'absolute',
                    top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '32px', height: '2px',
                    background: 'linear-gradient(to right, transparent, #d4a843, transparent)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
