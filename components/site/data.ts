export type PageId = 'guided-tasks' | 'ai-enablement' | 'store-leader-platform' | 'texas-wpa'
export type View = 'home' | PageId | 'about'

export const PAGE_IDS: PageId[] = ['guided-tasks', 'ai-enablement', 'store-leader-platform', 'texas-wpa']
export const VIEWS: View[] = ['home', ...PAGE_IDS, 'about']

export const PORTRAIT = '/images/portrait.jpg'

/* ---------- selected work: projects + case study ---------- */

// Visible marker for page copy that hasn't been written yet.
export const TBD = '[TBD]'

// Portfolio projects (things built) vs case studies (how a team changed).
// Both use the same page template; `kind` changes the labels and which nav
// item (Work or Case studies) stays highlighted on the page.
export type PageKind = 'project' | 'case-study'
export const KIND_LABEL: Record<PageKind, string> = { project: 'Project', 'case-study': 'Case study' }

export type WorkPage = {
  id: PageId
  kind: PageKind
  slot: string
  num: string
  arc: string
  title: string
  /** Page headline: solid line, then the outlined word(s). */
  headline: { solid: string; outline?: string }
  summary: string
  meta: string
  /** Card image; the striped placeholder shows until this is set. */
  src?: string
  /** Links under the page summary. No href renders a [TBD] placeholder;
   *  `scrollTo` jumps to a section on another view (e.g. the live demo). */
  links?: { label: string; href?: string; scrollTo?: string }[]
  /** Optional background section shown before the challenge. */
  context?: string
  facts: { label: string; value: string }[]
  challenge: string
  /** Key moves: plain text, or a short title plus body. */
  approach: (string | { title: string; text: string })[]
  /** Figures under the approach; three labeled placeholders when omitted. */
  figures?: { caption: string; src?: string }[]
  /** Proprietary work: figures are recreations, and a note offers a walkthrough. */
  proprietary?: boolean
  outcome: string
  reflection: string
}

