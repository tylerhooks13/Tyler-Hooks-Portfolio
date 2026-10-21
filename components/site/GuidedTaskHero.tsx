'use client'

import { useEffect, useRef } from 'react'
import { OLD_TRIPS, ROUTE, STOPS, toPath } from './guided-task-data'
import { Handheld, MapPin, ScanPrompt, StopScreen, StorePlan } from './GuidedTaskScreens'

/*
 * Guided Task Management page hero, built live instead of as an image: the
 * store from Fig. 01, where the old app's four overlapping walks merge into
 * one guided route, beside a handheld waiting for a scan. Laid out on a
 * 1600×500 artboard and scaled to the page width, like the store leader
 * hero. On phones the headline drops out (the page title sits right above)
 * and the frame crops to the map and the handheld.
 */

const ART_W = 1600
// Phone crop: the map and the handheld, side by side.
const CROP_X = 110
const CROP_W = 780

export default function GuidedTaskHero() {
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
      el.classList.toggle('is-narrow', narrow.matches)
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
      className="slh gth"
      role="img"
      aria-label="Store floor plan where four overlapping walks merge into one route, next to a store handheld showing a guided walk waiting for a scan."
    >
      <div className="slh-art">
        <div className="slh-grain" />
        <StorePlan className="gth-map">
          {OLD_TRIPS.map((tr, k) => (
            <path key={k} className="gtm-trail is-ghost" d={toPath(tr.pts)} />
          ))}
          <path className="gtm-trail is-new" d={toPath(ROUTE.pts)} />
          {STOPS.map((s, k) => (
            <MapPin key={k} stop={s} n={k + 1} state={k === 1 ? 'active' : k === 0 ? 'done' : ''} />
          ))}
        </StorePlan>
        <div className="gth-copy">
          <div className="gth-title">
            Four
            <br />
            Walks.
            <br />
            One
            <br />
            Route.
          </div>
          <div className="gth-rule" />
          <div className="gth-legend">
            <span>
              <i className="is-old" />4 separate walks
            </span>
            <span>
              <i />1 guided walk
            </span>
          </div>
        </div>
        <div className="gth-device">
          <Handheld time="11:07" battery="71%">
            <div className="gtd-view is-shown">
              <StopScreen stop={STOPS[1]} index={1} total={STOPS.length} progress={0.25} action={<ScanPrompt />} />
            </div>
          </Handheld>
        </div>
      </div>
    </div>
  )
}
