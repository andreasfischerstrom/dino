'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Props {
  isHome: boolean
  accent: string
  desc: string
}

export default function DenTownCard({ isHome, accent, desc }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href="/den" style={{ textDecoration: 'none', display: 'block' }}>
      {/* Dark base — matches LocationCards grid background */}
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.82)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Gold tint on hover — same as LocationCards per-cell */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            background: hovered ? 'rgba(212,168,67,0.06)' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          <Icon
            icon="ph:house-fill"
            width={20} height={20}
            style={{ color: hovered ? '#e8c870' : (isHome ? accent : '#c8a050'), flexShrink: 0, filter: isHome ? `drop-shadow(0 0 6px ${accent})` : 'none', transition: 'color 0.15s' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: hovered ? '#e8c870' : (isHome ? accent : '#c8a050'), fontFamily: 'var(--font-cinzel, Georgia)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 0.15s' }}>
              Den
            </p>
            <p style={{ color: hovered ? '#7a6840' : '#c8b890', fontSize: 10, transition: 'color 0.15s' }}>{desc}</p>
          </div>
          <Icon icon="lucide:chevron-right" width={14} height={14} style={{ color: hovered ? '#e8c870' : '#c8a050', flexShrink: 0, transition: 'color 0.15s' }} />
        </div>
      </div>
    </Link>
  )
}
