'use client'

import { useEffect, useState } from 'react'
import { PluginTimeline, ResearchAgent, Workflow } from './EnablementFigures'
import InstructionBuilder from './InstructionBuilder'
import { Copy, PageLinks, ProprietaryNote } from './PageParts'
import type { CaseFigure, CaseStudyPage, WorkPage } from './data'

/*
 * The case study template. Case studies run longer than projects, so the page
 * reads top to bottom down one centered column: an at-a-glance summary with
 * the facts beside it in the left margin,
 * then numbered chapters with each figure placed right after the copy it
 * supports. On wide screens a sticky section index sits in the right margin,
 * and figures stay inside the reading column so they never run under it; the
 * index hides at tablet width.
 */

const FIGURES: Record<CaseFigure, () => JSX.Element> = {
  'instruction-builder': InstructionBuilder,
  'research-agent': ResearchAgent,
  'plugin-timeline': PluginTimeline,
  workflow: Workflow,
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function CaseStudyBody({ study, next }: { study: CaseStudyPage; next: WorkPage }) {
  const glanceId = `${study.id}-glance`
  const sections = [
    { id: glanceId, label: 'At a glance' },
    ...study.chapters.map((c) => ({ id: `${study.id}-${c.id}`, label: c.label })),
  ]

  return (
    <div className="section cs-body">
      {/* Three columns: left margin, centered reading column, right margin. The index comes
          first for keyboard and screen reader users; CSS puts it in the right margin. */}
      <div className="cs-grid">
        <SectionIndex sections={sections} />

        <div className="cs-main">
          <section
            id={glanceId}
            className="cs-glance"
            data-section="01"
            data-section-label="at a glance"
            aria-label="At a glance"
          >
            <div className="cs-glance-main">
              <span className="eyebrow eyebrow-tight">01 / At a glance</span>
              <p className="lede lede-21 cs-summary" data-scrub="">
                {study.glance}
              </p>
              {study.proprietary && <ProprietaryNote />}
            </div>
            {/* Facts sit in the left margin beside the summary on wide screens, below it on narrow ones. */}
            <div className="cs-facts">
              {study.facts.map((f) => (
                <div key={f.label} className="kv kv-6">
                  <span className="eyebrow eyebrow-tight">{f.label}</span>
                  <span className="kv-body">{f.value}</span>
                </div>
              ))}
            </div>
          </section>

          {study.chapters.map((c, i) => {
            const id = `${study.id}-${c.id}`
            const n = pad(i + 2)
            return (
              <section
                key={c.id}
                id={id}
                className="cs-chapter"
                data-section={n}
                data-section-label={c.label.toLowerCase()}
                aria-labelledby={`${id}-title`}
              >
                <span className="eyebrow eyebrow-tight">{`${n} / ${c.label}`}</span>
                <h2 className="cs-title" id={`${id}-title`}>
                  {c.title}
                </h2>
                {c.body.map((block, k) => {
                  if (typeof block === 'string') return <Copy key={k} text={block} className="lede cs-text" />
                  const Figure = FIGURES[block.figure]
                  return (
                    <div key={k} className="cs-figure">
                      <Figure />
                    </div>
                  )
                })}
              </section>
            )
          })}

          <PageLinks next={next} />
        </div>
      </div>
    </div>
  )
}

// Sticky list of section links; the one under the reading line is marked.
// Links scroll through motion.ts (data-scroll-to), like every in-page jump.
function SectionIndex({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0].id)

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    // A thin band a third of the way down the screen: whichever section
    // crosses it is the one being read.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-33% 0px -66% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  return (
    <nav className="cs-index" aria-label="Sections">
      <span className="eyebrow eyebrow-tight">On this page</span>
      <ol>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} data-scroll-to={s.id} aria-current={s.id === active ? 'location' : undefined}>
              <span className="cs-index-num">{pad(i + 1)}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
