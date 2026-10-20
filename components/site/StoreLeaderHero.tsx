'use client'

import { useEffect, useRef } from 'react'
import { DashboardScreen, NotesScreen, PayrollScreen, TeamScreen } from './StoreLeaderScreens'

/*
 * Store leader platform page hero, built live instead of as an image: a
 * store leader's day in four screens. Laid out on a fixed 1600×500 artboard
 * (the design's values) and scaled to fit the page width. On phones the
 * frame crops the empty margins either side of the row, so the four screens
 * fill the width as large as they can while all staying in view.
 */

const ART_W = 1600

// Phone columns are 287px wide, 72px apart, centered on the artboard.
const COL_W = 287
const GAP = 72
const ROW_W = 4 * COL_W + 3 * GAP
// Phone crop: the row plus a small margin either side.
const CROP_PAD = 24
const CROP_X = (ART_W - ROW_W) / 2 - CROP_PAD
const CROP_W = ROW_W + 2 * CROP_PAD

const SCREENS = [
  { time: '07:00', label: 'Briefing', Screen: DashboardScreen },
  { time: '10:30', label: 'Payroll', Screen: PayrollScreen },
  { time: '13:00', label: 'Team', Screen: TeamScreen },
  { time: '16:00', label: 'Notes', Screen: NotesScreen },
]

export default function StoreLeaderHero() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const narrow = window.matchMedia('(max-width: 640px)')
    // The view starts hidden (0 wide); only scale from a real measurement.
    const fit = () => {
      const w = el.clientWidth
      if (!w) return
      const k = narrow.matches ? w / CROP_W : w / ART_W
      el.style.setProperty('--k', k.toFixed(4))
      el.style.setProperty('--x', `${narrow.matches ? (-CROP_X * k).toFixed(1) : 0}px`)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    narrow.addEventListener('change', fit)
    fit()
    return () => {
      ro.disconnect()
      narrow.removeEventListener('change', fit)
    }
  }, [])

  return (
    <div
      ref={root}
      className="slh"
      role="img"
      aria-label="A store leader's day in four screens: the 7:00 briefing dashboard, the 10:30 payroll forecast, 13:00 team development, and 16:00 notes."
    >
      <div className="slh-art">
        <div className="slh-grain" />
        <div className="slh-row">
          {SCREENS.map(({ time, label, Screen }) => (
            <div key={time} className="slh-col">
              <div className="slh-label">
                <span>{time}</span>
                <span>{label}</span>
              </div>
              <div className="slh-frame">
                <div className="slh-phone">
                  <div className="slf-screen">
                    <Screen />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
