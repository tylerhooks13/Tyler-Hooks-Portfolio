import type { ReactNode } from 'react'
import { MAP_H, MAP_W, ax, type IconKind, type Stop } from './guided-task-data'

/*
 * Pieces shared by the Guided Task Management hero, card and figures: the
 * rugged store handheld, the guided walk's stop screen, product icons, and
 * the store floor plan. Screens are recreations; nothing is proprietary.
 */

/* ---------- product icons ---------- */

export function ProductIcon({ kind, className = 'gtd-thumb' }: { kind: IconKind; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 54 64" aria-hidden="true">
      {kind === 'bag' && (
        <>
          <path d="M10 6h34l-3 6 4 46H9l4-46z" fill="#D9D7D1" stroke="#0E0E0E" strokeWidth="2" />
          <path d="M15 26h24M15 32h18" stroke="#0E0E0E" strokeWidth="2" />
          <circle cx="27" cy="45" r="6" fill="#8A8883" />
        </>
      )}
      {kind === 'bottle' && (
        <>
          <path d="M23 4h8v8l5 8v40H18V20l5-8z" fill="#ECEAE5" stroke="#0E0E0E" strokeWidth="2" />
          <path d="M18 32h18v14H18z" fill="#AFADA7" />
        </>
      )}
      {kind === 'box' && (
        <>
          <path d="M6 20h42v26H6z" fill="#ECEAE5" stroke="#0E0E0E" strokeWidth="2" />
          <path d="M6 28h42" stroke="#0E0E0E" strokeWidth="2" />
          <circle cx="16" cy="37" r="4" fill="#8A8883" />
        </>
      )}
      {kind === 'pack' && (
        <>
          <rect x="7" y="16" width="40" height="32" rx="4" fill="#ECEAE5" stroke="#0E0E0E" strokeWidth="2" />
          <ellipse cx="27" cy="32" rx="14" ry="10" fill="#D9D7D1" stroke="#0E0E0E" strokeWidth="1.5" />
        </>
      )}
    </svg>
  )
}

/* ---------- the handheld ---------- */

/**
 * A rugged store handheld, 400×820 (432×848 with its bumpers). Pass `onScan`
 * to make the side triggers real buttons; without it they're decoration.
 */
export function Handheld({
  children,
  time = '6:42',
  battery = '82%',
  onScan,
  led,
  className = '',
}: {
  children: ReactNode
  time?: string
  battery?: string
  onScan?: () => void
  led?: boolean
  className?: string
}) {
  return (
    <div className={`gtd ${className}`}>
      <i className="gtd-bump is-tl" />
      <i className="gtd-bump is-tr" />
      <i className="gtd-bump is-bl" />
      <i className="gtd-bump is-br" />
      {onScan ? (
        <>
          <button className="gtd-trig is-l" type="button" aria-label="Press scan trigger" onClick={onScan} />
          <button className="gtd-trig is-r" type="button" aria-label="Press scan trigger" onClick={onScan} />
        </>
      ) : (
        <>
          <i className="gtd-trig is-l" />
          <i className="gtd-trig is-r" />
        </>
      )}
      <i className="gtd-btn is-ptt" />
      <i className="gtd-btn is-vol" />
      <div className="gtd-topcap" />
      <i className="gtd-grille" />
      <i className="gtd-cam" />
      <i className={led ? 'gtd-led is-flash' : 'gtd-led'} />
      <i className="gtd-mic" />
      <div className="gtd-screen">
        <div className="gtd-sbar">
          <span>{time}</span>
          <span>{`▲ ▮▮▮ ${battery}`}</span>
        </div>
        <div className="gtd-views">{children}</div>
      </div>
    </div>
  )
}

/* ---------- the guided walk's stop screen ---------- */

