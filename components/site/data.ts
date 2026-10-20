import archivePresets from './archive-presets.json'

export type PageId ='guided-tasks' | 'ai-enablement' | 'store-leader-platform' | 'texas-wpa'
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
  /** false hides the arc in the page's top eyebrow; the card still shows it. */
  arcOnPage?: boolean
  title: string
  /** Page headline: solid line, then the outlined word(s). */
  headline: { solid: string; outline?: string }
  summary: string
  meta: string
  /** Card image; the striped placeholder shows until this is set. */
  src?: string
  /** Describes the card image for screen readers; falls back to the title. */
  alt?: string
  /** Replaces the card image with a live component. */
  cardLive?: 'store-leader' | 'wpa'
  /** Page hero image. `ratio` (width / height) shows it uncropped at its own
   *  proportions; without it the image fills the standard hero frame.
   *  `panels`: for a strip of side-by-side screens, how many there are, so
   *  swiping it on phones lands on one at a time. */
  hero?: { src: string; alt: string; ratio?: number; panels?: number }
  /** Replaces the hero image with a live component. */
  heroLive?: 'store-leader' | 'wpa'
  /** Still being iterated on: shows an "In progress" badge on the card. */
  inProgress?: boolean
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
  figures?: { caption: string; src?: string; alt?: string }[]
  /** Replaces the static figures with an interactive component. */
  interactiveFigures?: 'store-leader' | 'wpa'
  /** Proprietary work: figures are recreations, and a note offers a walkthrough. */
  proprietary?: boolean
  outcome?: string
  /** Replaces the Outcome section with titled sections, after the figures. */
  sections?: { title: string; text: string }[]
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
    title: 'Seamless Store Experience',
    headline: { solid: 'Seamless Store', outline: 'Experience' },
    summary: 'Turning scattered store tools into one app, shaped by the leaders who’d use it.',
    meta: 'H-E-B · RITE testing · Design research',
    // Card artwork built live (StoreLeaderCard.tsx) instead of an image.
    cardLive: 'store-leader',
    // Hero built live (StoreLeaderHero.tsx) instead of an image.
    heroLive: 'store-leader',
    // Bracketed notes below are Tyler's fill-ins; they render as written until replaced.
    facts: [
      { label: 'Role', value: 'Design technologist and prototype lead, embedded with Design Research' },
      { label: 'Timeline', value: 'February – April 2026' },
      { label: 'Tools', value: 'Figma Make, Figma, GitHub Copilot, RITE testing' },
    ],
    challenge:
      'Store leaders run operations, lead partners, and take care of customers, but their work is spread across apps that don’t connect. Every hour spent at a desk switching between apps and digging through reports is an hour away from the floor. H-E-B wanted to know whether one app could replace them, so we took it to leaders to find out.',
    approach: [
      {
        title: 'Model the real workday.',
        text: 'I built a high-fidelity prototype in Figma Make covering daily briefings and dashboards, note tracking, partner development, and payroll, so leaders could react to their actual job instead of a concept.',
      },
      {
        title: 'Test it where the work happens.',
        text: 'I embedded with Design Research across 15 stores in 4 regions, testing the prototype with leaders and running 26 in-depth partner interviews to learn how their days actually run.',
      },
      {
        title: 'Let the stores change the plan.',
        text: 'We used rapid iterative testing (RITE), updating the prototype between sessions as stores showed us what they needed. In stores already piloting Gemini, we asked leaders how they were using AI day to day. The briefing page started as a simple summary with follow-up tasks, until we kept seeing leaders jot follow-ups on their phones, on scraps of paper, even on their hands. That became its own notes page with AI summarization. Building in Figma Make, and later GitHub Copilot, kept the prototype rough enough to change overnight and kept every session on one question: does this make a leader’s day easier?',
      },
    ],
    // Interactive phone figures (StoreLeaderFigures.tsx) instead of static images.
    interactiveFigures: 'store-leader',
    proprietary: true,
    outcome:
      'By the end of the study, the prototype had grown from a fixed artifact built before the first session into a research tool that changed with the evidence while the study’s goals stayed the same. Every round of sessions sharpened the details: store-specific terms, who in each role and department can see what, and generated text that sounds like real floor talk. The result was a store leader experience shaped by real workdays in 15 stores, not by assumptions made before the study.',
    reflection: [
      'RITE testing only works if you can change the prototype before the next session. Complex updates used to take too long, so feedback went into a backlog for after the study. AI-assisted prototyping closed that gap without skipping any research steps.',
      'Speed still needed a filter. Reacting to one session risks chasing one person’s opinion, so every change went through synthesis with Design Research and was sorted into three buckets: trust and usability blockers, high-value hypotheses, and longer-term insights. Speed also raised the bar for quality. One wrong store number, or a line no store leader would actually say, could cost a participant’s trust, so I checked every AI-generated update by hand before it went back in front of a leader. Clean design files and prompts that spelled out what should change, and what had to stay the same, made the output reliable.',
      'The goal was never the most edits. It was the right ones: changes that made the remaining sessions teach us more.',
      'This was also the first time design technology was embedded this deeply in research. We joined synthesis, presented readouts, and ran live demos, which showed how much a design technologist adds while the problem is still being figured out.',
    ].join('\n\n'),
  },
  {
    id: 'texas-wpa',
    kind: 'project',
    slot: 'th-w4',
    num: '04',
    arc: 'Live demo',
    arcOnPage: false,
    title: 'Texas WPA Narratives',
    headline: { solid: 'Texas WPA', outline: 'Narratives' },
    summary: 'Cited AI search over the Texas WPA Slave Narratives from the Library of Congress.',
    meta: 'RAG system',
    cardLive: 'wpa',
    heroLive: 'wpa',
    inProgress: true,
    links: [{ label: 'Try the live demo ↓', scrollTo: 'archive' }],
    context:
      "About 300 first-person interviews with formerly enslaved Texans, recorded by the Federal Writers' Project in 1936–38. They include painful history and period language. Most interviewers were white Southerners working during Jim Crow, which shaped what people felt safe saying, so the system reports individual accounts and never generalizes one person's experience to everyone.",
    facts: [
      // TODO: confirm role wording and timeline with Tyler.
      { label: 'Role', value: 'Solo. Corpus preparation, retrieval design, and the demo interface.' },
      { label: 'Timeline', value: '2026, in progress' },
      {
        label: 'Tools',
        value: 'Vertex AI RAG Engine, Gemini, Cloud Storage, Python, Next.js, TypeScript',
      },
    ],
    challenge:
      "The narratives have been public for years, but they're underused. Interviewers transcribed speech phonetically (\"massa,\" \"fotches,\" \"patterrollers\"), so keyword search misses passages that are plainly about what you asked. Those spellings were the interviewers' choices, not the speakers'. Different interviewers spelled the same words differently, so the record carries their habits as much as the speakers' voices. The question this project tests: can semantic retrieval bridge that gap, and can the answer stay honest about where it came from? The first test run suggests the second part holds. The first is more complicated.",
    approach: [
      {
        title: 'A clean, citable corpus',
        text: "I used Project Gutenberg's human-proofread text instead of the Library of Congress page scans, which would have needed OCR. LOC stays the cross-reference. A Python script splits the volumes on the six-digit interview number stamped on each typescript, a reliable boundary that ties every file back to the LOC original. One file per narrative, named for its part, interview number, and speaker, means every retrieved chunk carries its own citation. A spot-check caught transcriber back-matter appended to the last narrative of a volume; I fixed the splitter rather than the file.",
      },
      {
        title: 'Managed retrieval tuned for short oral histories',
        text: "The corpus runs on Vertex AI RAG Engine in Serverless mode with RAG-managed vector search. At a few thousand chunks, any vector store performs about the same, so the deciding factors were no infrastructure to run and no idle hourly billing. I chunked at 512 tokens with 128 overlap instead of the 1024/256 default: many narratives are 700–2,000 words, and 1024-token chunks would blur several episodes into one embedding. Setup had its own obstacles. The project-level deployment mode defaulted to Spanner, which is capacity-restricted for new projects in us-central1, and the console had no way to change it, so I switched to Serverless through the REST API.",
      },
      {
        title: 'Retrieval shown before generation',
        text: "A prebuilt agent in Agent Studio worked, but it pulled in outside sources. The demo makes two calls instead: retrieve the top five passages, then ask Gemini to answer from those five and nothing else. The passages on screen are exactly what the answer was built from, so the answer can't cite anything the visitor can't read. The prompt also tells the model to cite every claim, decline when the passages don't cover a question, correct false premises, report conflicting accounts, and keep speakers' own wording.",
      },
      {
        title: 'Testing it',
        text: "Building the pipeline was the easy part. Knowing whether it works is harder, and that's where most of my time is going now.\n\nTo start, I had AI draft 78 test questions from 12 narratives I'd read: questions about one specific narrative, at increasing difficulty; questions about themes that run across many; the same question in plain English and in phonetic spelling; questions that invite a sweeping generalization; and questions the system should refuse. The second figure shows what each one is testing.\n\nThose questions are a first draft, and I'm treating them that way. AI-written questions tend to borrow the source's wording, which makes them easier than they look, and a few already turned out to misread the passage they were based on. I'm reviewing them as I read through the narratives myself.",
      },
    ],
    // Fig. 1: the dialect gap (tabs). Fig. 2: the 78-question evaluation set with round 1 results.
    interactiveFigures: 'wpa',
    sections: [
      {
        title: 'What the first run suggested',
        text: "I ran all 78 through the same pipeline the demo uses. Nothing here is final, but a few patterns were hard to miss:\n\n- **It didn't make things up.** When retrieval missed, the answer said the passages didn't cover the question, rather than filling the gap. That held every time.\n- **Naming the narrator changed everything.** Questions that named the person almost always found them. Questions that only described what happened, which is how someone new to the collection would actually ask, found the right narrative about half the time.\n- **Dialect cut both ways.** Asking about \"patrols\" in plain English still reached passages that spell it \"patter rolls.\" But asking about horses running off with a carriage missed Lewis Jones's story, and the same question in his spelling found it first.",
      },
      {
        title: "Questions I'm sitting with",
        text: "- **Is the dialect really the narrator's?** In the 18 narratives I've read so far, \"master\" shows up as massa, marse, marster or master. Each narrative mostly sticks to one spelling, and they disagree with each other. That points to whoever transcribed the interview, which raises a question about what \"searching the dialect\" even means.\n- **How should the text be cut up?** Right now each narrative is split into 512-token pieces. Larger 1024-token pieces would keep more of a story together but blur separate moments into one. I want to compare the two on the same questions.\n- **What should every piece carry?** A narrator's name only appears at the top of their file, so most pieces don't know who's speaking. Adding it to every piece might fix the naming gap, or it might just hide it.",
      },
      {
        title: "What's next",
        text: "I'm working through the narratives in batches, noting how dialect actually shows up: respelled everyday words, period vocabulary, and grammar. That review will reshape the test questions, especially the dialect pairs, so that a plain question and its phonetic twin ask exactly the same thing. This is a side project I'm learning through, so it'll move in steps. I'll update this page as it does.",
      },
    ],
    // TODO: draft — rewrite in Tyler's own voice.
    reflection:
      "The design question here was trust, not fluency. A fluent answer about this material is easy to produce and easy to get wrong, so the interface shows what was found, how closely it matched, and who said it before any generated text appears. If the evidence and the answer disagree, a visitor can see it.",
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

// Texas WPA Slave Narratives, answered live by /api/ask (Vertex AI RAG
// Engine + Gemini). Chip questions are served from public/demo-answers/<slug>.json
// when present (generate with scripts/precompute-demo-answers.mjs) and fall
// back to the live API otherwise. Typed questions always go live.
export const ARCHIVE_PRESETS: { slug: string; question: string }[] = archivePresets

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
