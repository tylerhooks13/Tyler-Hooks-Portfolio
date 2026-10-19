import Media from './Media'
import StatusTag from './StatusTag'
import StoreLeaderCard from './StoreLeaderCard'
import WpaCard from './WpaCard'
import { ARCHIVE_PRESETS, KIND_LABEL, MARQUEE, PORTRAIT, WORK_PAGES } from './data'

function MarqueeTrack({ hidden }: { hidden?: boolean }) {
  return (
    <span className="marquee-track" aria-hidden={hidden || undefined}>
      {MARQUEE.map((m) => (
        <span key={m.text} className="marquee-group">
          <span className={m.outline ? 'outline outline-thin' : undefined}>{m.text}</span>
          <span className="marquee-sep">/</span>
        </span>
      ))}
    </span>
  )
}

export default function HomeView() {
  return (
    <div className="view" data-view="home">
      <section className="section hero" data-section="00" data-section-label="index">
        <div className="eyebrow meta-row wrap">
          <span>Portfolio / 2026</span>
          <span className="hero-place-top">Austin, Texas</span>
          <span className="ink">Currently at H-E-B Digital</span>
        </div>

        <div className="rel">
          {/*
            Alternate headlines if these line breaks don't fit the layout:
              MAKING NEW TECH / USABLE           (outline USABLE)
              INTERFACES FOR / WHAT COMES / NEXT (outline NEXT)
          */}
          <h1 className="display d-hero" data-reveal="chars" data-hero="">
            Prototypes
            <br />
            that become
            <br />
            <span className="outline">products</span>
          </h1>
          {/* Phones only: location moves under the headline (the top copy is hidden there). */}
          <p className="eyebrow hero-place">Austin, Texas</p>
        </div>

        <div className="hero-foot ruled">
          <p className="lede span-2" data-scrub="">
            I&apos;m Tyler Hooks, a senior design technologist at H-E-B Digital. I turn emerging technology into things
            people can test: prototypes that ship to hundreds of stores, AI tools that change how a design team works,
            and testing that fixes the prototype between research sessions. Before that, I built component libraries at Dell and Disney.
          </p>
          <div className="kv" data-reveal="up">
            <span className="eyebrow">Currently</span>
            <span className="kv-value">Senior Design Technologist, H-E-B — Austin</span>
          </div>
          <div className="kv" data-reveal="up">
            <span className="eyebrow">Stack</span>
            <span className="kv-value">TypeScript · React · Next.js · Figma · Figma Make · a11y</span>
          </div>
        </div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee" data-marquee="">
          <MarqueeTrack />
          <MarqueeTrack hidden />
        </div>
      </div>

      <section id="work" className="section work" data-section="01" data-section-label="selected work" data-work="">
        <div className="work-pin" data-work-pin="">
          <div className="eyebrow meta-row gutter">
            <span>01 / Selected work</span>
            <span className="work-hint">Scroll to browse</span>
          </div>

          <div className="hscroll" data-hscroll="">
            {WORK_PAGES.map((c) => (
              <a
                key={c.id}
                className="card"
                data-card=""
                data-chip={`View ${KIND_LABEL[c.kind].toLowerCase()}`}
                data-go={c.id}
                href={`#${c.id}`}
              >
                <div className="card-media">
                  {c.cardLive === 'store-leader' ? (
                    <StoreLeaderCard />
                  ) : c.cardLive === 'wpa' ? (
                    <WpaCard />
                  ) : (
                    <Media id={c.slot} src={c.src} alt={c.alt} placeholder={c.title} />
                  )}
                  {c.inProgress && <StatusTag className="card-status" />}
                </div>
                <div className="card-body">
                  <div className="card-head">
                    <span className="card-title">{c.title}</span>
                    <span className="card-index">{`${c.num} · ${c.arc}`}</span>
                  </div>
                  <p className="card-blurb">{c.summary}</p>
                  <span className="card-cta">
                    <span>{c.meta}</span>
                    <span className="card-kind">{KIND_LABEL[c.kind]} →</span>
                  </span>
                </div>
              </a>
            ))}
            <div className="hscroll-end" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="archive" className="section dark rag" data-section="02" data-section-label="live demo">
        <div className="dots" aria-hidden="true" />
        <div className="rel">
          <div className="eyebrow meta-row">
            <span className="eyebrow-group">
              <span>02 / Live demo</span>
              <StatusTag />
            </span>
            <span>Texas WPA narratives · Library of Congress</span>
          </div>
          <h2 className="display d-section" data-reveal="chars">
            Ask the archive
          </h2>
          <div className="rag-intro">
            <div className="rag-intro-main">
              <p className="lede rag-lede" data-scrub="">
                The retrieval step is the design problem. Show what was found, how well it matched, and where it came from —
                before a single generated word appears.
              </p>
              <a className="mono-link rag-about" data-magnet="" data-scramble="" data-go="texas-wpa" href="#texas-wpa">
                About this project →
              </a>
            </div>
            <div className="rag-intro-notes">
              <p className="rag-note">
                Why build it: this collection has been public for years, but it&apos;s underused. The archive has no
                semantic search, and the accounts were transcribed in heavy dialect, so keyword search misses passages that
                are plainly about what you asked. This searches by meaning instead, and I&apos;m testing how well that
                bridges the dialect gap.
              </p>
              <p className="rag-note">
                These are first-person accounts recorded by the Federal Writers&apos; Project in 1936–38 from formerly
                enslaved people in Texas. They include painful history and period language. Every answer cites the
                passages it was built from, with a link to the source volume.
              </p>
            </div>
          </div>

          <div className="rag-grid">
            <div className="stack-16">
              <form className="rag-query" data-rag-form="">
                <span className="rag-prompt" aria-hidden="true">
                  ›
                </span>
                <input
                  data-rag-input=""
                  type="text"
                  placeholder="Ask the Texas WPA narratives…"
                  aria-label="Ask the Texas WPA narratives"
                  maxLength={300}
                />
                <button type="submit" className="btn-paper" data-rag-go="">
                  Query
                </button>
              </form>
              <div className="rag-presets">
                {ARCHIVE_PRESETS.map((p) => (
                  <button key={p.slug} type="button" className="chip-btn" data-rag-preset={p.slug}>
                    {p.question}
                  </button>
                ))}
              </div>
              <div className="stack-10 rag-results">
                <span className="eyebrow eyebrow-tight">
                  Retrieved <span data-rag-count="">—</span>
                </span>
                <div className="rag-chunks" data-rag-chunks="" aria-live="polite" />
              </div>
            </div>

            <div className="rag-answer-panel">
              <span className="eyebrow eyebrow-tight">Grounded answer</span>
              <p className="rag-answer" data-rag-answer="" aria-live="polite">
                Pick a question, or type your own.
                <span className="caret" data-rag-caret="" hidden>
                  ▍
                </span>
              </p>
              <span className="rag-meta" data-rag-meta="" />
            </div>
          </div>
        </div>
      </section>

      <section className="section about-teaser" data-section="03" data-section-label="about">
        <div className="grid-280">
          <div className="stack-24">
            <span className="eyebrow">03 / About</span>
            <h2 className="display d-about" data-reveal="chars">
              Dell. Disney.
              <br />
              H-E-B.
            </h2>
            <p className="lede lede-18" data-scrub="">
              Three very different companies, one consistent job: be the person who can hold the design intent and the
              implementation in their head at the same time.
            </p>
            <a className="mono-link self-start" data-magnet="" data-scramble="" data-go="about" href="#about">
              Read the long version
            </a>
          </div>
          <div className="frame portrait-sm">
            <Media id="th-portrait-a" src={PORTRAIT} alt="Portrait of Tyler Hooks" placeholder="Portrait" />
          </div>
        </div>
      </section>
    </div>
  )
}
