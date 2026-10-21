'use client'

import { useEffect, useRef } from 'react'
import { IB_DEFAULT, buildMd, slugify } from './enablement-data'

/*
 * Card artwork for the AI Enablement case study, built live: the Instruction
 * Builder's form beside the markdown file it hands back, with the tools the
 * form checked picked out in the file. Same 1200×900 artboard and fit as
 * WpaCard, so the two cards read as one set.
 */

const ART_W = 1200
const ART_H = 900

const MD = buildMd(IB_DEFAULT).split('\n')
// The Tools heading and its bullets, up to the blank line after them.
const HIT_FROM = MD.indexOf('## Tools')
const HIT_TO = MD.indexOf('', HIT_FROM)

// The form and the file it produced, shared with the page hero (EnablementHero.tsx).
export function IbFormCard({ className = '' }: { className?: string }) {
  return (
    <div className={`aec-form ${className}`.trim()}>
      <div className="aec-label">Project</div>
      <div className="aec-input">{IB_DEFAULT.name}</div>
      <div className="aec-label">Tools</div>
      <div className="aec-chips">
        <span className="is-on">GitHub Copilot</span>
        <span className="is-on">Figma MCP</span>
        <span>Figma Make</span>
        <span className="is-on">Components MCP</span>
      </div>
    </div>
  )
}

export function IbFile() {
  return (
    <pre className="aec-md">
      {MD.map((l, i) => (
        <span
          key={i}
          className={[l.startsWith('#') ? 'aec-h' : '', i >= HIT_FROM && i < HIT_TO ? 'aec-hit' : '']
            .filter(Boolean)
            .join(' ') || undefined}
        >
          {l + '\n'}
        </span>
      ))}
    </pre>
  )
}

export const IB_FILENAME = slugify(IB_DEFAULT.name) + '.md'

export default function EnablementCard() {
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
      className="wpc aec"
      role="img"
      aria-label="An Instruction Builder form with GitHub Copilot, Figma MCP and Components MCP checked, beside the markdown file it generated, store-pickup-redesign.md, with those tools highlighted in the file."
    >
      <div className="wpc-art">
        <div className="wpc-kicker">Instruction Builder · Example</div>

        <IbFormCard />

        {/* The file runs off the bottom and right edges, like WpaCard's page. */}
        <div className="wpc-page aec-page">
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
