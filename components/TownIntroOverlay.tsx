'use client'
import { useEffect, useState } from 'react'

interface Props {
  townId: number
  name: string
  subtitle: string
  description: string
  flavor: string
  banner: string
}

const FADE_MS = 700

export default function TownIntroOverlay({ townId, name, subtitle, description, flavor, banner }: Props) {
  // Start shown=true so it blocks town content from the first paint,
  // preventing a flash of the page before the overlay appears.
  const [shown, setShown] = useState(true)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [btnVisible, setBtnVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const key = `town-intro-${townId}`
    if (localStorage.getItem(key)) {
      // Already seen — remove immediately (was transparent anyway)
      setShown(false)
      return
    }
    const t1 = setTimeout(() => setOverlayVisible(true), 50)
    const t2 = setTimeout(() => setTextVisible(true), 900)
    const t3 = setTimeout(() => setBtnVisible(true), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [townId])

  function dismiss() {
    if (leaving) return
    setLeaving(true)
    localStorage.setItem(`town-intro-${townId}`, '1')
    setOverlayVisible(false)
    setTimeout(() => setShown(false), FADE_MS)
  }

  if (!shown) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        opacity: overlayVisible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
        cursor: 'pointer',
        background: '#050403',
      }}
    >
      {/* Banner */}
      <img
        src={banner}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,4,3,0.82)' }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 36px', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-cinzel-deco, var(--font-cinzel, Georgia))',
          color: '#e8c870',
          fontSize: 'clamp(22px, 5vw, 32px)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textShadow: '0 0 40px rgba(212,168,67,0.4)',
          marginBottom: '8px',
        }}>{name}</p>

        <p style={{
          fontFamily: 'var(--font-cinzel, Georgia)',
          color: '#7a6030',
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: '48px',
        }}>{subtitle}</p>

        <div style={{
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 1.6s ease',
          maxWidth: '460px',
        }}>
          <p style={{
            fontFamily: 'var(--font-cinzel, Georgia)',
            color: '#c8a870',
            fontSize: 'clamp(13px, 3.2vw, 16px)',
            lineHeight: 2,
            letterSpacing: '0.03em',
            marginBottom: '24px',
          }}>
            {description}
          </p>
          <p style={{
            fontFamily: 'var(--font-cinzel, Georgia)',
            color: '#6a5838',
            fontSize: 'clamp(11px, 2.8vw, 13px)',
            lineHeight: 2,
            letterSpacing: '0.04em',
            fontStyle: 'italic',
          }}>
            {flavor}
          </p>
        </div>

        <div style={{
          marginTop: '52px',
          opacity: btnVisible ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}>
          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              border: '1px solid #6a4e20',
              color: '#c8a050',
              fontFamily: 'var(--font-cinzel, Georgia)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '14px 40px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Enter {name}
          </button>
        </div>

        <p style={{
          position: 'absolute', bottom: '28px', right: '28px',
          fontSize: '10px', color: '#2e2518',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>
          tap to skip
        </p>
      </div>
    </div>
  )
}
