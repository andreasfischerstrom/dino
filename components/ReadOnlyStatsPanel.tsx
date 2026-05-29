'use client'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { STAT_MAX } from '@/lib/game-data'

interface StatRow {
  key: string
  label: string
  icon: string
  description: string
  value: number
}

export default function ReadOnlyStatsPanel({ stats }: { stats: StatRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="panel">
      <h2 className="font-bold mb-3" style={{ color: '#c8a84b' }}>Stats</h2>
      <p className="text-xs mb-3" style={{ color: '#4a3820', fontStyle: 'italic' }}>Tap a stat to see what it does.</p>
      <div className="space-y-2">
        {stats.map(stat => (
          <div key={stat.key} className="flex items-center gap-2">
            <span
              className="text-xs w-24 shrink-0 relative select-none"
              style={{ color: '#8a7a5a', cursor: 'help' }}
              onMouseEnter={() => setHovered(stat.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(hovered === stat.key ? null : stat.key)}
            >
              <span style={{ borderBottom: '1px dashed #4a3820', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Icon icon={stat.icon} width={11} height={11} />
                {stat.label}
              </span>
              {hovered === stat.key && (
                <span
                  className="absolute z-50 pointer-events-none"
                  style={{
                    bottom: '100%', left: 0, marginBottom: '6px',
                    background: '#1a1408', border: '1px solid #5a4020',
                    borderRadius: '5px', padding: '6px 10px',
                    color: '#c8a870', fontSize: '11px', lineHeight: '1.5',
                    whiteSpace: 'normal', width: '200px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                  }}
                >
                  <strong style={{ color: '#d4a843', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Icon icon={stat.icon} width={13} height={13} />{stat.label}
                  </strong>
                  {stat.description}
                </span>
              )}
            </span>
            <div className="flex-1 stat-bar">
              <div className="stat-bar-fill" style={{ width: `${Math.min(100, (stat.value / STAT_MAX) * 100)}%` }} />
            </div>
            <span className="text-xs w-4 text-right font-bold" style={{ color: '#c8a84b' }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
