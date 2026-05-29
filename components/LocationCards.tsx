'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface LocationCard {
  href: string
  label: string
  icon: string
  desc: string
}

export default function LocationCards({ cards, gridBackground }: { cards: LocationCard[], gridBackground?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-3" style={{ background: gridBackground ?? '#0c0905', borderTop: '1px solid #2a1e10', position: 'relative', zIndex: 1 }}>
      {cards.map((loc, i) => (
        <Link key={loc.href} href={loc.href} style={{ textDecoration: 'none' }}>
          <div
            onMouseEnter={() => setHovered(loc.href)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '14px 10px',
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid #1e1610' : 'none',
              background: hovered === loc.href ? 'rgba(212,168,67,0.06)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px', color: hovered === loc.href ? '#e8c870' : '#c8a050', transition: 'color 0.15s' }}>
              <Icon icon={loc.icon} width={26} height={26} />
            </div>
            <p style={{
              color: hovered === loc.href ? '#e8c870' : '#c8a050',
              fontFamily: 'var(--font-cinzel, Georgia)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '3px',
              transition: 'color 0.15s',
            }}>{loc.label}</p>
            <p style={{ color: hovered === loc.href ? '#7a6840' : '#5a4830', fontSize: '10px', transition: 'color 0.15s' }}>{loc.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
