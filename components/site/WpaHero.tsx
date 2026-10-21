'use client'

import { useEffect, useRef } from 'react'

/*
 * Texas WPA Narratives page hero, built live instead of as an image: one
 * plain-English question fanning out to the passages it retrieved, each
 * typed page cut off by the frame. Laid out on the design's 1600×640
 * artboard and scaled to the page width. On phones the frame trims the empty
 * left margin so the whole composition fills the width as large as it can.
 */

const ART_W = 1600
// Phone crop: from the left margin to the artboard's right edge.
const CROP_X = 72
const CROP_W = ART_W - CROP_X

export default function WpaHero() {
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
      className="wph"
      role="img"
      aria-label="The plain-English question “How did people learn they were free?” retrieves five passages matched by meaning, not spelling. Felix Haywood: “Hallelujah broke out.” John James: “You is slaves no more. You is free.”"
    >
      <div className="wph-art">
        <div className="wph-kicker">FWP · Texas · 1936–38</div>

        <div className="wph-query">
          <div className="wph-label">Query · Plain English</div>
          <div className="wph-query-text">› How did people learn they were free?</div>
          <div className="wph-note">
            ↓ 5 passages · matched by meaning,
            <br />
            not spelling
          </div>
        </div>

        <div className="wph-arrow">
          <div className="wph-dash" />
          <div className="wph-head" />
        </div>

        <div className="wph-pages">
          <div className="wph-page" style={{ marginTop: 96 }}>
            <div className="wph-meta">
              <span>[2] Felix Haywood</span>
              <span>0.384</span>
            </div>
            <p className="wph-text">
              &quot;The end of the war, it come jus&apos; like that--like you snap your fingers.&quot; &quot;How did you
              know the end of the war had come?&quot; asked the interviewer. &quot;How did we know it!{' '}
              <mark>Hallelujah broke out--</mark>
            </p>
          </div>

          <div className="wph-page" style={{ marginTop: 176 }}>
            <div className="wph-meta">
              <span>[3] John James</span>
              <span>0.391</span>
            </div>
            <p className="wph-text">
              Him ring de bell and dat am sho&apos; &apos;nough de liberty bell, &apos;cause him read from de long paper
              and say, <mark>&apos;You is slaves no more. You is free.&apos;</mark>
            </p>
          </div>

          {/* The rest of the results, stacked behind as a greyed-out page. */}
          <div className="wph-page is-more" style={{ marginTop: 256 }}>
            <div className="wph-meta">
              <span>[4]–[5]</span>
              <span>+2 more</span>
            </div>
            <div className="wph-lines">
              <span style={{ width: '94%' }} />
              <span style={{ width: '80%' }} />
              <span style={{ width: '88%' }} />
              <span style={{ width: '70%' }} />
              <span style={{ width: '84%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
