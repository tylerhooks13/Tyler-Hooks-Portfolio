import { NextResponse } from 'next/server'
import { GoogleAuth, IdentityPoolClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'

/*
 * Ask the Archive: retrieval-augmented answers over the Texas WPA Slave
 * Narratives. Two calls, on purpose:
 *   1. RAG Engine :retrieveContexts → the top 5 passages (shown to the visitor)
 *   2. Gemini :generateContent      → an answer built ONLY from those passages
 * So every [n] in the answer points at a passage the visitor can read.
 * Credentials never leave the server.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUESTION = 300
const TOP_K = 5
const MAX_OUTPUT_TOKENS = 700
const RATE_LIMIT = 15
const RATE_WINDOW_MS = 60 * 60 * 1000

// Project Gutenberg ebooks for Vol. XVI, Parts 1–4.
const GUTENBERG: Record<string, string> = {
  '1': 'https://www.gutenberg.org/ebooks/30576',
  '2': 'https://www.gutenberg.org/ebooks/30967',
  '3': 'https://www.gutenberg.org/ebooks/35380',
  '4': 'https://www.gutenberg.org/ebooks/35381',
}

export type Passage = {
  n: number
  name: string
  interview: string | null
  part: string | null
  link: string | null
  score: number | null
  text: string
}

export type AskResponse = {
  status: 'ok' | 'no_results' | 'blocked'
  answer: string | null
  note?: string
  /** Which way `score` points: similarity (higher = closer) or distance (lower = closer). */
  scoreKind: 'similarity' | 'distance'
  passages: Passage[]
}

/* ---------- config ---------- */

const env = (key: string) => {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var ${key}`)
  return v
}

// No service account keys (the org policy blocks them). On Vercel, the
// deployment's OIDC token is exchanged through Workload Identity Federation
// for a short-lived token as the service account. Locally, Application
// Default Credentials (`gcloud auth application-default login`) are used.
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']
type TokenSource = { getAccessToken(): Promise<{ token?: string | null }> }
let client: TokenSource | null = null
async function authClient(): Promise<TokenSource> {
  const sa = process.env.GCP_SERVICE_ACCOUNT_EMAIL
  if (process.env.VERCEL && sa) {
    const pool = `projects/${env('GCP_PROJECT_NUMBER')}/locations/global/workloadIdentityPools/${env('GCP_WORKLOAD_IDENTITY_POOL_ID')}`
    return new IdentityPoolClient({
      audience: `//iam.googleapis.com/${pool}/providers/${env('GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID')}`,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${sa}:generateAccessToken`,
      subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
      scopes: SCOPES,
    })
  }
  return new GoogleAuth({ scopes: SCOPES }).getClient()
}
async function accessToken() {
  if (!client) client = await authClient()
  const token = await client.getAccessToken()
  if (!token.token) throw new Error('No access token')
  return token.token
}

// `global` has no regional host prefix.
const host = (location: string) =>
  location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`

async function vertex(location: string, path: string, body: unknown) {
  const res = await fetch(`https://${host(location)}/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Logged server-side only; visitors get a generic message.
    console.error(`[ask] ${path} → ${res.status}`, JSON.stringify(json).slice(0, 1000))
    throw new Error(`Vertex ${res.status}`)
  }
  return json
}

/* ---------- rate limit ---------- */

// In-memory, per instance: resets on cold start and isn't shared across
// instances. The Gemini quota in Cloud Console is the real ceiling.
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return false
}

/* ---------- retrieval ---------- */

type RawContext = { sourceUri?: string; sourceDisplayName?: string; text?: string; score?: number; distance?: number }

// File names are the citation: p{part}_{interview#}_{slug}.txt
function parseSource(uri: string) {
  const file = uri.split('/').pop() ?? uri
  const m = file.match(/^p(\d)_(\d{6})_([a-z0-9-]+)\.txt$/i)
  if (!m) return { part: null, interview: null, name: null }
  const name = m[3]
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
  return { part: m[1], interview: m[2], name }
}

// Only the first chunk of a file carries the metadata header. Read the
// interviewee's name from it when present, then strip it from the excerpt.
const HEADER = /^(Interviewee|Interview number|Source|County mentioned in intro):.*$/gim
function cleanChunk(text: string) {
  const name = text.match(/^Interviewee:\s*(.+)$/im)?.[1]?.trim() ?? null
  return { name, text: text.replace(HEADER, '').replace(/\n{3,}/g, '\n\n').trim() }
}

