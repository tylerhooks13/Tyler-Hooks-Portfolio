// Pieces shared by the project and case study templates (CaseView.tsx, CaseStudyBody.tsx).

import type { ReactNode } from 'react'
import { TBD, type WorkPage } from './data'

// **bold** runs inside a line of copy.
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
    </>
  )
}

// Project and case-study copy is still being written: anything equal to TBD renders as a
// visible placeholder. TODO: copy pending — fill in WORK_PAGES in data.ts.
// A blank line in the copy starts a new paragraph; a block whose lines all
// start with "- " is a bulleted list.
export function Copy({ text, className = 'lede lede-21' }: { text: string; className?: string }) {
  if (text === TBD) return <p className="tbd">{TBD}</p>
  return (
    <>
      {text.split(/\n\s*\n/).map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim())
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i} className="copy-list">
              {lines.map((l, k) => (
                <li key={k} className={className}>
                  <Inline text={l.slice(2)} />
                </li>
              ))}
            </ul>
          )
        }
        // The word scrub rewrites a paragraph's text, so it only runs on plain ones.
        return block.includes('**') ? (
          <p key={i} className={className}>
            <Inline text={block} />
          </p>
        ) : (
          <p key={i} className={className} data-scrub="">
            {block}
          </p>
        )
      })}
    </>
  )
}

export function Prose({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="prose">
      <span className="eyebrow eyebrow-tight">{label}</span>
      {children}
    </div>
  )
}

// Standard line for pages whose screens are recreations.
export function ProprietaryNote() {
  return (
    <p className="eyebrow figures-note">
      Screens recreated to protect proprietary work.{' '}
      <a className="ink" data-scroll-to="contact" href="/#contact">
        Full walkthrough available on request →
      </a>
    </p>
  )
}

// "All work" back, "Next" forward: the last line of every page.
export function PageLinks({ next }: { next: WorkPage }) {
  return (
    <div className="link-row ruled" data-reveal="up">
      <a className="mono-link" data-magnet="" data-go="home" data-scroll-to="work" href="/#work">
        ← All work
      </a>
      <a className="mono-link" data-magnet="" data-go={next.id} href={`#${next.id}`}>
        {`Next: ${next.title} →`}
      </a>
    </div>
  )
}
