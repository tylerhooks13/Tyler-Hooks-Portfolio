/*
 * Store leader platform app screens, recreated in HTML (proprietary work).
 * Shared by the page hero (StoreLeaderHero) and the interactive figures
 * (StoreLeaderFigures). Each renders the contents of a 390×844 `.slf-screen`;
 * styles live under "interactive figures" and "live hero" in site.css.
 */

type Tab = 'dashboard' | 'payroll' | 'team' | 'notes'

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <path d="M3 11l9-7 9 7v9H3z" /> },
  { id: 'payroll', label: 'Payroll', icon: <path d="M5 20V10M12 20V4M19 20v-7" /> },
  {
    id: 'team',
    label: 'Team',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6" />
      </>
    ),
  },
  { id: 'notes', label: 'Notes', icon: <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" /> },
]

export function Tabbar({ active }: { active: Tab }) {
  return (
    <nav className="slf-tabbar" aria-hidden="true">
      {TABS.map((t) => (
        <div key={t.id} className={t.id === active ? 'is-on' : undefined}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {t.icon}
          </svg>
          {t.label}
        </div>
      ))}
    </nav>
  )
}

const Star = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
  </svg>
)

const Trophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
  </svg>
)

/* ---------- 07:00 · Dashboard ---------- */

// `data-focus` zones are what the Fig. 01 walkthrough lights up; the content
// area scrolls (under script control) above the tab bar.
export function DashboardScreen() {
  return (
    <>
      <div className="slf-scroll" data-scroll="">
        <div className="slf-s-head">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <h4 className="display" style={{ marginTop: 14 }}>
            Good morning, Dana
          </h4>
          <div className="slf-sub">Store 214 · Thu, Oct 8</div>
        </div>
        <div data-focus="metrics" className="slf-zone">
          <div className="slf-row">
            <b>Key metrics</b>
            <span>Payroll forecast ›</span>
          </div>
          <div className="slf-metrics">
            <div className="slf-metric">
              <div className="slf-k">
                <span>Total sales</span>
                <span>On track</span>
              </div>
              <div className="slf-v">$124k</div>
              <div className="slf-d">↗ +5%</div>
            </div>
            <div className="slf-metric">
              <div className="slf-k">
                <span>Shrink</span>
                <span>On track</span>
              </div>
              <div className="slf-v">-1.2%</div>
              <div className="slf-d">↘ +0.4%</div>
            </div>
            <div className="slf-metric">
              <div className="slf-k">
                <span>Hospitality</span>
              </div>
              <div className="slf-v">96%</div>
              <div className="slf-d">↗ +3%</div>
            </div>
          </div>
        </div>
        <div data-focus="briefing" className="slf-zone">
          <div className="slf-row">
            <b>Briefing summary</b>
            <span>7:00 AM</span>
          </div>
          <div className="slf-brief">
            <div className="slf-brief-t">
              Leadership briefing<i>✦ AI SUMMARY</i>
            </div>
            <div className="slf-brief-m">6 department managers · 0/3 done</div>
            <hr />
            <p>
              Dana asked teams to prep for this weekend&apos;s storm: order up on key items, adjust schedules for the lift,
              and trim overtime today. Check training completions before Friday.
            </p>
          </div>
        </div>
        <div data-focus="actions" className="slf-zone">
          <div className="slf-list">
            {[
              ['Raise storm orders on water and batteries', 'Luis R.', 'High'],
              ['Review flagged shrink alert before 1 PM walk', 'Priya S.', 'High'],
              ['Check emergency supplies: cones, mats', 'Marcus T.', 'Medium'],
            ].map(([task, who, pri]) => (
              <div key={task} className="slf-task">
                <div className="slf-box" />
                <div>
                  {task}
                  <div className="slf-meta">
                    {who} <span className={pri === 'High' ? 'slf-chip is-hi' : 'slf-chip'}>{pri}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div data-focus="recognition" className="slf-zone">
          <div className="slf-row">
            <b>Recognition</b>
          </div>
          <div className="slf-recog">
            <div>
              <Star />
              Elena M. celebrates 5 years today
            </div>
            <div>
              <Trophy />
              Bakery #1 in region last week
            </div>
          </div>
        </div>
      </div>
      <Tabbar active="dashboard" />
    </>
  )
}

/* ---------- 10:30 · Payroll forecast (v2) ---------- */

export function PayrollScreen() {
  return (
    <>
      <div className="slf-s-head">
        <h4 className="display">Payroll forecast</h4>
        <div className="slf-sub">Week of Oct 5 – Oct 11</div>
      </div>
      <div className="slf-callout">
        <div className="slf-callout-t">
          Angela D. called out
          <span className="slf-chip" style={{ background: '#fff' }}>
            Car trouble
          </span>
        </div>
        <div className="slf-dim" style={{ marginTop: 4 }}>
          Deli · Opening · 7:00 AM – 3:00 PM
        </div>
        <div style={{ marginTop: 8 }}>2 replacement options ›</div>
      </div>
      <div className="slf-dept">
        <div>
          <b>Market</b>
          <div className="slf-dim slf-inline" style={{ marginTop: 5 }}>
            245h / 240h budget <span className="slf-chip is-hi">2 at risk</span>
            <span className="slf-chip">Over budget</span>
          </div>
        </div>
        <span>⌃</span>
      </div>
      <div className="slf-list slh-gap10">
        <div className="slf-pcard is-risk">
          <div className="slf-pcard-t">
            Sarah J.<span className="slf-ot">⚠ +2h OT</span>
          </div>
          <div className="slf-dim" style={{ marginTop: 3 }}>
            42h scheduled
          </div>
          <div className="slf-ai-label">✦ AI SUGGESTIONS</div>
          <div className="slf-sug">
            <div className="slf-sug-l">
              <span>Send home 2 hours early Friday</span>
              <b>−2h</b>
            </div>
            <div className="slf-btn">Add to my task list</div>
          </div>
          <div className="slf-sug">
            <div className="slf-sug-l">
              <span>Swap Thursday evening with Mike C.</span>
              <b>−4h</b>
            </div>
            <div className="slf-dim" style={{ fontSize: 11, marginTop: 2 }}>
              Mike C. is at 32h this week
            </div>
            <div className="slf-btn">Add to my task list</div>
          </div>
        </div>
        <div className="slf-pcard is-risk">
          <div className="slf-pcard-t">
            David M.<span className="slf-ot">⚠ +1.5h OT</span>
          </div>
          <div className="slf-dim" style={{ marginTop: 3 }}>
            41.5h scheduled
          </div>
        </div>
        <div className="slf-pcard">
          <div className="slf-pcard-t">Emily P.</div>
          <div className="slf-dim" style={{ marginTop: 3 }}>
            38h scheduled
          </div>
        </div>
        <div>
          {[
            ['Deli', '185h / 190h budget'],
            ['Seafood', '128h / 135h budget'],
          ].map(([dept, budget]) => (
            <div key={dept} className="slf-collapsed">
              <div>
                <b>{dept}</b>
                <div className="slf-dim" style={{ marginTop: 3 }}>
                  {budget}
                </div>
              </div>
              <span className="slf-dim">⌄</span>
            </div>
          ))}
        </div>
      </div>
      <Tabbar active="payroll" />
    </>
  )
}

/* ---------- 13:00 · Team development ---------- */

const TEAM = [
  {
    name: 'Jenna M.',
    role: 'Produce',
    status: 'Overdue',
    hi: true,
    tag: 'Food safety certification',
    note: 'Annual certification for all food-selling departments.',
    action: 'View progress',
    card: 'is-strong',
  },
  {
    name: 'David T.',
    role: 'Market lead',
    status: 'In progress',
    hi: true,
    tag: 'Leadership development',
    note: 'Sessions 1 and 2 of 5 complete.',
    action: 'View progress',
    card: 'is-ink',
  },
  {
    name: 'Alex C.',
    role: 'General merchandise',
    status: 'Expiring soon',
    hi: false,
    tag: 'Equipment recertification',
    note: null,
    action: 'Schedule training',
    card: '',
  },
]

export function TeamScreen() {
  return (
    <>
      <div className="slf-s-head">
        <h4 className="display">Team development</h4>
        <div className="slf-sub">Growth &amp; training</div>
      </div>
      <div className="slh-tiles">
        <div className="slh-tile is-ink">
          <span>Training</span>
          <b>4</b>
        </div>
        <div className="slh-tile">
          <span>Coaching</span>
          <b>3</b>
        </div>
      </div>
      <div className="slh-section">
        <div>
          <div className="slf-inline">
            <b>Training &amp; development</b>
            <span className="slf-chip is-hi">1 in progress</span>
          </div>
          <div className="slf-dim" style={{ marginTop: 3 }}>
            4 items
          </div>
        </div>
        <span className="slf-dim">⌃</span>
      </div>
      <div className="slh-cards">
        {TEAM.map((p) => (
          <div key={p.name} className={`slh-card ${p.card}`}>
            <div className="slh-card-top">
              <div>
                <b>{p.name}</b>
                <div className="slf-dim" style={{ marginTop: 2 }}>
                  {p.role}
                </div>
              </div>
              <span className={p.hi ? 'slf-chip is-hi' : 'slf-chip'}>{p.status}</span>
            </div>
            <span className="slh-tag">{p.tag}</span>
            {p.note && <div className="slh-note">{p.note}</div>}
            <div className="slf-btn">{p.action}</div>
          </div>
        ))}
      </div>
      <Tabbar active="team" />
    </>
  )
}

/* ---------- 16:00 · Note details ---------- */

export function NotesScreen() {
  return (
    <>
      <div className="slh-notes-head">
        <b>Note details</b>
        <div className="slf-inline">
          <span className="slh-pill">Share</span>
          <span className="slh-pill">Edit</span>
        </div>
      </div>
      <div className="slh-notes-title">
        <div className="slh-notes-h">Holiday training plan</div>
        <div className="slf-dim" style={{ marginTop: 4 }}>
          By Mike C. · 3d ago
        </div>
      </div>
      <div className="slh-summary">
        <div className="slf-inline">
          <span>✦</span>
          <b>AI summary</b>
          <span className="slh-pill is-sm">Auto-generated</span>
        </div>
        <p>
          Training for seasonal team members starting in November, focused on guest service and product knowledge. One
          action item still needs a date.
        </p>
        <div className="slh-topics">
          <span>Onboarding</span>
          <span>Guest service</span>
          <span>Seasonal hires</span>
        </div>
      </div>
      <div className="slh-section">
        <div className="slf-inline">
          <b>Acknowledgments</b>
          <span className="slh-pill is-sm">Optional</span>
        </div>
        <span className="slf-dim">2/3</span>
      </div>
      <div className="slh-progress">
        <span />
      </div>
      <div className="slh-acks">
        <div>
          <i>SJ</i>
          <div>
            Sarah J.<small>Oct 6, 5:05 PM</small>
          </div>
          <em>✓</em>
        </div>
        <div className="is-you">
          <i>DR</i>
          <div>
            <b>Dana R. (you)</b>
          </div>
        </div>
        <div>
          <i>LP</i>
          <div>
            Lisa P.<small>Oct 6, 5:10 PM</small>
          </div>
          <em>✓</em>
        </div>
      </div>
      <div className="slh-section">
        <div className="slf-inline">
          <b>Action items</b>
          <span className="slf-dim">0/2</span>
        </div>
      </div>
      <div className="slf-list" style={{ paddingTop: 8 }}>
        {[
          ['Schedule first session for Nov 3', 'Sarah J.', 'High'],
          ['Prepare guest service materials', 'Mike C.', 'Medium'],
        ].map(([task, who, pri]) => (
          <div key={task} className="slf-task">
            <div className="slf-box is-round" />
            <div>
              {task}
              <div className="slf-meta">
                {who} <span className={pri === 'High' ? 'slf-chip is-hi' : 'slf-chip'}>{pri}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Tabbar active="notes" />
    </>
  )
}

/* ---------- Fig. 02: the note-taking experience, v1 → v2 ---------- */

const Chevron = () => <span className="slf-dim">⌃</span>

// V1: the early briefing page. A summary of the meeting and a few follow-ups,
// like the briefing card on the dashboard.
export function BriefingV1Screen() {
  return (
    <>
      <div className="slf-s-head">
        <h4 className="display">Leadership briefing</h4>
        <div className="slf-sub">Thu, Oct 8 · 7:00 AM</div>
      </div>
      <div className="slf-row">
        <b>Summary</b>
        <span>6 department managers</span>
      </div>
      <div className="slf-brief">
        <div className="slf-brief-t">
          Briefing summary<i>✦ AI SUMMARY</i>
        </div>
        <hr />
        <p>
          Dana asked teams to prep for this weekend&apos;s storm: order up on key items, adjust schedules for the lift, and
          trim overtime today. Check training completions before Friday.
        </p>
      </div>
      <div className="slf-row">
        <b>Follow-ups</b>
        <span>0/3 done</span>
      </div>
      <div className="slf-list">
        {[
          ['Raise storm orders on water and batteries', 'Luis R.', 'High'],
          ['Review flagged shrink alert before 1 PM walk', 'Priya S.', 'High'],
          ['Check emergency supplies: cones, mats', 'Marcus T.', 'Medium'],
        ].map(([task, who, pri]) => (
          <div key={task} className="slf-task">
            <div className="slf-box" />
            <div>
              {task}
              <div className="slf-meta">
                {who} <span className={pri === 'High' ? 'slf-chip is-hi' : 'slf-chip'}>{pri}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Tabbar active="notes" />
    </>
  )
}

// V2: the note details the page grew into. Taller than the phone, so the
// Fig. 02 walkthrough scrolls it (data-scroll) to each lit section.
export function NoteDetailScreen() {
  return (
    <div className="slf-scroll is-full" data-scroll="">
      <div className="slh-notes-head">
        <b>Note details</b>
        <div className="slf-inline">
          <span className="slh-pill">Share</span>
          <span className="slh-pill">Edit</span>
          <span className="slh-close">✕</span>
        </div>
      </div>
      <div className="slh-notes-title">
        <div className="slh-notes-h">Holiday training plan</div>
        <div className="slf-dim" style={{ marginTop: 4 }}>
          By Mike C. · 3d ago
        </div>
      </div>

      <div data-focus="summary" className="slf-zone">
        <div className="slh-summary">
          <div className="slh-summary-head">
            <div className="slf-inline">
              <span>✦</span>
              <b>AI summary</b>
              <span className="slh-pill is-sm">Auto-generated</span>
            </div>
            <Chevron />
          </div>
          <p>
            Training for seasonal team members starting in November, focused on guest service and product knowledge. One
            action item still needs a date.
          </p>
          <div className="slh-topics-label">Key topics</div>
          <div className="slh-topics">
            <span>Onboarding</span>
            <span>Guest service</span>
            <span>Seasonal hires</span>
          </div>
        </div>
        <div className="slh-quote">
          Planning training sessions for seasonal partners joining in November. Focus on guest service and product
          knowledge.
        </div>
        <div className="slh-tag-row">
          <span className="slh-tag">Training</span>
        </div>
      </div>

      <div data-focus="share" className="slf-zone">
        <div className="slh-section">
          <div className="slf-inline">
            <b>Acknowledgments</b>
            <span className="slh-pill is-sm">Optional</span>
          </div>
          <div className="slf-inline">
            <span className="slf-dim">2/3</span>
            <Chevron />
          </div>
        </div>
        <div className="slh-progress">
          <span />
        </div>
        <div className="slh-acks">
          <div>
            <i>SJ</i>
            <div>
              Sarah J.<small>Oct 6, 5:05 PM</small>
            </div>
            <em>✓</em>
          </div>
          <div className="is-you">
            <i>DR</i>
            <div>
              <b>Dana R. (you)</b>
            </div>
          </div>
          <div>
            <i>LP</i>
            <div>
              Lisa P.<small>Oct 6, 5:10 PM</small>
            </div>
            <em>✓</em>
          </div>
        </div>
        <div className="slh-add">+ Add acknowledger</div>
      </div>

      <div data-focus="actions" className="slf-zone">
        <div className="slh-section">
          <div className="slf-inline">
            <b>Action items</b>
            <span className="slf-dim">0/2</span>
          </div>
          <Chevron />
        </div>
        <div className="slf-list" style={{ paddingTop: 0 }}>
          {[
            ['Schedule first session for Nov 3', 'Sarah J.', 'High'],
            ['Prepare guest service materials', 'Mike C.', 'Medium'],
          ].map(([task, who, pri]) => (
            <div key={task} className="slf-task">
              <div className="slf-box is-round" />
              <div>
                {task}
                <div className="slf-meta">
                  {who} <span className={pri === 'High' ? 'slf-chip is-hi' : 'slf-chip'}>{pri}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="slh-fields">
          <span className="slh-field is-wide">Task description…</span>
          <span className="slh-field">Dana R. ⌄</span>
          <span className="slh-field">Medium ⌄</span>
        </div>
        <div className="slh-add is-solid">+ Add action item</div>
      </div>

      <div data-focus="comments" className="slf-zone">
        <div className="slh-section">
          <div className="slf-inline">
            <b>Comments</b>
            <span className="slh-pill is-sm">1</span>
          </div>
        </div>
        <div className="slh-comment">
          <div>
            <b>Dana R.</b>
            <span className="slf-dim">3d ago</span>
          </div>
          Can we schedule the first session for Nov 3?
        </div>
      </div>
    </div>
  )
}