async function retrieve(question: string) {
  const project = env('GCP_PROJECT_ID')
  const location = env('GCP_LOCATION')
  const json = await vertex(location, `projects/${project}/locations/${location}:retrieveContexts`, {
    vertexRagStore: { ragResources: [{ ragCorpus: env('RAG_CORPUS') }] },
    query: { text: question, ragRetrievalConfig: { topK: TOP_K } },
  })
  const raw: RawContext[] = json?.contexts?.contexts ?? []

  // Results come back best-first, but the field is named `score` either way
  // and this corpus returns a distance (verified: the known-item answer had
  // the lowest value). Infer direction from the ordering; RAG_SCORE_KIND
  // overrides it.
  const override = process.env.RAG_SCORE_KIND
  const values = raw.map((c) => c.score ?? c.distance).filter((v): v is number => typeof v === 'number')
  const scoreKind: AskResponse['scoreKind'] =
    override === 'similarity' || override === 'distance'
      ? override
      : values.length > 1 && values[values.length - 1] > values[0]
        ? 'distance'
        : 'similarity'

  const passages: Passage[] = raw.slice(0, TOP_K).map((c, i) => {
    const src = parseSource(c.sourceUri ?? c.sourceDisplayName ?? '')
    const chunk = cleanChunk(c.text ?? '')
    const score = typeof c.score === 'number' ? c.score : typeof c.distance === 'number' ? c.distance : null
    return {
      n: i + 1,
      name: chunk.name ?? src.name ?? c.sourceDisplayName ?? 'Unknown narrator',
      interview: src.interview,
      part: src.part,
      link: src.part ? GUTENBERG[src.part] ?? null : null,
      score,
      text: chunk.text,
    }
  })
  return { passages, scoreKind }
}

/* ---------- generation ---------- */

const SYSTEM = `You answer questions about the Texas WPA Slave Narratives: interviews with formerly enslaved Texans recorded by the Federal Writers' Project in 1936–38.

Rules:
- Use ONLY the numbered passages provided. Do not use outside knowledge, even if you know the answer.
- Cite every claim with the passage number in square brackets and name the speaker, e.g. "Silvia King recalled … [2]".
- If the passages don't answer the question, say so plainly in one or two sentences. Do not guess.
- If the question rests on a false premise, say what the passages actually show instead.
- If passages conflict, report both accounts and cite each.
- Report individual accounts. Never generalize one person's experience to all enslaved people.
- Preserve speakers' wording when quoting, including dialect spelling. Do not "correct" it.
- These interviews were mostly conducted by white Southerners during Jim Crow, which shaped what people felt safe saying. Don't present a narrator's account of kind treatment as a general verdict.
- Plain prose, no headings or bullet lists. Keep it under 180 words.`

function prompt(question: string, passages: Passage[]) {
  const ctx = passages
    .map((p) => `[${p.n}] ${p.name}${p.interview ? ` (interview ${p.interview})` : ''}\n${p.text}`)
    .join('\n\n')
  return `Passages:\n\n${ctx}\n\nQuestion: ${question}`
}

async function generate(question: string, passages: Passage[]) {
  const project = env('GCP_PROJECT_ID')
  // Newer Gemini models are served only from the global endpoint, not from
  // the corpus's region.
  const location = process.env.GEMINI_LOCATION || 'global'
  const model = env('GEMINI_MODEL')
  const json = await vertex(location, `projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`, {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: prompt(question, passages) }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // Flash models think by default, and thinking tokens count against
      // maxOutputTokens. Answering from five given passages doesn't need it.
      thinkingConfig: { thinkingBudget: 0 },
    },
  })

  const cand = json?.candidates?.[0]
  const blocked =
    !!json?.promptFeedback?.blockReason || ['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII'].includes(cand?.finishReason)
  const text: string = (cand?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim()
  return { blocked: blocked || !text, text }
}

/* ---------- handler ---------- */

export async function POST(req: Request) {
  let question = ''
  try {
    const body = await req.json()
    question = typeof body?.question === 'string' ? body.question.trim() : ''
  } catch {}
  if (!question) return NextResponse.json({ error: 'Ask a question.' }, { status: 400 })
  if (question.length > MAX_QUESTION)
    return NextResponse.json({ error: `Keep questions under ${MAX_QUESTION} characters.` }, { status: 400 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local'
  if (limited(ip)) return NextResponse.json({ error: 'Demo limit reached.' }, { status: 429 })

  try {
    const { passages, scoreKind } = await retrieve(question)
    if (!passages.length) {
      return NextResponse.json<AskResponse>({ status: 'no_results', answer: null, scoreKind, passages: [] })
    }
    const gen = await generate(question, passages)
    if (gen.blocked) {
      return NextResponse.json<AskResponse>({
        status: 'blocked',
        answer: null,
        note:
          "The model's safety filter declined to answer. The source text contains period slurs, which sometimes trips it. The retrieved passages are shown on the left.",
        scoreKind,
        passages,
      })
    }
    return NextResponse.json<AskResponse>({ status: 'ok', answer: gen.text, scoreKind, passages })
  } catch (err) {
    console.error('[ask]', err)
    return NextResponse.json({ error: 'The archive is unreachable right now.' }, { status: 502 })
  }
}
