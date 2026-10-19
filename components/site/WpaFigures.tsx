'use client'

import { useState } from 'react'
import { DIALECT_PRESETS } from './wpa-dialect-gap'
import { EVAL_LANES, EVAL_RESULTS, type EvalStatus } from './wpa-eval'

/*
 * Figures for the Texas WPA Narratives page, in place of static images.
 * Fig. 1 compares keyword and meaning search on real passages; Fig. 2 maps
 * the 78-question eval set.
 * Both run on static data (wpa-dialect-gap.ts, wpa-eval.ts) and never call
 * the archive API; the live demo is the only part of the site that does.
 */

export default function WpaFigures() {
  return (
    <div className="wpf-stack">
      <DialectGap />
      <EvalLadder />
    </div>
  )
}

/* ---------- Fig. 1: the dialect gap ---------- */

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

function DialectGap() {
  const [mode, setMode] = useState<'keyword' | 'meaning'>('keyword')
  const [preset, setPreset] = useState(0)
  const cur = DIALECT_PRESETS[preset]
  const keyword = mode === 'keyword'

  const termRe = new RegExp(cur.terms.map(escapeRe).join('|'), 'i')
  const n = cur.passages.length
  const hits = cur.passages.filter((p) => termRe.test(p.text)).length
  const quoted = cur.terms.map((t) => `"${t}"`).join(' / ')
  const status = keyword
    ? `KEYWORD SEARCH · ${quoted} · ${hits} OF ${n} PASSAGES MATCH`
    : cur.kind === 'retrieved'
      ? `SEARCH BY MEANING · ${n} OF ${n} RETRIEVED`
      : `SEARCH BY MEANING · ${n} PASSAGES THAT ANSWER IT`

  return (
    <figure className="wpf" aria-labelledby="wpf-f2">
      <div className="wpf-head">
        <span className="wpf-label">Fig. 1 · The dialect gap</span>
        <div className="wpf-toggle" role="group" aria-label="Search mode">
          <button type="button" aria-pressed={keyword} onClick={() => setMode('keyword')}>
            Keyword
          </button>
          <button type="button" aria-pressed={!keyword} onClick={() => setMode('meaning')}>
            Meaning
          </button>
        </div>
      </div>

      <h3 className="display wpf-title" id="wpf-f2">
        Search by spelling, or by meaning
      </h3>

      <div className="wpf-presets" role="group" aria-label="Question">
        {DIALECT_PRESETS.map((p, i) => (
          <button key={p.q} type="button" aria-pressed={i === preset} onClick={() => setPreset(i)}>
            <span aria-hidden="true">› </span>
            {p.q}
          </button>
        ))}
      </div>

      <div className="wpf-status">
        <span aria-live="polite">{status}</span>
        <span className="wpf-label">{cur.kindLabel}</span>
      </div>

      <ol className="wpf-passages">
        {cur.passages.map((p, i) => {
          const hit = termRe.test(p.text)
          const tag = keyword ? (hit ? 'Keyword match' : 'Missed by keyword') : p.dist ? `Dist ${p.dist}` : 'Not yet run'
          return (
            <li key={`${p.id}-${i}`} className={keyword && !hit ? 'wpf-passage is-missed' : 'wpf-passage'}>
              <div className="wpf-meta">
                <span className="wpf-dim">{`[${i + 1}] ${p.who} · #${p.id} · ${p.part}`}</span>
                <span>{tag}</span>
              </div>
              <p className="wpf-quote wpf-dim">
                {segments(p.text, keyword ? cur.terms : p.spans).map((s, k) =>
                  s.hl ? <mark key={k}>{s.t}</mark> : <span key={k}>{s.t}</span>,
                )}
              </p>
              {!keyword && <p className="wpf-gloss">{p.gloss}</p>}
            </li>
          )
        })}
      </ol>

      <figcaption className="wpf-caption">{keyword ? cur.kwCaption : cur.mnCaption}</figcaption>
    </figure>
  )
}

/* ---------- Fig. 2: the evaluation ladder ---------- */

type TileStatus = EvalStatus | 'pending'
const STATUS_LABEL: Record<TileStatus, string> = { pending: 'Not run', pass: 'Pass', partial: 'Partial', fail: 'Fail' }