export const WORK_PAGES: WorkPage[] = [
  {
    id: 'guided-tasks',
    kind: 'project',
    slot: 'th-w1',
    num: '01',
    arc: 'Before AI',
    title: 'Guided Task Management System',
    headline: { solid: 'Guided Task', outline: 'Management' },
    summary: 'A store-partner tool prototyped from the ground up, now live in 300+ H-E-B stores.',
    meta: 'H-E-B · Prototyping · Shipped',
    facts: [
      {
        label: 'Role',
        value: 'Design technologist. Built the original prototype, then led the prototype for its partner-experience redesign.',
      },
      { label: 'Timeline', value: '[2023] – 2026' }, // TODO: confirm the start year
      {
        label: 'Tools',
        value: 'React (original app); Next.js, TypeScript, Airtable, and Kubernetes (redesign); Zebra store devices',
      },
    ],
    challenge:
      'Every day, H-E-B store partners complete in-store walks and inventory requirements to keep shelves stocked and counts accurate. A guided task management system walks them through that work. By the time of the redesign, partners were moving between four separate guided walks (store walk, shelf replenishment, shelf inventory, and perpetual adjustment), each with its own flow.',
    approach: [
      {
        title: 'Build the foundation.',
        text: 'I prototyped the system as a React web app that guides partners through walks and inventory tasks step by step. That prototype became the app now live in 300+ H-E-B stores.',
      },
      {
        title: 'Consolidate four walks into one.',
        text: 'I led the high-fidelity prototype for a redesigned partner experience that replaces all four walks with a single guided flow. I built it in Next.js and TypeScript with an Airtable backend, and deployed it on Kubernetes so it held up through testing.',
      },
      {
        title: 'Test where the work happens.',
        text: 'We ran one-hour, in-person sessions in Austin, Round Rock, and San Antonio on the Zebra devices partners carry every day, scoring each task on whether partners could complete it and understood the new flow.',
      },
    ],
    figures: [
      { caption: 'A guided walk in the original app, on a store device.' },
      { caption: 'Four walks become one: the old flows next to the consolidated flow.' },
      { caption: 'How partners did, task by task: 76% completed, 8% mostly understood, 12% unclear, 4% not completed.' },
    ],
    proprietary: true,
    outcome:
      'The system is live in 300+ H-E-B stores. In testing, partners completed 76% of tasks in the redesigned flow outright, and 84% including tasks they mostly understood. That validated the consolidation before engineering handoff, and the 12% of unclear tasks showed exactly where to iterate next.',
    // TODO: draft — rewrite in Tyler's own voice.
    reflection:
      "Building a tool and redesigning it after partners have lived with it are different jobs. The first time, I was proving the idea could work. The second time, I was asking people to give up habits they'd built around my own app, so testing on their real devices, in their real stores, mattered even more.",
  },
  {
    id: 'ai-enablement',
    kind: 'case-study',
    slot: 'th-w2',
    num: '02',
    arc: 'Enabling AI',
    title: 'AI Enablement',
    headline: { solid: 'AI', outline: 'Enablement' },
    summary:
      'Bringing Copilot and Gemini Enterprise to a design organization, plus the doc site and Instruction Builder that made them usable.',
    meta: 'H-E-B · AI adoption · Internal tools',
    facts: [
      { label: 'Role', value: TBD }, // TODO: copy pending
      { label: 'Timeline', value: TBD }, // TODO: copy pending
      { label: 'Tools', value: TBD }, // TODO: copy pending
    ],
    challenge: TBD, // TODO: copy pending
    approach: [TBD, TBD, TBD], // TODO: copy pending (3–4 key moves)
    outcome: TBD, // TODO: copy pending
    reflection: TBD, // TODO: copy pending
  },
  {
    id: 'store-leader-platform',
    kind: 'project',
    slot: 'th-w3',
    num: '03',
    arc: 'Testing with AI',
    title: 'Multi-Assist Platform for Store Leaders',
    headline: { solid: 'Store Leader', outline: 'Platform' },
    summary: 'Using AI prototyping to fix the prototype between test sessions, not after the study.',
    meta: 'H-E-B · RITE testing · Service design',
    // Bracketed notes below are Tyler's fill-ins; they render as written until replaced.
    facts: [
      { label: 'Role', value: 'Design technologist and prototype lead, embedded with Design Research' },
      { label: 'Timeline', value: '[Start month] – [end month] 2026' }, // TODO: fill in months
      { label: 'Tools', value: 'Figma Make, Figma, [AI model or tool you used for fixes], RITE testing' }, // TODO: name the AI tool
    ],
    challenge:
      'Store leaders and department managers run their day across huddles, notes, partner development, and payroll. H-E-B wanted to know whether one experience could hold all of it, and the only real test was putting it in front of leaders inside their stores.',
    approach: [
      {
        title: 'Model the real workday.',
        text: 'I built a high-fidelity prototype in Figma Make covering daily huddles and dashboards, note tracking, partner development, and payroll, so leaders could react to their actual job instead of a concept.',
      },
      {
        title: 'Fix it between sessions, not after the study.',
        text: 'I embedded with Design Research across 15 stores in 4 regions. When a leader hit a UI or logic gap, I used AI prototyping to fix it before the next session, so every store tested a better version than the last. Alongside testing, we ran 26 in-depth partner interviews.',
      },
      {
        title: 'Take it to the people who decide.',
        text: 'I presented the prototype to program leadership and operations working groups, and worked with Data Solutions on a path to power future prototypes with live enterprise data.',
      },
    ],
    figures: [
      { caption: "The store leader's daily huddle dashboard." },
      { caption: 'One fix, before and after: a gap a leader found in the morning, corrected before the afternoon session.' },
      { caption: 'The research route: 15 stores across 4 regions.' },
    ],
    proprietary: true,
    // TODO: add the decision that came out of the summit, if there was one.
    outcome:
      '15 stores, 4 regions, and 26 partner interviews validated the store leader workflows and closed the UI and logic gaps in real time. Leadership saw the prototype, a path opened to connect future versions to live data, and I co-led "MyHEB as a Store Leader" at the 2026 Design Research Summit. [Add the decision that came out of it, if there was one.]',
    // TODO: draft — rewrite in Tyler's own voice.
    reflection:
      'RITE testing used to mean collecting problems in one round and fixing them weeks later. With AI prototyping, I could change the prototype as fast as research found issues, so the study tested the product we were learning our way toward, not the one we started with.',
  },
  {
    id: 'texas-wpa',
    kind: 'project',
    slot: 'th-w4',
    num: '04',
    arc: 'Live demo',
    title: 'Texas WPA Narratives',
    headline: { solid: 'Texas WPA', outline: 'Narratives' },
    summary: 'Cited AI search over the Texas WPA Slave Narratives from the Library of Congress.',
    meta: 'Library of Congress · AI search · Live demo',
    links: [
      { label: 'View the project ↗' }, // TODO: add the project URL from Tyler
      { label: 'Try the live demo ↓', scrollTo: 'archive' },
    ],
    context:
      "These are first-person accounts recorded by the Federal Writers' Project in 1936–38 from formerly enslaved people in Texas. They include painful history and period language. Every answer links back to the original narrative.",
    facts: [
      { label: 'Role', value: TBD }, // TODO: copy pending
      { label: 'Timeline', value: TBD }, // TODO: copy pending
      { label: 'Tools', value: TBD }, // TODO: copy pending
    ],
    challenge:
      "The narratives have been public for years, but they're underused. The archive has no semantic search, and the accounts were transcribed in heavy dialect, so keyword search misses passages that are plainly about what you're looking for. The words on the page rarely match the words you'd type.",
    approach: [TBD, TBD, TBD], // TODO: copy pending (3–4 key moves)
    outcome: TBD, // TODO: copy pending
    reflection: TBD, // TODO: copy pending
  },
]

