'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { DashboardScreen, NotesScreen, PayrollScreen, TeamScreen } from './StoreLeaderScreens'

/*
 * Store leader platform page hero, built live instead of as an image: a
 * store leader's day in four screens. Laid out on a fixed 1600×500 artboard
 * (the design's values) and scaled to fit: to the full width on larger
 * screens, to a 300px-tall strip that swipes one screen at a time on phones.
 */

const ART_W = 1600
const ART_H = 500
const PHONE_H = 300 // strip height on phones

// Phone columns are 287px wide, 72px apart, centered: the midpoint of each,
// on the artboard, is where swiping snaps on phones.
const COL_W = 287
const GAP = 72
const LEFT = (ART_W - (4 * COL_W + 3 * GAP)) / 2

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
      if (!el.clientWidth) return
      const k = narrow.matches ? PHONE_H / ART_H : el.clientWidth / ART_W
      el.style.setProperty('--k', k.toFixed(4))
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
      <div className="slh-track">
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
        {SCREENS.map((s, i) => (
          <span
            key={s.time}
            className="slh-snap"
            style={{ '--x': LEFT + COL_W / 2 + i * (COL_W + GAP) } as CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
