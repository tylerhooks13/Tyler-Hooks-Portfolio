/*
 * Data for the AI Enablement case study's figures (EnablementHero.tsx,
 * EnablementFigures.tsx, EnablementCard.tsx). Every value is an example:
 * screens and flows are recreated to protect proprietary work.
 */

/* ---------- Instruction Builder ---------- */

export const IB_ROLES = ['Product designer', 'Design researcher', 'Design technologist'] as const
export const IB_TIMELINES = ['1 week', '2 weeks', '1 month'] as const
export const IB_TOOLS = [
  { value: 'GitHub Copilot', label: 'GitHub Copilot' },
  { value: 'Figma MCP', label: 'Figma MCP' },
  { value: 'Figma Make', label: 'Figma Make' },
  { value: 'Design system components MCP', label: 'Components MCP' },
] as const
export const IB_GUIDES = [
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'scope', label: 'Stay in scope' },
] as const

export type IbForm = {
  name: string
  role: string
  goal: string
  tools: string[]
  timeline: string
  guides: string[]
}

export const IB_DEFAULT: IbForm = {
  name: 'Store pickup redesign',
  role: 'Product designer',
  goal: 'Prototype a faster pickup check-in flow to test with store partners.',
  tools: ['GitHub Copilot', 'Figma MCP', 'Design system components MCP'],
  timeline: '2 weeks',
  guides: ['accessibility'],
}

export const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project'

// The file the builder hands back, section by section.
export function buildMd(f: IbForm) {
  const name = f.name.trim() || 'Untitled project'
  const goal = f.goal.trim()
  const lines: string[] = []
  lines.push('# ' + name, '')
  lines.push('## Role', 'Work as a ' + f.role.toLowerCase() + ' on this project.', '')
  if (goal) lines.push('## Goal', goal, '')
  lines.push('## Timeline', f.timeline, '')
  if (f.tools.length) {
    lines.push('## Tools')
    f.tools.forEach((t) => lines.push('- ' + t))
    lines.push('')
  }
  if (f.tools.includes('Figma MCP')) lines.push('## Design files', 'Read frames from the linked Figma file before building.', '')
  if (f.tools.includes('Design system components MCP'))
    lines.push('## Components', 'Use design system components from the components MCP. Do not invent new ones.', '')
  if (f.guides.includes('accessibility'))
    lines.push('## Accessibility', '- Meet WCAG 2.2 AA', '- Label every control', '- Check color contrast', '')
  if (f.guides.includes('scope')) lines.push('## Scope', 'Stay within the goal above. Ask before adding features.', '')
  return lines.join('\n').trimEnd()
}

/* ---------- Workflow: who prototypes ---------- */

export type Lane = 'D' | 'T' | 'E'
export type NodeId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
export type FlowNode = { lane: Lane; col: number; label: string; sub?: string; hidden?: boolean; optional?: boolean }
export type FlowEdge = [NodeId, NodeId, { label?: string; optional?: boolean }?]
/** `e` is the edge the dot travels to reach `to`; `hand` marks a handoff between teams. */
export type FlowStep = { e?: number; to: NodeId; say: string; hand?: string }
export type Flow = { nodes: Record<NodeId, FlowNode>; edges: FlowEdge[]; seq: FlowStep[] }

export const LANES: { id: Lane; name: string; y: number }[] = [
  { id: 'D', name: 'Designer', y: 92 },
  { id: 'T', name: 'Design tech', y: 192 },
  { id: 'E', name: 'Engineering', y: 292 },
]

export const BEFORE: Flow = {
  nodes: {
    a: { lane: 'D', col: 0, label: 'Idea' },
    b: { lane: 'D', col: 1, label: 'Write request' },
    c: { lane: 'T', col: 2, label: 'Waits in queue' },
    d: { lane: 'T', col: 3, label: 'Build prototype' },
    e: { lane: 'D', col: 4, label: 'Review' },
    f: { lane: 'T', col: 5, label: 'Revise' },
    g: { lane: 'E', col: 6, label: 'Handoff' },
  },
  edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'e', { label: 'repeat' }], ['e', 'g']],
  seq: [
    { to: 'a', say: 'A designer has an idea worth testing.' },
    { e: 0, to: 'b', say: 'They write it up as a request for design tech.' },
    { e: 1, to: 'c', say: 'The request waits until design tech has capacity.', hand: 'the request moves to design tech' },
    { e: 2, to: 'd', say: 'Design tech builds the prototype.' },
    { e: 3, to: 'e', say: 'The designer reviews it and sends feedback.', hand: 'the prototype goes back to the designer' },
    { e: 4, to: 'f', say: 'Design tech revises it.', hand: 'feedback goes back to design tech' },
    { e: 5, to: 'e', say: 'Another round of review. This loop often repeats.', hand: 'revisions return to the designer' },
    { e: 6, to: 'g', say: 'The prototype finally reaches engineering.', hand: 'the approved prototype moves to engineering' },
  ],
}

