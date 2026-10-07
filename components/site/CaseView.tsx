import type { ReactNode } from 'react'
import Media from './Media'
import { KIND_LABEL, TBD, WORK_PAGES, type WorkPage } from './data'

// Project and case-study copy is still being written: anything equal to TBD renders as a
// visible placeholder. TODO: copy pending — fill in WORK_PAGES in data.ts.
function Copy({ text }: { text: string }) {
  if (text === TBD) return <p className="tbd">{TBD}</p>
  return (
    <p className="lede lede-21" data-scrub="">
      {text}
    </p>
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

function WorkPageView({ study, next }: { study: WorkPage; next: WorkPage }) {
  return (
    <div className="view" data-view={study.id} hidden>
      <section className="section case-hero" data-section="00" data-section-label={KIND_LABEL[study.kind].toLowerCase()}>
        <div className="eyebrow meta-row wrap">
          <span>{`${KIND_LABEL[study.kind]} ${study.num}`}</span>
          <span>{study.arc}</span>
          <span className="ink">{study.meta}</span>
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
        <div className="fullbleed" data-fullbleed="">
          <Media id={`${study.slot}-hero`} placeholder={`${study.title} — hero visual ${TBD}`} />
        </div>
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
                        <p className="lede move-text" data-scrub="">
                          {move.text}
                        </p>
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
              <div className="figures">
                {(study.figures ?? [1, 2, 3].map(() => ({ caption: '', src: undefined }))).map((f, i) => (
                  <figure key={i} className="figure-item">
                    <div className="frame figure">
                      <Media
                        id={`${study.slot}-fig-${i + 1}`}
                        src={f.src}
                        alt={f.caption}
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
            </div>

            <Prose label="Outcome">
              <Copy text={study.outcome} />
            </Prose>

            <Prose label="Reflection">
              <Copy text={study.reflection} />
            </Prose>

            <div className="link-row ruled" data-reveal="up">
              <a className="mono-link" data-magnet="" data-scramble="" data-go="home" href="/">
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
