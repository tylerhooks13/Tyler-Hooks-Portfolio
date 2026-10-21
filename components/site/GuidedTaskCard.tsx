'use client'

import { useEffect, useRef } from 'react'
import { STOPS } from './guided-task-data'
import { Handheld, StopScreen } from './GuidedTaskScreens'

/*
 * Card artwork for the Guided Task Management project, built live: a guided
 * walk stop on the store handheld beside what the product is. Shares the
 * Seamless Store card's ground, artboard and copy styles (.slc-*), so the two
 * cards read as a set. 1000×750, scaled to fit the card's image slot.
 */

const ART_W = 1000
const ART_H = 750

export default function GuidedTaskCard() {
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
      className="slc gtc"
      role="img"
      aria-label="Store handheld showing a guided walk stop with Replenish and No action buttons, beside the headline “Guided walks for store teams.”"
    >
      <div className="slc-art">
        <div className="gtc-device">
          <Handheld time="11:07" battery="71%">
            <div className="gtd-view is-shown">
              <StopScreen
                stop={STOPS[1]}
                index={1}
                total={STOPS.length}
                progress={0.25}
                action={
                  <div className="gtd-decide">
                    <span className="gtd-pill">No action</span>
                    <span className="gtd-pill is-solid">Replenish</span>
                  </div>
                }
              />
            </div>
          </Handheld>
        </div>
        <div className="slc-copy">
          <div className="slc-title">
            Guided
            <br />
            Walks
            <br />
            For store
            <br />
            Teams
          </div>
          <div className="slc-rule" />
          <p className="slc-desc">Four inventory walks combined into one route, built and tested on store handhelds.</p>
          <div className="slc-tags">
            <span>Count</span>
            <span>·</span>
            <span>Restock</span>
            <span>·</span>
            <span>Check</span>
            <span>·</span>
            <span>Adjust</span>
          </div>
        </div>
      </div>
    </div>
  )
}
