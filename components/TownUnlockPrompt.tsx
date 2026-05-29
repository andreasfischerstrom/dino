'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Props {
  townId: number
  townName: string
  townSubtitle: string
}

const storageKey = (townId: number) => `town-unlock-dismissed-${townId}`

export default function TownUnlockPrompt({ townId, townName, townSubtitle }: Props) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey(townId)) === '1')
  }, [townId])

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(storageKey(townId), '1')
    setDismissed(true)
  }

  return (
    <div className="mt-4 relative" style={{ position: 'relative' }}>
      <Link href="/map" onClick={dismiss} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="p-3 rounded" style={{
          background: 'linear-gradient(135deg, #1a0e06 0%, #120a04 100%)',
          border: '1px solid #7a4818',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}>
          <p className="text-sm font-bold mb-1" style={{
            color: '#d4a843',
            fontFamily: 'var(--font-cinzel, Georgia)',
            letterSpacing: '0.04em',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon icon="game-icons:compass" width={14} height={14} />
              {townName} awaits
            </span>
          </p>
          <p className="text-xs" style={{ color: '#a07040' }}>
            You have outgrown this pit. Word has reached you of {townSubtitle} — further east, harder, better rewarded.{' '}
            <span style={{ color: '#d4a843', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Open the map <Icon icon="lucide:chevron-right" width={12} height={12} /></span>
          </p>
        </div>
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'transparent', border: 'none',
          color: '#7a5030', cursor: 'pointer', padding: '2px',
          lineHeight: 1,
        }}
      >
        <Icon icon="lucide:x" width={14} height={14} />
      </button>
    </div>
  )
}
