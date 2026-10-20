import type { CSSProperties, ReactNode } from 'react'
import Media from './Media'
import StatusTag from './StatusTag'
import StoreLeaderFigures from './StoreLeaderFigures'
import StoreLeaderHero from './StoreLeaderHero'
import WpaFigures from './WpaFigures'
import WpaHero from './WpaHero'
import { KIND_LABEL, TBD, WORK_PAGES, type WorkPage } from './data'

// **bold** runs inside a line of copy.
function Inline({ text }: { text: string }) {
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
function Copy({ text, className = 'lede lede-21' }: { text: string; className?: string }) {
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

function Prose({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="prose">
      <span className="eyebrow eyebrow-tight">{label}</span>
      {children}
    </div>
  )
}

const PLACEHOLDER_FIGURES: NonNullable<WorkPage['figures']> = [{ caption: '' }, { caption: '' }, { caption: '' }]

function WorkPageView({ study, next }: { study: WorkPage; next: WorkPage }) {
  return (
    <div className="view" data-view={study.id} hidden>
      <section className="section case-hero" data-section="00" data-section-label={KIND_LABEL[study.kind].toLowerCase()}>
        <div className="eyebrow meta-row wrap">
          <span>{`${KIND_LABEL[study.kind]} ${study.num}`}</span>
          {study.arcOnPage !== false && <span>{study.arc}</span>}
          <span className="ink">{study.meta}</span>
          {study.inProgress && <StatusTag />}
        </div>
        <h1 className="display d-case" data-reveal="chars" data-hero="">
          {study.headline.solid}
          {study.headline.outline && (
            <>
              <br />
              <span className="outline">{study.headline.outline}</span>
            </>
          )}
        </h1>
        <p className="lede case-summary" data-scrub="">
          {study.summary}
        </p>
        {study.links && (
          <div className="case-links">
            {study.links.map((l) =>
              l.scrollTo ? (
                <a key={l.label} className="mono-link" data-magnet="" data-scroll-to={l.scrollTo} href={`/#${l.scrollTo}`}>
                  {l.label}
                </a>
              ) : l.href ? (
                <a key={l.label} className="mono-link" data-magnet="" href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ) : (
                // TODO: link pending — set `href` on this link in WORK_PAGES.
                <span key={l.label} className="tbd-inline">{`${l.label} ${TBD}`}</span>
              ),
            )}
          </div>
        )}
        {study.heroLive === 'store-leader' ? (
          <div className="fullbleed fullbleed-live" data-fullbleed="">
            <StoreLeaderHero />
          </div>
        ) : study.heroLive === 'wpa' ? (
          <div className="fullbleed fullbleed-live" data-fullbleed="">
            <WpaHero />
          </div>
        ) : (
          <div
            className={study.hero?.ratio ? 'fullbleed fullbleed-fit' : 'fullbleed'}
            data-fullbleed=""
            style={study.hero?.ratio ? ({ '--ratio': study.hero.ratio } as CSSProperties) : undefined}
          >
            <Media
              id={`${study.slot}-hero`}
              src={study.hero?.src}
              alt={study.hero?.alt}
              placeholder={`${study.title} — hero visual ${TBD}`}
            />
            {study.hero?.panels &&
              Array.from({ length: study.hero.panels }, (_, i) => (
                <span
                  key={i}
                  className="fullbleed-snap"
                  aria-hidden="true"
                  style={{ '--i': i, '--panels': study.hero?.panels } as CSSProperties}
                />
              ))}
          </div>
        )}
      </section>

      <section className="section case-body" data-section="01" data-section-label="the challenge">
        <div className="case-grid">
          <div className="case-facts">
            {study.facts.map((f) => (
              <div key={f.label} className="kv kv-6">
                <span className="eyebrow eyebrow-tight">{f.label}</span>
                <span className={f.value === TBD ? 'kv-body tbd-inline' : 'kv-body'}>{f.value}</span>
              </div>
            ))}
          </div>

          <div className="case-main span-2">
            {study.context && (
              <Prose label="Context">
                <Copy text={study.context} />
              </Prose>
            )}

            <Prose label="The challenge">
              <Copy text={study.challenge} />
            </Prose>

            <Prose label="Approach">
              <ol className="moves">
                {study.approach.map((move, i) => (
                  <li key={i}>
                    <span className="move-num">{String(i + 1).padStart(2, '0')}</span>
                    {typeof move === 'string' ? (
                      <Copy text={move} />
                    ) : (
                      <div className="move-body">
                        <h3 className="move-title">{move.title}</h3>
                        <Copy text={move.text} className="lede move-text" />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </Prose>

            <div>
              {study.proprietary && (
                <p className="eyebrow figures-note">
                  Screens recreated to protect proprietary work.{' '}
                  <a className="ink" data-scroll-to="contact" href="/#contact">
                    Full walkthrough available on request →
                  </a>
                </p>
              )}
              {study.interactiveFigures === 'store-leader' ? (
                <StoreLeaderFigures />
              ) : study.interactiveFigures === 'wpa' ? (
                <WpaFigures />
              ) : (
                <div className="figures">
                  {(study.figures ?? PLACEHOLDER_FIGURES).map((f, i) => (
                    <figure key={i} className="figure-item">
                      <div className="frame figure">
                        <Media
                          id={`${study.slot}-fig-${i + 1}`}
                          src={f.src}
                          alt={f.alt ?? f.caption}
                          placeholder={f.caption ? 'Image pending' : `Figure ${i + 1} ${TBD}`}
                        />
                      </div>
                      {f.caption && (
                        <figcaption>
                          <span className="figure-num">{`Figure ${i + 1}`}</span>
                          {f.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </div>

            {(study.sections ?? [{ title: 'Outcome', text: study.outcome ?? TBD }]).map((sec) => (
              <Prose key={sec.title} label={sec.title}>
                <Copy text={sec.text} />
              </Prose>
            ))}

            <Prose label="Reflection">
              <Copy text={study.reflection} />
            </Prose>

            <div className="link-row ruled" data-reveal="up">
              <a className="mono-link" data-magnet="" data-scramble="" data-go="home" data-scroll-to="work" href="/#work">
                ← All work
              </a>
              <a className="mono-link" data-magnet="" data-scramble="" data-go={next.id} href={`#${next.id}`}>
                {`Next: ${next.title} →`}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// One page per project / case study, in carousel order; "Next" cycles through them.
export default function WorkPageViews() {
  return (
    <>
      {WORK_PAGES.map((study, i) => (
        <WorkPageView key={study.id} study={study} next={WORK_PAGES[(i + 1) % WORK_PAGES.length]} />
      ))}
    </>
  )
}
