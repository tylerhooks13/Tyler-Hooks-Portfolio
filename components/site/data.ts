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
// Both use the same page template; `kind` changes the labels and the body layout.
export type PageKind = 'project' | 'case-study'
export const KIND_LABEL: Record<PageKind, string> = { project: 'Project', 'case-study': 'Case study' }

// Fields every page shares: the card, the page hero and the facts.
type PageBase = {
  id: PageId
  slot: string
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
  cardLive?: 'guided-tasks' | 'store-leader' | 'wpa' | 'ai-enablement'
  /** Page hero image. `ratio` (width / height) shows it uncropped at its own
   *  proportions; without it the image fills the standard hero frame. */
  hero?: { src: string; alt: string; ratio?: number }
  /** Replaces the hero image with a live component. */
  heroLive?: 'guided-tasks' | 'store-leader' | 'wpa' | 'ai-enablement'
  /** Still being iterated on: shows an "In progress" badge on the card. */
  inProgress?: boolean
  /** Links under the page summary. No href renders a [TBD] placeholder;
   *  `scrollTo` jumps to a section on another view (e.g. the live demo). */
  links?: { label: string; href?: string; scrollTo?: string }[]
  facts: { label: string; value: string }[]
  /** Proprietary work: figures are recreations, and a note offers a walkthrough. */
  proprietary?: boolean
}

// Projects: one template of challenge, approach, figures, outcome, reflection.
export type ProjectPage = PageBase & {
  kind: 'project'
  /** Optional short summary that opens the page, for long projects. */
  glance?: string
  /** Optional background section shown before the challenge. */
  context?: string
  challenge: string
  /** Key moves: plain text, or a short title plus body. */
  approach: (string | { title: string; text: string })[]
  /** Figures under the approach; three labeled placeholders when omitted. */
  figures?: { caption: string; src?: string; alt?: string }[]
  /** Replaces the static figures with an interactive component. */
  interactiveFigures?: 'guided-tasks' | 'store-leader' | 'wpa'
  outcome?: string
  /** Replaces the Outcome section with titled sections, after the figures. */
  sections?: { title: string; text: string }[]
  reflection: string
}

/** Interactive figures a case study can place between its paragraphs. */
export type CaseFigure = 'instruction-builder' | 'research-agent' | 'plugin-timeline' | 'workflow'

// Case studies are longer and read top to bottom: an at-a-glance block under
// the hero, then titled chapters with figures placed where they make their
// point, and a section index in the left margin on wide screens.
export type CaseStudyPage = PageBase & {
  kind: 'case-study'
  /** The longer summary in the at-a-glance block; `summary` stays on the card. */
  glance: string
  /** Each chapter's body is copy (same rules as project copy) and figures, in order. */
  chapters: { id: string; label: string; title: string; body: (string | { figure: CaseFigure })[] }[]
}

export type WorkPage = ProjectPage | CaseStudyPage