export const AFTER: Flow = {
  nodes: {
    a: { lane: 'D', col: 0, label: 'Idea' },
    b: { lane: 'D', col: 1, label: 'Build context', sub: 'Instruction Builder' },
    c: { lane: 'T', col: 2, label: 'Waits in queue', hidden: true },
    d: { lane: 'D', col: 2, label: 'Prototype', sub: 'Copilot · Figma Make' },
    e: { lane: 'D', col: 3, label: 'Test & iterate' },
    f: { lane: 'T', col: 4, label: 'Consult', sub: 'when needed', optional: true },
    g: { lane: 'E', col: 5, label: 'Handoff' },
  },
  edges: [
    ['a', 'b'],
    ['b', 'd'],
    ['d', 'e'],
    ['e', 'd', { label: 'iterate' }],
    ['e', 'f', { optional: true }],
    ['f', 'g', { optional: true }],
    ['e', 'g'],
  ],
  seq: [
    { to: 'a', say: 'A designer has an idea worth testing.' },
    { e: 0, to: 'b', say: 'They capture project context once with the Instruction Builder.' },
    { e: 1, to: 'd', say: 'They prototype it themselves in Copilot or Figma Make.' },
    { e: 2, to: 'e', say: 'They test it and iterate, without waiting on another team.' },
    { e: 3, to: 'd', say: 'Iterating is quick because nothing leaves the designer’s hands.' },
    { e: 2, to: 'e', say: 'Ready to share.' },
    { e: 6, to: 'g', say: 'The prototype reaches engineering.', hand: 'the tested prototype moves to engineering' },
  ],
}

/** The restructure between the two runs, one change at a time. */
export const MORPH: { ids: NodeId[]; say: string; who?: string; role?: string }[] = [
  { ids: ['b'], say: 'The request became context. Designers capture it once with the Instruction Builder.' },
  { ids: ['c'], say: 'The queue disappeared. There’s nothing to wait in line for.' },
  { ids: ['d'], say: 'Designers build the prototype themselves, in Copilot or Figma Make.', who: 'Designer' },
  { ids: ['e'], say: 'Review became testing and iterating, with no handoff back.' },
  {
    ids: ['f', 'g'],
    say: 'Design tech moved from builder to guide, consulted only for larger technical work.',
    role: 'Guide',
  },
]

export const FLOW_DESC = {
  before:
    'Before: the designer writes a request, it waits in the design tech queue, design tech builds the prototype, then review and revision loop between teams before handoff to engineering. Five handoffs.',
  after:
    'After: the designer builds context with the Instruction Builder, prototypes in Copilot or Figma Make, tests and iterates on their own, consults design tech only for larger technical work, then hands off to engineering. One handoff.',
}

/* ---------- Plugin timeline ---------- */

// Working hours: 40 per week. Estimate 2–12 weeks; actual 2 hours.
export const PLUGIN_HOURS = { estMin: 80, estMax: 480, act: 2 }
export const PLUGIN_SCALES = {
  weeks: {
    max: 480,
    ticks: [
      [0, '0'],
      [80, '2 wk'],
      [160, '4 wk'],
      [320, '8 wk'],
      [480, '12 wk'],
    ],
  },
  hours: {
    max: 12,
    ticks: [
      [0, '0 hr'],
      [2, '2 hr'],
      [4, '4 hr'],
      [8, '1 day'],
      [12, '12 hr'],
    ],
  },
} as const satisfies Record<string, { max: number; ticks: readonly (readonly [number, string])[] }>

/* ---------- Design research agent ---------- */

export type SourceId = 'repo' | 'figma' | 'tests' | 'atl'

export const AGENT_SOURCES: { id: SourceId; label: string; sub: string; y: number; v1: boolean }[] = [
  { id: 'repo', label: 'Research repositories', sub: 'Confluence', y: 40, v1: true },
  { id: 'figma', label: 'Figma artifacts', sub: 'via subagents', y: 110, v1: true },
  { id: 'tests', label: 'Usability test transcripts', sub: 'testing platform MCP', y: 180, v1: false },
  { id: 'atl', label: 'Project documentation', sub: 'Atlassian MCP', y: 250, v1: false },
]

export const AGENT_QUESTIONS: { q: string; uses: SourceId[]; next: SourceId[] }[] = [
  { q: 'What do we know about how shoppers use curbside pickup?', uses: ['repo', 'figma'], next: ['tests', 'atl'] },
  { q: 'Which studies tested the checkout flow, and what changed after?', uses: ['repo', 'figma'], next: ['atl'] },
  { q: 'What did participants say in last month’s usability sessions?', uses: [], next: ['tests'] },
]
