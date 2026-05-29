'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const GULCH_BANNER = '/images/gulch-banner.png'

interface Slide {
  lines: string[]
  showBanner?: boolean
  final?: boolean
}

function buildSlides(name: string): Slide[] {
  return [
    {
      lines: [
        'Sixty-five million years.',
        'Give or take.',
      ],
    },
    {
      lines: [
        'The rock never came.',
        'The world kept going.',
        'And going. And going.',
      ],
    },
    {
      lines: [
        'Nobody remembers who built the first arena.',
        'The bones changed hands.',
        'The arenas multiplied.',
        'Eventually that was just how things worked.',
      ],
    },
    {
      lines: [
        'There are four arenas worth knowing about.',
        'You are at the bottom of that list.',
      ],
      showBanner: true,
    },
    {
      lines: [
        'A three-fingered Ankylosaurus looks you over.',
        '\u2018You fight?\u2019',
        'You say yes. Or something like yes.',
        `\u2018What do they call you?\u2019`,
        `\u2018${name},\u2019 you say.`,
        '\u2018Good enough,\u2019 he says.',
      ],
    },
    {
      lines: [
        "You don\u2019t know why you\u2019re here.",
        'Nobody does. Nobody asks.',
        "That\u2019s not how it works.",
      ],
    },
    {
      lines: [
        'Welcome to The Gulch.',
        'Try not to die on the first day.',
      ],
      final: true,
    },
  ]
}

// Time between each line starting to fade in
const LINE_INTERVAL_MS = 3400
// CSS fade duration
const LINE_FADE_MS = 1600
// How long to hold after last line before transitioning
const SLIDE_HOLD_MS = 4500
// Slide cross-fade duration
const SLIDE_FADE_MS = 900

export default function IntroClient({ characterName }: { characterName: string }) {
  const router = useRouter()
  const slides = buildSlides(characterName)

  const [slideIndex, setSlideIndex] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [slideOpacity, setSlideOpacity] = useState(1)
  const [bannerOpacity, setBannerOpacity] = useState(0)
  const [showEnter, setShowEnter] = useState(false)
  const [enterVisible, setEnterVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const currentSlide = slides[slideIndex]

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function schedule(ms: number, fn: () => void) {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }

  // Run the sequence for the current slide
  useEffect(() => {
    clearTimers()
    setVisibleLines(0)

    const lineCount = currentSlide.lines.length

    // Fade in each line in sequence
    for (let i = 0; i < lineCount; i++) {
      schedule(i * LINE_INTERVAL_MS + 200, () => setVisibleLines(v => v + 1))
    }

    // After all lines are in, hold then advance
    const allLinesIn = (lineCount - 1) * LINE_INTERVAL_MS + LINE_FADE_MS + 200
    const holdEnd = allLinesIn + SLIDE_HOLD_MS

    if (currentSlide.final) {
      schedule(holdEnd, () => {
        setShowEnter(true)
        setTimeout(() => setEnterVisible(true), 50)
      })
    } else {
      schedule(holdEnd, () => {
        // Fade out banner if present
        if (currentSlide.showBanner) setBannerOpacity(0)
        setSlideOpacity(0)
        schedule(SLIDE_FADE_MS, () => {
          setSlideIndex(i => i + 1)
          setSlideOpacity(1)
        })
      })
    }

    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex])

  // Banner fade in/out
  useEffect(() => {
    if (currentSlide.showBanner) {
      const t = setTimeout(() => setBannerOpacity(0.2), 300)
      return () => clearTimeout(t)
    }
  }, [currentSlide.showBanner])

  function skipToEnd() {
    if (showEnter || leaving) return
    clearTimers()
    setSlideOpacity(0)
    setBannerOpacity(0)
    setTimeout(() => {
      const last = slides.length - 1
      setSlideIndex(last)
      setVisibleLines(slides[last].lines.length)
      setSlideOpacity(1)
      setShowEnter(true)
      setTimeout(() => setEnterVisible(true), 50)
    }, SLIDE_FADE_MS)
  }

  async function enter() {
    if (leaving) return
    setLeaving(true)
    await fetch('/api/character/intro-seen', { method: 'POST' })
    router.push('/town')
  }

  const progress = ((slideIndex + 1) / slides.length) * 100

  return (
    <div
      onClick={showEnter ? undefined : skipToEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#050403',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: showEnter ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Gulch banner */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: bannerOpacity,
        transition: `opacity ${SLIDE_FADE_MS}ms ease`,
        pointerEvents: 'none',
      }}>
        <img
          src={GULCH_BANNER}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'saturate(0.35) brightness(0.8)' }}
        />
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: '#120e06' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(to right, #3a2808, #c8a040)',
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Skip hint */}
      {!showEnter && (
        <p style={{
          position: 'absolute', bottom: '28px', right: '28px',
          fontSize: '10px', color: '#2e2518',
          fontFamily: 'var(--font-cinzel, Georgia)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>
          tap to skip
        </p>
      )}

      {/* Slide content */}
      <div style={{
        maxWidth: '460px', width: '100%',
        padding: '0 36px',
        opacity: slideOpacity,
        transition: `opacity ${SLIDE_FADE_MS}ms ease`,
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        {currentSlide.lines.map((line, i) => (
          <p key={`${slideIndex}-${i}`} style={{
            fontFamily: 'var(--font-cinzel, Georgia)',
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            color: i < visibleLines - 1 ? '#5a4e36' : '#c8a870',
            lineHeight: 2,
            marginBottom: '0.2em',
            letterSpacing: '0.04em',
            opacity: i < visibleLines ? 1 : 0,
            transition: `opacity ${LINE_FADE_MS}ms ease`,
          }}>
            {line}
          </p>
        ))}

        {/* CTA */}
        {showEnter && (
          <div style={{
            marginTop: '52px',
            opacity: enterVisible ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}>
            <button
              onClick={enter}
              disabled={leaving}
              style={{
                background: 'transparent',
                border: '1px solid #6a4e20',
                color: leaving ? '#5a4828' : '#c8a050',
                fontFamily: 'var(--font-cinzel, Georgia)',
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '14px 40px',
                borderRadius: '4px',
                cursor: leaving ? 'default' : 'pointer',
                transition: 'color 0.3s, border-color 0.3s',
              }}
            >
              {leaving ? 'Entering...' : 'Enter The Gulch'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
