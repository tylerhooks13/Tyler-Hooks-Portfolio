'use client'

import { useEffect } from 'react'
import { useAnimate } from 'framer-motion'

export default function Hero() {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      const el = scope.current as HTMLElement
      if (!el) return
      ;(el.querySelector('.hero-role') as HTMLElement | null)?.style.setProperty('opacity', '1')
      ;(el.querySelector('.hero-loader') as HTMLElement | null)?.style.setProperty('opacity', '0')
      ;(el.querySelector('.hero-name') as HTMLElement | null)?.style.setProperty('opacity', '1')
      ;(el.querySelector('.hero-name') as HTMLElement | null)?.style.setProperty('transform', 'none')
      ;(el.querySelector('.hero-divider') as HTMLElement | null)?.style.setProperty('transform', 'scaleY(1)')
      ;(el.querySelector('.hero-intro') as HTMLElement | null)?.style.setProperty('opacity', '1')
      ;(el.querySelector('.hero-intro') as HTMLElement | null)?.style.setProperty('transform', 'none')
      window.dispatchEvent(new CustomEvent('hero:intro-reveal'))
      return
    }

    async function sequence() {
      // Phase 1 — loader line extends left→right
      await animate('.hero-loader', { scaleX: 1 }, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })

      // Phase 2 — name rises (non-blocking so phase 3 can overlap)
      animate('.hero-name', { y: 0, opacity: 1 }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })

      // Phase 3 — give name a head start, then morph loader into divider
      await new Promise<void>((r) => setTimeout(r, 300))
      animate('.hero-loader', { opacity: 0 }, { duration: 0.4 })
      await animate('.hero-divider', { scaleY: 1 }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })

      // Phase 4 — intro text and role label slide up together, signal nav to reveal
      window.dispatchEvent(new CustomEvent('hero:intro-reveal'))
      animate('.hero-role', { opacity: 1, y: 0 }, { duration: 0.75, ease: [0.16, 1, 0.3, 1] })
      await animate('.hero-intro', { y: 0, opacity: 1 }, { duration: 0.75, ease: [0.16, 1, 0.3, 1] })

    }

    sequence()
  }, [])

  return (
    <section className="hero" ref={scope}>
      {/* Phase 0: role label */}
      <p
        className="hero-role"
        style={{ opacity: 0, transform: 'translateY(30px)' }}
      >
        Design Technologist
      </p>

      {/* Phase 1: full-width loader line */}
      <div className="hero-loader" />

      {/* Phase 2: name */}
      <h1
        className="hero-name"
        style={{ opacity: 0, transform: 'translateY(60px)' }}
      >
        TYLER HOOKS
      </h1>

      {/* Phase 3: vertical divider */}
      <div className="hero-divider" />

      {/* Phase 4: intro text */}
      <div
        className="hero-intro"
        style={{ opacity: 0, transform: 'translateY(30px)' }}
      >
        <p>
          Lorem ipsum dolor sit amet consectetur. Magna neque eu hendrerit nam
          vel. Gravida commodo molestie non elementum vestibulum tristique.
        </p>
      </div>

    </section>
  )
}
