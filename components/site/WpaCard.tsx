'use client'

import { useEffect, useRef } from 'react'

/*
 * Card artwork for the Texas WPA Narratives project, built live: a query
 * pointing into the exact passage it retrieved, on a narrative page set in
 * typewriter type like the original transcripts. Laid out on the design's
 * 1200×900 artboard and scaled to fit the card's image slot (4:3, or 16:9 on
 * phones, where it centers).
 */

const ART_W = 1200
const ART_H = 900

export default function WpaCard() {
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
      className="wpc"
      role="img"
      aria-label="The question “How did people learn they were free?” points to the passage it retrieved from John James's narrative, where he recalls being read the news: “You is slaves no more. You is free.”"
    >
      <div className="wpc-art">
        <div className="wpc-kicker">FWP · Texas · 1936–38</div>

        <div className="wpc-page">
          <div className="wpc-meta">
            <span>[3] John James · #420016 · Part 2</span>
            <span>Dist 0.391</span>
          </div>
          <p className="wpc-text">
            My pappy done die befo&apos; I &apos;member him. &quot;One day Massa Chapman call all us to de front gallery.
            Us didn&apos;t know what gwine to happen, &apos;cause it not ord&apos;nary to git called from de work. Him
            ring de bell and dat am sho&apos; &apos;nough de liberty bell,
          </p>
          <div className="wpc-hit">
            <p className="wpc-text">
              <mark>
                &apos;cause him read from de long paper and say, &apos;You is slaves no more. You is free.&apos;&quot;
              </mark>
            </p>
            {/* The query sits in the margin, its arrow landing on the highlight. */}
            <div className="wpc-query">
              <div className="wpc-query-box">
                <div className="wpc-query-label">Query</div>
                <div className="wpc-query-text">› How did people learn they were free?</div>
              </div>
              <div className="wpc-arrow" />
              <div className="wpc-head" />
            </div>
          </div>
          {/* The rest of the page, as greyed-out lines. */}
          <div className="wpc-lines">
            <span style={{ width: '92%' }} />
            <span style={{ width: '78%' }} />
            <span style={{ width: '86%' }} />
            <span style={{ width: '64%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