const tileId = (key: string, i: number) => `${key}-${String(i).padStart(2, '0')}`

const LADDER = EVAL_LANES.map((lane) => ({
  ...lane,
  tiles: Array.from({ length: lane.count }, (_, i) => {
    const id = tileId(lane.key, i + 1)
    const r = EVAL_RESULTS[id]
    return { id, status: (r?.status ?? 'pending') as TileStatus, q: r?.q, note: r?.note }
  }),
}))
const ALL_TILES = LADDER.flatMap((l) => l.tiles.map((t) => ({ ...t, lane: l })))
const TOTAL = ALL_TILES.length
const RUN = ALL_TILES.filter((t) => t.status !== 'pending').length

function Legend() {
  return (
    <ul className="wpf-legend" aria-label="Legend">
      {(['pass', 'partial', 'fail', 'pending'] as TileStatus[]).map((s) => (
        <li key={s}>
          <span className={`wpf-swatch is-${s}`} aria-hidden="true" />
          {STATUS_LABEL[s]}
        </li>
      ))}
    </ul>
  )
}

function EvalLadder() {
  const [selected, setSelected] = useState(ALL_TILES[0].id)
  const sel = ALL_TILES.find((t) => t.id === selected) ?? ALL_TILES[0]
  const [known, ...edge] = LADDER

  const tiles = (lane: (typeof LADDER)[number]) =>
    lane.tiles.map((t) => (
      <button
        key={t.id}
        type="button"
        className={`wpf-tile is-${t.status}`}
        aria-pressed={t.id === selected}
        aria-label={`${t.id}, ${STATUS_LABEL[t.status].toLowerCase()}`}
        onClick={() => setSelected(t.id)}
      />
    ))

  return (
    <figure className="wpf" aria-labelledby="wpf-f3">
      <div className="wpf-head">
        <span className="wpf-label">Fig. 2 · The evaluation ladder</span>
        <Legend />
      </div>

      <div className="wpf-title-row">
        <h3 className="display wpf-title" id="wpf-f3">
          78 questions, easy to impossible
        </h3>
        <div className="wpf-progress">
          <span>{`${RUN} OF ${TOTAL} RUN`}</span>
          <span className="wpf-bar" aria-hidden="true">
            <span style={{ width: `${Math.round((RUN / TOTAL) * 100)}%` }} />
          </span>
        </div>
      </div>

      <div className="wpf-band">
        <div className="wpf-band-head wpf-label">
          <span>{`${known.name} · ${known.count}`}</span>
          <span>Level 1 → Level 7</span>
        </div>
        <div className="wpf-grid" role="group" aria-label={`${known.name} questions`}>
          {tiles(known)}
        </div>
      </div>

      <div className="wpf-lanes">
        {edge.map((lane) => (
          <div key={lane.key} className="wpf-lane">
            <span className="wpf-label">{`${lane.name} · ${lane.count}`}</span>
            <div className="wpf-lane-tiles" role="group" aria-label={`${lane.name} questions`}>
              {tiles(lane)}
            </div>
          </div>
        ))}
      </div>

      <div className="wpf-detail" aria-live="polite">
        <div className="wpf-detail-id">
          <span className="display wpf-detail-num">{sel.id}</span>
          <span className="wpf-label">{sel.lane.name}</span>
          <span className="wpf-label wpf-detail-status">{STATUS_LABEL[sel.status]}</span>
        </div>
        <div className="wpf-detail-col">
          <span className="wpf-label">What it tests</span>
          <p className="wpf-detail-body">{sel.lane.tests}</p>
          <p className="wpf-detail-sub">{`Q: ${sel.q ?? '[question from the eval set]'}`}</p>
        </div>
        <div className="wpf-detail-col">
          <span className="wpf-label">A pass looks like</span>
          <p className="wpf-detail-body">{sel.lane.expected}</p>
          {(sel.note || sel.status === 'pending') && (
            <p className="wpf-detail-sub">{sel.note ?? 'Not run yet.'}</p>
          )}
        </div>
      </div>
    </figure>
  )
}