const pagesOfKind = (kind: PageKind) => WORK_PAGES.filter((p) => p.kind === kind).map((p) => p.id)

// `matches` lets one nav item stay current across several views. Adding a
// project or case study to WORK_PAGES updates both automatically.
// `section` makes the item land on that section of its view (smooth scroll
// on the same view, curtain transition from another one).
export const NAV: { label: string; view: View; section?: string; matches?: View[] }[] = [
  { label: 'Work', view: 'home', section: 'work', matches: ['home', ...pagesOfKind('project')] },
  { label: 'Case studies', view: pagesOfKind('case-study')[0], matches: pagesOfKind('case-study') },
  { label: 'About', view: 'about' },
]

export const MARQUEE: { text: string; outline?: boolean }[] = [
  { text: 'Prototypes that ship' },
  { text: 'AI enablement', outline: true },
  { text: 'Rapid iterative testing' },
  { text: 'Retrieval interfaces', outline: true },
]

/* ---------- live demo: Ask the Archive ---------- */

// Texas WPA Slave Narratives (Library of Congress, "Born in Slavery").
// Until the Vertex AI RAG Engine corpus is connected, every query returns
// this clearly labeled sample state. Never put invented quotes, narrator
// names or findings here.
export const ARCHIVE_PRESETS = [
  'daily life on Texas plantations',
  'how did people learn of emancipation?',
  'stories from Travis County',
]

export type Chunk = { src: string; meta: string; score: string; text: string }

export const ARCHIVE_SAMPLE: { chunks: Chunk[]; answer: string; meta: string } = {
  chunks: [1, 2, 3].map(() => ({
    src: 'Narrative',
    meta: 'Texas · 1937',
    score: '—.——',
    text: 'Sample retrieved passage — connects to live corpus.',
  })),
  answer: 'Sample answer. Live answers cite the narratives retrieved on the left.',
  meta: '— chunks · ~300 narratives searched · — ms',
}

/* ---------- about ---------- */

// TODO: confirm dates with Tyler — H-E-B "2021 — NOW" overlaps Disney "2021 — 2023".
export const TIMELINE: { when: string; org: string; role: string; detail: string }[] = [
  {
    when: '2021 — NOW',
    org: 'H-E-B',
    role: 'Senior Design Technologist',
    detail:
      'Started as a Design Technologist II. Now on a lean, agile team that explores emerging technologies and turns them into tools, prototypes, and new ways of working.',
  },
  {
    when: '2021 — 2023',
    org: 'The Walt Disney Company',
    role: 'UX Engineer II',
    detail:
      'Built and maintained a UX component library on the DMED design language. Shipped a React/Next.js app tracking metrics for 20+ products, reported to the CTO. Icon sets, color systems, browser compatibility, performance.',
  },
  {
    when: '2019 — 2021',
    org: 'Dell Technologies',
    role: 'Software Engineer',
    detail:
      'Built a UI component library used across hundreds of IT Services projects, plus front-end site architecture. Where the accessibility habit came from.',
  },
  {
    when: '2019',
    org: 'Texas State University',
    role: 'BS Computer Science, minor Applied Math',
    detail: 'San Marcos, TX.',
  },
]

export const SKILLS: { tier: string; items: string }[] = [
  { tier: 'Advanced', items: 'JavaScript · TypeScript · React · Next.js · Git · accessibility' },
  { tier: 'Proficient', items: 'Node.js · Apollo GraphQL · MongoDB · Jest · Webpack · Java · C++' },
  { tier: 'Practice', items: 'Design systems · prototyping · AI enablement · rapid iterative testing · UX leadership' },
]

export const CONTACT = {
  email: 'tylerhooks8@gmail.com',
  github: 'https://www.github.com/tylerhooks1',
  linkedin: 'https://www.linkedin.com/in/tyler-hooks-9214abb5',
  // Drop the PDF in public/ under this name.
  resume: '/resume.pdf',
}
