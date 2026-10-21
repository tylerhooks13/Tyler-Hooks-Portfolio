'use client'

import { useEffect, useRef } from 'react'
import { IB_FILENAME, IbFile, IbFormCard } from './EnablementCard'

/*
 * AI Enablement page hero, built live instead of as an image: the Instruction
 * Builder's form pointing into the markdown file it hands back, the tools it
 * checked picked out in the file. Same pieces as the card (EnablementCard.tsx)
 * on the same 1600×640 artboard and hatched ground as WpaHero, so the heroes
 * read as a set. The working builder is Fig. 1 in the page body.
 */

const ART_W = 1600
// Phone crop: from the left margin to the artboard's right edge.
const CROP_X = 72
const CROP_W = ART_W - CROP_X

export default function EnablementHero() {
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
      className="wph aeh"
      role="img"
      aria-label={`An Instruction Builder form for an example project, Store pickup redesign, with GitHub Copilot, Figma MCP and Components MCP checked. An arrow points to the markdown file it generated, ${IB_FILENAME}, where those tools are highlighted.`}
    >
      <div className="wph-art">
        <div className="wph-kicker">Instruction Builder · Example</div>

        <IbFormCard className="aeh-form" />

        <div className="wph-arrow">
          <div className="wph-dash" />
          <div className="wph-head" />
        </div>

        {/* The file runs off the right and bottom edges of the frame. */}
        <div className="aeh-page">
          <div className="wpc-meta">
            <span>{IB_FILENAME}</span>
            <span>Markdown</span>
          </div>
          <IbFile />
        </div>
      </div>
    </div>
  )
}
