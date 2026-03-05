'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useAnimate } from 'framer-motion'

export default function Navigation() {
  const [scope, animate] = useAnimate()

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      const el = scope.current as HTMLElement | null
      if (el) el.style.opacity = '1'
      return
    }

    const onReveal = () => {
      animate(scope.current, { opacity: 1, y: 0 }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })
    }

    window.addEventListener('hero:intro-reveal', onReveal, { once: true })
    return () => window.removeEventListener('hero:intro-reveal', onReveal)
  }, [])

  return (
    <nav ref={scope} style={{ opacity: 0, transform: 'translateY(-10px)' }}>
      <Link href="#about" onClick={(e) => scrollToSection(e, 'about')}>
        About
      </Link>
      <Link href="#portfolio" onClick={(e) => scrollToSection(e, 'portfolio')}>
        Projects
      </Link>
    </nav>
  )
}
