'use client'

import { useEffect, useRef } from 'react'
import { DashboardScreen } from './StoreLeaderScreens'

/*
 * Card artwork for the Seamless Store Experience project, built live: the
 * dashboard screen beside what the app is, on the dark hatched ground used
 * by the page hero. Laid out on the design's 1000×750 artboard and scaled to
 * fit the card's image slot (4:3, or 16:9 on phones, where it centers).
 */

const ART_W = 1000
const ART_H = 750

export default function StoreLeaderCard() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const fit = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      const k = Math.min(w / ART_W, h / ART_H)
      el.style.setProperty('--k', k.toFixed(4))
      el.style.setProperty('--x', `${((w - ART_W * k) / 2).toFixed(1)}px`)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    fit()
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={root}
      className="slc"
      role="img"
      aria-label="A mobile platform for store leaders: the dashboard, with key metrics, an AI briefing summary, action items and recognition."
    >
      <div className="slc-art">
        <div className="slc-phone">
          <div className="slf-screen">
            <DashboardScreen />
          </div>
        </div>
        <div className="slc-copy">
          <div className="slc-title">
            Mobile
            <br />
            Platform
            <br />
            For store
            <br />
            Leaders
          </div>
          <div className="slc-rule" />
          <p className="slc-desc">
            The briefing, payroll, team development, and notes in one app, built and tested in 15 stores.
          </p>
          <div className="slc-tags">
            <span>Briefing</span>
            <span>·</span>
            <span>Payroll</span>
            <span>·</span>
            <span>Team</span>
            <span>·</span>
            <span>Notes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
