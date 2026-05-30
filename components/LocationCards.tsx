'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface LocationCard {
  href: string
  label: string
  icon: string
  desc: string
  accent?: string
}

export default function LocationCards({ cards, gridBackground }: { cards: LocationCard[], gridBackground?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const cols = cards.length === 4 ? 4 : 3

  return (
    <div
      className={cols === 4 ? 'grid grid-cols-4' : 'grid grid-cols-3'}
      style={{ background: gridBackground ?? '#0c0905', borderTop: '1px solid #2a1e10', position: 'relative', zIndex: 1 }}
    >
      {cards.map((loc, i) => {
        const isHovered = hovered === loc.href
        const baseColor = loc.accent ?? '#c8a050'
        const hoverColor = loc.accent ? '#e8d890' : '#e8c870'
        const col = i % cols
        const borderRight = col < cols - 1 ? '1px solid #1e1610' : 'none'
        const borderTop = cols < 4 && i >= cols ? '1px solid #1e1610' : 'none'
        return (
          <Link key={loc.href} href={loc.href} style={{ textDecoration: 'none' }}>
            <div
              onMouseEnter={() => setHovered(loc.href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '14px 10px',
                textAlign: 'center',
                borderRight,
                borderTop,
                background: isHovered ? 'rgba(212,168,67,0.06)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'center', marginBottom: '6px',
                color: isHovered ? hoverColor : baseColor,
                filter: loc.accent ? `drop-shadow(0 0 6px ${baseColor})` : 'none',
                transition: 'color 0.15s',
              }}>
                <Icon icon={loc.icon} width={26} height={26} />
              </div>
              <p style={{
                color: isHovered ? hoverColor : baseColor,
                fontFamily: 'var(--font-cinzel, Georgia)',
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                marginBottom: '3px', transition: 'color 0.15s',
              }}>{loc.label}</p>
              <p style={{ color: isHovered ? '#7a6840' : '#5a4830', fontSize: '10px', transition: 'color 0.15s' }}>{loc.desc}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