export function StopScreen({
  stop,
  index,
  total,
  progress,
  action,
  onSeeAll,
  children,
}: {
  stop: Stop
  index: number
  total: number
  /** 0–1: how much of the walk is done. */
  progress: number
  /** The action zone: walking, waiting for a scan, or the task's buttons. */
  action: ReactNode
  onSeeAll?: () => void
  children?: ReactNode
}) {
  return (
    <>
      <div className="gtd-nav">
        <span className="gtd-x" aria-hidden="true">
          ×
        </span>
        <b>Guided walk</b>
        <span>Product details</span>
      </div>
      <div className="gtd-taskbar">
        <span>{`${index + 1} of ${total}`}</span>
        <span className="gtd-taskbar-c">{stop.label}</span>
        {onSeeAll ? (
          <button className="gtd-link" type="button" onClick={onSeeAll}>
            See all
          </button>
        ) : (
          <span className="gtd-link">See all</span>
        )}
      </div>
      <div className="gtd-walkbar">
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="gtd-prod">
        <ProductIcon kind={stop.icon} />
        <div>
          <div className="gtd-prod-t">{stop.name}</div>
          <div className="gtd-prod-s">{stop.meta}</div>
          <div className="gtd-prod-u">{`UPC ••••••${stop.upc}`}</div>
        </div>
      </div>
      <div className="gtd-act">{action}</div>
      <div className="gtd-locwrap">
        <div className="gtd-lochead">
          <span>Center store</span>
          <span>{`Capacity: ${stop.cap}`}</span>
        </div>
        <div className="gtd-loc">
          {(['Aisle', 'Side', 'Segment', 'Shelf'] as const).map((l, k) => (
            <div key={l}>
              <small>{l}</small>
              <strong>{stop.loc[k]}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="gtd-kv">
        <div>
          <span>Sales since last activity</span>
          <b>{stop.sales}</b>
        </div>
        <div>
          <span>On hand</span>
          <b>{stop.oh}</b>
        </div>
      </div>
      <div className="gtd-upd">{stop.upd}</div>
      {children}
    </>
  )
}

/** "Waiting for a scan…": the prompt is a button when it can scan. */
export function ScanPrompt({ onScan, id }: { onScan?: () => void; id?: string }) {
  const inner = (
    <>
      <b>
        <i className="gtd-pulse" />
        Waiting for a scan…
      </b>
      <span>Enter manually</span>
    </>
  )
  return onScan ? (
    <button className="gtd-waiting" type="button" id={id} onClick={onScan}>
      {inner}
    </button>
  ) : (
    <div className="gtd-waiting">{inner}</div>
  )
}

/* ---------- the store floor plan ---------- */

const DEPTS: { x: number; y: number; w: number; h: number; label: string; rot?: number }[] = [
  { x: 82, y: 72, w: 436, h: 28, label: 'MEAT · SEAFOOD · DAIRY · FROZEN' },
  { x: 26, y: 72, w: 50, h: 556, label: 'PRODUCE', rot: -90 },
  { x: 524, y: 72, w: 50, h: 556, label: 'DELI · BAKERY', rot: 90 },
  { x: 82, y: 648, w: 436, h: 44, label: 'REGISTERS' },
]

/** The store, drawn once; routes, pins and the marker go on top as children. */
export function StorePlan({ children, label, className = '' }: { children?: ReactNode; label?: string; className?: string }) {
  return (
    <svg
      className={`gtm ${className}`}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect className="gtm-back" x="20" y="20" width="560" height="46" />
      <text className="gtm-label" x="300" y="48" textAnchor="middle" fontSize="10" letterSpacing="2">
        BACKROOM
      </text>
      {DEPTS.map((d) => {
        const cx = d.x + d.w / 2
        const cy = d.rot ? 350 : d.y + d.h / 2 + 3.5
        return (
          <g key={d.label}>
            <rect className="gtm-dept" x={d.x} y={d.y} width={d.w} height={d.h} />
            <text
              className="gtm-label"
              x={cx}
              y={cy}
              textAnchor="middle"
              fontSize="9.5"
              letterSpacing={d.rot ? 2 : 1.5}
              transform={d.rot ? `rotate(${d.rot} ${cx} ${cy})` : undefined}
            >
              {d.label}
            </text>
          </g>
        )
      })}
      <path className="gtm-wall" d="M20 66 V700 H250 M350 700 H580 V66 M20 66 H280 M320 66 H580" />
      <text className="gtm-label" x="300" y="714" textAnchor="middle" fontSize="9" letterSpacing="2">
        ENTRANCE
      </text>
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} className="gtm-gondola" x={104 + i * 28} y="150" width="10" height="426" rx="2" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <text key={i} className="gtm-label" x={ax(i + 1)} y="142" textAnchor="middle" fontSize="9">
          {i + 1}
        </text>
      ))}
      {children}
    </svg>
  )
}

/** A task pin: numbered, with its task type beside it. */
export function MapPin({ stop, n, state = '' }: { stop: Stop; n: number; state?: '' | 'active' | 'done' }) {
  const right = stop.aisle >= 13
  return (
    <g className={state ? `gtm-pin is-${state}` : 'gtm-pin'} transform={`translate(${ax(stop.aisle)} ${stop.y})`}>
      <circle className="gtm-ring" r="10" />
      <circle className="gtm-pin-b" r="10" />
      <text className="gtm-pin-n" textAnchor="middle" y="3.5">
        {n}
      </text>
      <text className="gtm-pin-tag" x={right ? -14 : 14} y="3.5" textAnchor={right ? 'end' : 'start'}>
        {stop.tag.toUpperCase()}
      </text>
    </g>
  )
}
