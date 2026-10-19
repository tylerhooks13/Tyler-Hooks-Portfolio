// Runs each Ask the Archive chip question through /api/ask once and saves the
// response to public/demo-answers/<slug>.json, so chip clicks are instant,
// free, and can't fail. Start `npm run dev` first, then:
//   node scripts/precompute-demo-answers.mjs [baseUrl]
import { readFile, writeFile } from 'node:fs/promises'

const base = process.argv[2] ?? 'http://localhost:3000'
const presets = JSON.parse(await readFile(new URL('../components/site/archive-presets.json', import.meta.url)))

for (const { slug, question } of presets) {
  const res = await fetch(`${base}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const json = await res.json()
  if (!res.ok) {
    console.error(`✗ ${slug}: ${res.status} ${json.error ?? ''}`)
    continue
  }
  const out = new URL(`../public/demo-answers/${slug}.json`, import.meta.url)
  await writeFile(out, JSON.stringify({ question, ...json }, null, 2) + '\n')
  const who = json.passages.map((p) => `${p.name} (${p.score?.toFixed(3) ?? '—'})`).join(', ')
  console.log(`✓ ${slug} [${json.status}, ${json.scoreKind}]\n  ${who}\n  ${(json.answer ?? json.note ?? '').slice(0, 200)}…\n`)
}
console.log('Read each answer above before committing: the chips are what most visitors see.')
