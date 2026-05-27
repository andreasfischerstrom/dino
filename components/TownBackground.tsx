'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOWNS } from '@/lib/game-data'

const HIDDEN_ON = ['/login', '/create-character', '/auth']

export default function TownBackground() {
  const pathname = usePathname()
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: char } = await supabase
        .from('characters').select('current_town').eq('user_id', user.id).single()
      if (!char) return
      const town = TOWNS.find(t => t.id === ((char.current_town as number) ?? 1)) ?? TOWNS[0]
      setBanner(town.banner)
    }
    load()
  }, [pathname])

  if (HIDDEN_ON.some(p => pathname.startsWith(p))) return null
  if (!banner) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'blur(10px)',
          transform: 'scale(1.12)',
          opacity: 0.5,
        }}
      />
    </div>
  )
}
