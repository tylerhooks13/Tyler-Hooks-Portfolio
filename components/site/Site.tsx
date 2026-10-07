'use client'

import { useEffect, useRef } from 'react'
import AboutView from './AboutView'
import CaseView from './CaseView'
import { Header, Loader, Texture } from './Chrome'
import Contact from './Contact'
import HomeView from './HomeView'
import { initSiteMotion } from './motion'

// Design knobs carried over from the Claude Design props panel.
const MOTION = { loader: true, grain: 0.32 }

export default function Site() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current) return
    return initSiteMotion(root.current, MOTION)
  }, [])

  // Rendered once and never re-rendered: motion.ts mutates this DOM directly.
  return (
    <div ref={root} className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Texture />
      <Loader />
      <Header />
      <main id="main" tabIndex={-1}>
        <HomeView />
        <CaseView />
        <AboutView />
      </main>
      <Contact />
    </div>
  )
}