export const WORK_PAGES: WorkPage[] = [
  {
    id: 'guided-tasks',
    kind: 'project',
    slot: 'th-w1',
    arc: 'Before AI',
    title: 'Guided Task Management System',
    headline: { solid: 'Guided Task', outline: 'Management' },
    summary: 'A store-partner tool prototyped from the ground up, now live in 300+ H-E-B stores.',
    meta: 'H-E-B · Prototyping · Shipped',
    // Card artwork and page hero built live (GuidedTaskCard.tsx, GuidedTaskHero.tsx).
    cardLive: 'guided-tasks',
    heroLive: 'guided-tasks',
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
    // Fig. 01: four walks vs one guided walk (map + handheld). Fig. 02: field-testing results.
    interactiveFigures: 'guided-tasks',
    proprietary: true,
    outcome:
      'In the research sessions, partners completed 76% of tasks in the prototype outright, and 84% including tasks they mostly understood. That validated the consolidation, and the 12% of unclear tasks showed exactly where to iterate next. After those rounds of testing and iteration, the work went into production and is now live in 300+ H-E-B stores.',
    // TODO: draft — rewrite in Tyler's own voice.
    reflection:
      "Building a tool and redesigning it after partners have lived with it are different jobs. The first time, I was proving the idea could work. The second time, I was asking people to give up habits they'd built around my own app, so testing on their real devices, in their real stores, mattered even more.",
  },
  {
    id: 'ai-enablement',
    kind: 'case-study',
    slot: 'th-w2',
    arc: 'Enabling AI',
    title: 'AI Enablement in a Design Org',
    headline: { solid: 'AI Enablement', outline: 'in a Design Org' },
    summary:
      'Bringing Copilot and Gemini Enterprise to a design organization, plus the doc site and Instruction Builder that made them usable.',
    meta: 'H-E-B',
    // Card artwork and page hero built live (EnablementCard.tsx, EnablementHero.tsx).
    cardLive: 'ai-enablement',
    heroLive: 'ai-enablement',
    glance:
      'Our design org had AI tools, but designers saw them as coding tools, not design tools. As one of two design technologists, I helped translate them into design workflows: tooling, guidance, and hands-on support that made prototyping self-serve and moved our team toward higher-leverage work.',
    facts: [
      { label: 'Role', value: 'Senior Design Technologist, H-E-B' },
      { label: 'Team', value: 'Design technology, a team of two, within a broader enablement group' },
      { label: 'Focus', value: 'AI enablement across a design organization of about 90 people' },
      {
        label: 'Tools',
        value: 'GitHub Copilot, Figma Make, Figma MCP, Gemini Enterprise, NotebookLM, Atlassian Rovo, Airtable',
      },
      {
        label: 'What I built',
        value: 'AI Prototyping Doc Site, Instruction Builder, role-based skills, a design research agent',
      },
    ],
    chapters: [
      {
        id: 'problem',
        label: 'The problem',
        title: 'The problem: blocked, not resistant',
        body: [
          "AI was underused in our design org. A handful of curious designers experimented and shared what they learned, but most weren't ready to fold it into their work.",
          'The tools were part of the reason. My team had already piloted GitHub Copilot for AI-assisted prototyping and shared the findings at a digital-org all-hands. But Copilot lived in VS Code and GitHub, spaces built for engineers. To most designers, it looked like an AI coding tool, not something that would move design work forward.',
          "The hesitancy I saw wasn't skepticism about AI. Designers felt blocked. They had access to tools without a clear picture of what to do with them.",
        ],
      },
      {
        id: 'team',
        label: 'The team',
        title: 'A team of two',
        body: [
          "Design technology at H-E-B is two people: me and one other design technologist. It's the smallest team I've worked on, and the one with the most reach: two of us supporting a design org of about 90 people.",
          "We sit inside a broader enablement group alongside design systems and design operations. Part of a design technologist's job is assessing emerging technology for the org, so when our senior manager asked us to run enablement labs and get everyone set up with Copilot, AI enablement became our work.",
          'We split it by availability and ownership. Each of us owns our own tools end to end. That keeps us fast, and it raises questions I come back to at the end.',
        ],
      },
      {
        id: 'approach',
        label: 'Approach',
        title: 'Approach: meet designers where they work',
        body: [
          'I started from how designers already worked and asked where AI could pick up from there.',
          [
            "- **Copilot first.** It's the most versatile option, with MCPs, skills, and agents that other tools don't offer as easily. We connected it to Figma through the Figma MCP so it could read design files, and tested it on FigJam service blueprints and research syntheses to see how well it organized messy information for stakeholders.",
            '- **Figma Make,** because designers already had it.',
            "- **Research synthesis.** Zoom interview transcripts went into NotebookLM, or into a folder Copilot could read, to draft synthesis and cut a large share of researchers' time.",
            "- **Gemini Enterprise,** which we framed for designers while it was still in pilot so they'd be ready when access opened.",
          ].join('\n'),
          '**Working within constraints.** An internal AI council approves tools for security, and the org expects financial stewardship. I explore widely on my own, but I bring things back with a business case so the org can build buy-in.',
          '**Managers first.** Before the first full enablement lab, we ran a session just for managers. Our senior manager backed the effort and asked other managers to get their teams set up, so designers walked into the lab already expected to use what they learned.',
          "**Translation over training.** VS Code was overwhelming for many designers. I explained it as their Finder in a different format, and we moved people to Copilot's desktop app when it arrived. Most of the real friction was practical: out-of-date machines and install permissions.",
        ],
      },
      {
        id: 'built',
        label: 'What I built',
        title: 'What I built',
        body: [
          '**AI Prototyping Doc Site.** A permanent home for our best practices: accessibility guidance, internal design practices, do\'s and don\'ts, and copy-and-paste templates. It focused on the gap between a mediocre AI response and a good one, which is usually context about the business, the content, and the design strategy.',
          '**Instruction Builder.** Designers filled out a form about their project (details, timeline, tooling, internal MCPs for design components) and got back a structured, machine-readable markdown file. They could attach it to a project or turn it into a skill, giving the AI a solid baseline of context. It arrived when the org had few AI tools approved, and served as a one-stop shop for deep context.',
          { figure: 'instruction-builder' },
          '**Role-based skills.** Skills for a product designer, a design technologist, and a design researcher, so teams with little design support could get work reviewed through those lenses and keep the AI in scope. Some people found the idea unsettling at first, which I respected. The goal was coverage, not replacement.',
          "**Design research agent.** I'm now working with our design research team on their repositories in Confluence. Version 1 is a Rovo agent, available internally, grounded only in our research repositories, with subagents that pull related Figma artifacts. Research managers want to restructure their repository to be readable by both people and machines. Next we're weighing a custom research agent that connects Atlassian, Figma, and our usability-testing platform through their MCPs, since Rovo limits custom connectors.",
          { figure: 'research-agent' },
        ],
      },
      {
        id: 'proof',
        label: 'Proof point',
        title: 'Proof point: weeks of work in two sessions',
        body: [
          'A partner on our accessibility team wanted to build a Figma plugin but had never built one. They expected it to take weeks, possibly most of a quarter.',
          "We built it together with Copilot in two one-hour sessions. I showed them how Copilot fills the gaps when you aren't used to writing plugin code. Then we added usage tracking with Airtable, so they can see how many people use the plugin and how new users move through it. A next step is automating a weekly or monthly Slack summary of those numbers.",
          { figure: 'plugin-timeline' },
        ],
      },
      {
        id: 'impact',
        label: 'Impact',
        title: 'Impact: prototyping became self-serve',
        body: [
          'The clearest change is in who prototypes. Prototyping used to be a core part of my job. Now designers do much of it themselves, and our team writes the guidance and steps in for larger technical efforts.',
          { figure: 'workflow' },
          [
            '- **Labs became a ritual.** Enablement labs, now led by our skip-level manager, draw steady turnout and have become a regular part of the org\'s rhythm. My teammate and I are consulted as each group comes on, and I plan to host labs of my own around the research agent.',
            "- **The questions dried up.** Early in the Copilot rollout, people came to me constantly. Now they mostly don't, a quiet sign the setup stuck.",
            "- **Our work moved up.** With prototyping off our plate, I work across design research and engineering at once. We're being pulled into enterprise workflows, and much of the code I write now goes into applications headed to customers, not throwaway prototypes.",
          ].join('\n'),
        ],
      },
      {
        id: 'reflection',
        label: 'Reflection',
        title: 'Reflection',
        body: [
          "**How I approach AI work.** I start with clarity: what are we actually trying to solve? Then I weigh speed and value: is this worth the time and effort, and how fast can we iterate? Our process hasn't changed much since we formalized it in workshops before the AI push. What has changed is the problem space. We now step into work that is more ambiguous and complex, often barely fleshed out, and add both design input and working functionality.",
          '**Tools have a shelf life.** AI tools are improving so fast that something we build may matter less in four to six months. The Instruction Builder is an example. It filled a real gap when context lived in scattered Confluence pages. Now MCPs and skills pull that context directly, and many designers use pre-made or self-made skills. The site stays up for anyone who needs it. I see that as the job, not a loss: build the bridge, then let the platform catch up.',
          "**Who owns this?** On a team of two, each of us owns our tools end to end, and we rarely onboard each other onto them. That's efficient, but if one of us leaves or is pulled onto a higher priority, people relying on a tool could be left stuck. As our role shifts toward enablement and service ownership, I think a lot about continuity.",
          "**What's next.** With a larger team, I'd want us to act more like product owners: building scalable solutions, sharing ownership across tools, and treating enablement as a product with a roadmap rather than a series of projects. Closer in, it's the research agent pilot and the move from a Rovo prototype to a research agent that connects the tools researchers already use.",
        ],
      },
    ],
  },
  {
    id: 'store-leader-platform',
    kind: 'project',
    slot: 'th-w3',
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
    // TODO: draft — rewrite in Tyler's own voice.
    glance:
      "**Problem.** About 300 interviews with formerly enslaved Texans are public but hard to search. Interviewers spelled speech phonetically, so keyword search misses passages that are plainly about what you asked.\n\n**Approach.** A cited AI search on Vertex AI RAG Engine and Gemini: one clean file per narrative, small chunks sized for short oral histories, and an interface that shows the retrieved passages before any generated answer.\n\n**What the first 78-question test run suggested:**\n\n- **It didn't make things up.** When retrieval missed, the answer said the passages didn't cover the question. Every time.\n- **Names work, descriptions don't yet.** Naming the narrator almost always found them. Describing what happened found the right narrative about half the time.\n- **Dialect cuts both ways.** Plain English sometimes reached phonetic spellings and sometimes missed them entirely.\n\n**Status.** In progress. The demo below is live, and I'm reviewing the AI-drafted test questions by hand as I read the narratives. The full method, results, and open questions follow.",
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

/** "01", "02"…: each kind counts on its own, in WORK_PAGES order (Project 03, Case study 01). */
export const pageNum = (page: WorkPage) => String(pagesOfKind(page.kind).indexOf(page.id) + 1).padStart(2, '0')

// `matches` lets one nav item stay current across several views. Adding a
// project or case study to WORK_PAGES updates both automatically.
// `section` makes the item land on that section of its view (smooth scroll
// on the same view, curtain transition from another one).
export const NAV: { label: string; view: View; section?: string; matches?: View[] }[] = [
  { label: 'Work', view: 'home', section: 'work', matches: ['home', ...PAGE_IDS] },
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

export const TIMELINE: { when: string; org: string; role: string; detail: string }[] = [
  {
    when: '2023 — NOW',
    org: 'H-E-B',
    role: 'Senior Design Technologist',
    detail:
      'Started as a Design Technologist II. Now on a lean, agile team that explores emerging technologies and turns them into tools, prototypes, and new ways of working.',
  },
  {
    when: '2021 — 2022',
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
  github: 'https://github.com/tylerhooks13',
  linkedin: 'https://www.linkedin.com/in/tyler-hooks-9214abb5',
  // Drop the PDF in public/ under this name.
  resume: '/resume.pdf',
}
