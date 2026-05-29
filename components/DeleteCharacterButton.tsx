'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function DeleteCharacterButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch('/api/character/delete', { method: 'POST' })
    if (res.ok) router.push('/create-character')
    else setLoading(false)
  }

  return (
    <>
      <div>
        <p className="text-xs mb-2" style={{ color: '#5a4030', fontStyle: 'italic' }}>
          Done with this character? You can retire them and start fresh.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="text-sm px-4 py-2 rounded"
          style={{ background: '#2a1010', color: '#c86060', border: '1px solid #6a2828', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Icon icon="game-icons:skull-crossed-bones" width={16} height={16} />
          Retire this dinosaur
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel max-w-sm w-full text-center space-y-4">
            <Icon icon="game-icons:dinosaur-rex" width={60} height={60} />
            <h2 className="text-xl font-bold" style={{ color: '#c8a84b' }}>Send them to the tar pit?</h2>
            <p className="text-sm" style={{ color: '#8a7a5a' }}>
              This will permanently delete your dinosaur, all their gear, and their entire legacy.
              They will be forgotten. Even by the tar pit.
            </p>
            <p className="text-xs" style={{ color: '#5a4a3a' }}>There is no undo. This is extremely final.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setOpen(false)}
                className="btn-ghost text-sm px-4">
                Actually, no
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm px-4 py-2 rounded font-bold"
                style={{ background: '#8b2020', color: '#e8d5b0' }}>
                {loading ? 'Dissolving...' : 'Into the tar pit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
