'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { haptic } from './haptics'
import {
  DIALECT_ROUND1,
  KEYWORD_VS_MEANING,
  MASTER_SPELLINGS,
  NEXT_CAPTION,
  NEXT_NOTE,
  NEXT_ROWS,
  NEXT_SOURCE,
  PAIR_CAPTIONS,
  SPELLING_CAPTION,
  type DialectVariant,
} from './wpa-dialect-gap'
import { EVAL_LANES, EVAL_LEVELS, EVAL_QUESTIONS, EVAL_TAGS, type EvalQuestion } from './wpa-eval'

/*
 * Figures for the Texas WPA Narratives page, in place of static images.
 * Fig. 1: the dialect gap, in four tabs (keyword vs meaning, the round 1
 * dialect pairs, spelling variation, and what round 2 changes).
 * Fig. 2: the 78-question evaluation set with round 1 results.
 * Both run on static data (wpa-dialect-gap.ts, wpa-eval.ts) and never call
 * the archive API; the live demo is the only part of the site that does.
 */

export default function WpaFigures() {
  return (
    <div className="wpf-stack">
      <DialectGap />
      <EvalSet />
    </div>
  )
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Splits `text` into plain and highlighted runs, matching `terms` literally
// and case-insensitively.
function segments(text: string, terms: string[]) {
  if (!terms.length) return [{ t: text, hl: false }]
  const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi')
  return text
    .split(re)
    .filter((x) => x !== '')
    .map((x) => ({ t: x, hl: terms.some((t) => t.toLowerCase() === x.toLowerCase()) }))
}

const unique = <T,>(xs: T[]) => xs.filter((x, i) => xs.indexOf(x) === i)

// Renders every variant in the same grid cell and shows only the active one,
// so the block is always as tall as its tallest variant and the figure never
// changes height as you click through it. Hidden variants are
// visibility: hidden, which also takes them out of the tab order and the
// accessibility tree.
function Stack({ active, children }: { active: number; children: ReactNode[] }) {
  return (
    <div className="wpf-cell">
      {children.map((child, i) => (
        <div key={i} className={i === active ? 'wpf-cell-item' : 'wpf-cell-item is-off'}>
          {child}
        </div>
      ))}
    </div>
  )
}

/* ---------- Fig. 1: the dialect gap ---------- */

const TABS = [
  { key: 'keyword', label: 'Keyword vs meaning', title: 'Search by spelling, or by meaning' },
  { key: 'pairs', label: 'Round 1 pairs', title: 'Same question, two spellings' },
  { key: 'spell', label: 'One word, many spellings', title: 'One word, many spellings' },
  { key: 'next', label: "What's next", title: 'Round 2: matched questions' },
] as const
type TabKey = (typeof TABS)[number]['key']

function DialectGap() {
  const [tab, setTab] = useState<TabKey>('keyword')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const active = TABS.findIndex((t) => t.key === tab)

  // Tabs pattern: arrow keys move between tabs, Home/End jump to the ends.
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = TABS.length
    const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    setTab(TABS[to].key)
    tabRefs.current[to]?.focus()
  }

  return (
    <figure className="wpf" aria-labelledby="wpf-f1">
      <div className="wpf-head">
        <span className="wpf-label">Fig. 1 · The dialect gap</span>
        <div className="wpf-tabs" role="tablist" aria-label="View">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`wpf-tab-${t.key}`}
              aria-selected={t.key === tab}
              aria-controls="wpf-f1-panel"
              tabIndex={t.key === tab ? 0 : -1}
              onClick={() => (haptic('tap'), setTab(t.key))}
              onKeyDown={(e) => onKey(e, i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" id="wpf-f1-panel" aria-labelledby={`wpf-tab-${tab}`}>
        <Stack active={active}>
          {TABS.map((t) => (
            <div key={t.key} className="wpf-panel">
              <h3 className="display wpf-title" id={t.key === tab ? 'wpf-f1' : undefined}>
                {t.title}
              </h3>
              {t.key === 'keyword' && <KeywordView />}
              {t.key === 'pairs' && <PairsView />}
              {t.key === 'spell' && <SpellingView />}
              {t.key === 'next' && <NextView />}
            </div>
          ))}
        </Stack>
      </div>
    </figure>
  )
}

function KeywordView() {
  const [mode, setMode] = useState<'keyword' | 'meaning'>('keyword')
  const cur = KEYWORD_VS_MEANING
  const keyword = mode === 'keyword'

  const termRe = new RegExp(cur.terms.map(escapeRe).join('|'), 'i')
  const n = cur.passages.length
  const hits = cur.passages.filter((p) => termRe.test(p.text)).length
  const quoted = cur.terms.map((t) => `"${t}"`).join(' / ')

  const body = (kw: boolean) => (
    <div className="wpf-panel">
      <div className="wpf-status">
        <span aria-live={kw === keyword ? 'polite' : undefined}>
          {kw
            ? `KEYWORD SEARCH · ${quoted} · ${hits} OF ${n} PASSAGES MATCH`
            : `SEARCH BY MEANING · ${n} OF ${n} RETRIEVED`}
        </span>
        <span className="wpf-label">{cur.kindLabel}</span>
      </div>

      <ol className="wpf-passages">
        {cur.passages.map((p, i) => {
          const hit = termRe.test(p.text)
          const tag = kw ? (hit ? 'Keyword match' : 'Missed by keyword') : `Dist ${p.dist}`
          return (
            <li key={`${p.id}-${i}`} className={kw && !hit ? 'wpf-passage is-missed' : 'wpf-passage'}>
              <div className="wpf-meta">
                <span className="wpf-dim">{`[${i + 1}] ${p.who} · #${p.id} · ${p.part}`}</span>
                <span>{tag}</span>
              </div>
              <p className="wpf-quote wpf-dim">
                {segments(p.text, kw ? cur.terms : p.spans).map((s, k) =>
                  s.hl ? <mark key={k}>{s.t}</mark> : <span key={k}>{s.t}</span>,
                )}
              </p>
              {!kw && <p className="wpf-gloss">{p.gloss}</p>}
            </li>
          )
        })}
      </ol>

      <p className="wpf-caption">{kw ? cur.kwCaption : cur.mnCaption}</p>
    </div>
  )

  return (
    <>
      <div className="wpf-row">
        <p className="wpf-prompt">
          <span aria-hidden="true">› </span>
          {cur.q}
        </p>
        <div className="wpf-toggle" role="group" aria-label="Search mode">
          <button type="button" aria-pressed={keyword} onClick={() => (haptic('tap'), setMode('keyword'))}>
            Keyword
          </button>
          <button type="button" aria-pressed={!keyword} onClick={() => (haptic('tap'), setMode('meaning'))}>
            Meaning
          </button>
        </div>
      </div>

      <Stack active={keyword ? 0 : 1}>{[body(true), body(false)]}</Stack>
    </>
  )
}

const targetRank = (v: DialectVariant) => {
  const hit = v.results.find((r) => r.id === v.target_id)
  return hit ? `#${hit.rank}` : 'not in top 5'
}
const usesConcept = (v: DialectVariant) => v.results.filter((r) => r.terms.length).length

function PairsView() {
  const [pairIdx, setPairIdx] = useState(0)
  const pairs = DIALECT_ROUND1.pairs

  return (
    <>
      <div className="wpf-presets" role="group" aria-label="Round 1 pair">
        <span className="wpf-label">Round 1 pair</span>
        {pairs.map((p, i) => (
          <button key={p.id} type="button" aria-pressed={i === pairIdx} onClick={() => (haptic('tap'), setPairIdx(i))}>
            {p.label}
          </button>
        ))}
      </div>
      <Stack active={pairIdx}>
        {pairs.map((p, i) => (
          <PairBody key={p.id} pair={p} live={i === pairIdx} />
        ))}
      </Stack>
    </>
  )
}

function PairBody({ pair, live }: { pair: (typeof DIALECT_ROUND1.pairs)[number]; live: boolean }) {
  const ids = pair.variants.map((v) => v.results.map((r) => r.id))
  const shared = unique(ids[0]).filter((id) => ids[1].includes(id)).length
  const [plain, phonetic] = pair.variants

  const stats = [
    { k: `Found ${pair.target}`, v: `Plain ${targetRank(plain)} · Phonetic ${targetRank(phonetic)}` },
    { k: "Results using the concept's words", v: `Plain ${usesConcept(plain)}/5 · Phonetic ${usesConcept(phonetic)}/5` },
    { k: 'Narrators in both lists', v: String(shared) },
  ]

  return (
    <div className="wpf-panel">
      <div className="wpf-cols" aria-live={live ? 'polite' : undefined}>
        {pair.variants.map((v, vi) => {
          const other = ids[1 - vi]
          return (
            <div key={v.id} className="wpf-col">
              <span className="wpf-label">{v.kind === 'plain' ? 'Plain English' : 'Phonetic spelling'}</span>
              <p className="wpf-pq">
                <span aria-hidden="true">› </span>
                {v.q}
              </p>
              <ol className="wpf-results">
                {v.results.map((r) => (
                  <li key={`${r.rank}-${r.id}`} className="wpf-result">
                    <div className="wpf-result-head">
                      <span className="wpf-result-name">
                        <span>{`#${r.rank} ${r.name}`}</span>
                        {r.id === v.target_id && <span className="wpf-badge is-solid">Target</span>}
                        {other.includes(r.id) && <span className="wpf-badge">In both</span>}
                      </span>
                      <span className="wpf-muted">{r.dist.toFixed(3)}</span>
                    </div>
                    {r.terms.length > 0 && <span className="wpf-says">{`Says: ${r.terms.join(', ')}`}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      <dl className="wpf-stats">
        {stats.map((s) => (
          <div key={s.k}>
            <dt className="wpf-label">{s.k}</dt>
            <dd>{s.v}</dd>
          </div>
        ))}
      </dl>

      <p className="wpf-caption">{PAIR_CAPTIONS[pair.id]}</p>
    </div>
  )
}

function SpellingView() {
  const sp = DIALECT_ROUND1.spelling
  const columns = MASTER_SPELLINGS.map((w) => {
    const people = sp.master.filter((m) => m.main === w)
    return {
      spelling: w,
      n: `${people.length} ${people.length === 1 ? 'narrative' : 'narratives'}`,
      people: people.map((m) => {
        const extra = Object.keys(m.counts)
          .filter((k) => k !== w)
          .map((k) => `${k} ×${m.counts[k]}`)
        return extra.length ? `${m.name} (also ${extra.join(', ')})` : m.name
      }),
    }
  })

  const allPatrol = [...sp.patrol, ...sp.patrol_round1]
  const bySpelling = new Map<string, string[]>()
  allPatrol.forEach((p) => {
    const who = bySpelling.get(p.spelling) ?? []
    if (!who.includes(p.name)) who.push(p.name)
    bySpelling.set(p.spelling, who)
  })
  const patrolPeople = unique(allPatrol.map((p) => p.name)).length

  return (
    <>
      <span className="wpf-label">{`"Master" in ${sp.master.length} of ${sp.n_narratives} narratives, by main spelling`}</span>
      <div className="wpf-spellings">
        {columns.map((c) => (
          <div key={c.spelling} className="wpf-spelling">
            <div className="wpf-spelling-head">
              <span className="wpf-word">{c.spelling}</span>
              <span className="wpf-muted">{c.n}</span>
            </div>
            <ul>
              {c.people.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <span className="wpf-label">{`"Patrollers": ${bySpelling.size} spellings, ${patrolPeople} narratives`}</span>
      <ul className="wpf-chips">
        {Array.from(bySpelling).map(([spelling, who]) => (
          <li key={spelling}>
            <span className="wpf-word is-sm">{spelling}</span>
            <span className="wpf-muted">{who.join(', ')}</span>
          </li>
        ))}
      </ul>

      <p className="wpf-caption">{SPELLING_CAPTION}</p>
    </>
  )
}

function NextView() {
  return (
    <>
      <div className="wpf-status">
        <span className="wpf-label">One concept, asked three ways</span>
        <span className="wpf-badge">Not yet run</span>
      </div>

      <blockquote className="wpf-source">
        <span className="wpf-label">{`Source · ${NEXT_SOURCE.who} · #${NEXT_SOURCE.id}`}</span>
        <p className="wpf-quote">{NEXT_SOURCE.text}</p>
      </blockquote>

      <div className="wpf-ways">
        {NEXT_ROWS.map((row) => (
          <div key={row.kind} className="wpf-way">
            <div className="wpf-way-kind">
              <span>{row.kind}</span>
              <span className="wpf-muted">{row.rule}</span>
            </div>
            <p className="wpf-quote">
              {row.text.split(' ').map((w, i) => (
                <span key={i}>
                  {row.hl.includes(w) ? <mark>{w}</mark> : w}{' '}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <p className="wpf-note">{NEXT_NOTE}</p>
      <p className="wpf-caption">{NEXT_CAPTION}</p>
    </>
  )
}

/* ---------- Fig. 2: the evaluation set ---------- */

// Round 1 retrieval only, not pass/fail: known-item and dialect-pair tiles
// show where the target narrative ranked; the other lanes are judged by the
// answer, which hasn't been reviewed yet.
type TileState = 'top' | 'near' | 'miss' | 'judged'
const scored = (q: EvalQuestion) => q.lane === 'KI' || q.lane === 'DP'
const tileState = (q: EvalQuestion): TileState =>
  !scored(q) ? 'judged' : !q.rank ? 'miss' : q.rank === 1 ? 'top' : 'near'
const tileLabel = (q: EvalQuestion) =>
  ({ top: 'found at #1', near: `found at #${q.rank}`, miss: 'not in top 5', judged: 'judged by the answer' })[
    tileState(q)
  ]

const LEGEND: { state: TileState; label: string }[] = [
  { state: 'top', label: 'Found at #1' },
  { state: 'near', label: '#2–5' },
  { state: 'miss', label: 'Not in top 5' },
  { state: 'judged', label: 'Judged by the answer' },
]

const LANES = EVAL_LANES.map((lane) => {
  const questions = EVAL_QUESTIONS.filter((q) => q.lane === lane.key)
  return { ...lane, questions, count: lane.key === 'DP' ? `${questions.length / 2} pairs` : String(questions.length) }
})

function retrievalLine(q: EvalQuestion) {
  if (scored(q)) return q.rank ? `Found ${q.targets[0]} at #${q.rank}.` : `${q.targets[0]} was not in the top 5.`
  if (q.lane === 'SF') return q.declined ? 'The answer declined.' : 'The answer did not clearly decline.'
  return `Of the narratives this question was drafted from, ${q.found} of ${q.expected} came back. Others may be just as relevant.`
}

function Detail({ q }: { q: EvalQuestion }) {
  const lane = EVAL_LANES.find((l) => l.key === q.lane) ?? EVAL_LANES[0]
  const tag = q.tag ? EVAL_TAGS[q.tag] : undefined
  const tests = q.lane === 'KI' && q.lvl ? `${lane.tests} Level ${q.lvl}: ${EVAL_LEVELS[q.lvl]}` : lane.tests
  const meta = [q.lvl ? `Level ${q.lvl}` : '', tag?.label ?? ''].filter(Boolean).join(' · ')

  return (
    <div className="wpf-detail">
      <div className="wpf-detail-id">
        <span className="display wpf-detail-num">{q.id}</span>
        <span className="wpf-label wpf-detail-lane">{lane.name}</span>
        {meta && <span className="wpf-label">{meta}</span>}
        <span className="wpf-badge wpf-detail-flag">AI-drafted · Under review</span>
      </div>
      <div className="wpf-detail-col">
        <p className="wpf-detail-q">{`“${q.q}”`}</p>
        <span className="wpf-label">What it tests</span>
        <p className="wpf-detail-body">{tests}</p>
        <span className="wpf-label">A pass looks like</span>
        <p className="wpf-detail-body">{tag?.pass ?? lane.pass}</p>
      </div>
      <div className="wpf-detail-col">
        <span className="wpf-label">Round 1 · Not yet reviewed</span>
        <p className="wpf-detail-result">{retrievalLine(q)}</p>
        <p className="wpf-detail-sub">{`Came back: ${unique(q.top).join(', ')}`}</p>
        <span className="wpf-label">Answer</span>
        <div className="wpf-detail-answer" tabIndex={0} aria-label={`Answer to ${q.id}`}>
          {q.ans ?? (
            <span className="wpf-withheld">Not shown here: the answer quotes a period slur from its source passage.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function EvalSet() {
  const [selected, setSelected] = useState('KI-04')
  const active = Math.max(0, EVAL_QUESTIONS.findIndex((q) => q.id === selected))
  const [known, ...edge] = LANES

  const tiles = (questions: EvalQuestion[]) =>
    questions.map((q) => (
      <button
        key={q.id}
        type="button"
        className={`wpf-tile is-${tileState(q)}`}
        aria-pressed={q.id === selected}
        aria-label={`${q.id}, ${tileLabel(q)}`}
        onClick={() => (haptic('tap'), setSelected(q.id))}
      />
    ))

  return (
    <figure className="wpf" aria-labelledby="wpf-f2">
      <div className="wpf-head">
        <span className="wpf-label">Fig. 2 · The evaluation set</span>
        <ul className="wpf-legend" aria-label="Legend">
          <li>Round 1 retrieval:</li>
          {LEGEND.map((l) => (
            <li key={l.state}>
              <span className={`wpf-swatch is-${l.state}`} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="wpf-title-row">
        <h3 className="display wpf-title" id="wpf-f2">
          78 questions, and what each one tests
        </h3>
        <p className="wpf-aside">
          AI-drafted from 12 narratives
          <br />
          Under review as I read
        </p>
      </div>

      <div className="wpf-band">
        <div className="wpf-band-head wpf-label">
          <span>{`${known.name} · ${known.count}`}</span>
          <span>Level 2 → Level 7</span>
        </div>
        <div className="wpf-grid" role="group" aria-label={`${known.name} questions`}>
          {tiles(known.questions)}
        </div>
      </div>

      <div className="wpf-lanes">
        {edge.map((l) => (
          <div key={l.key} className="wpf-lane">
            <span className="wpf-label">{`${l.name} · ${l.count}`}</span>
            <div className="wpf-lane-tiles" role="group" aria-label={`${l.name} questions`}>
              {tiles(l.questions)}
            </div>
          </div>
        ))}
      </div>

      {/* Every question's detail is laid out at once (see Stack), so the panel
          keeps the height of the longest one as you click between tiles. */}
      <div className="wpf-detail-box" aria-live="polite">
        <Stack active={active}>
          {EVAL_QUESTIONS.map((q) => (
            <Detail key={q.id} q={q} />
          ))}
        </Stack>
      </div>
    </figure>
  )
}
