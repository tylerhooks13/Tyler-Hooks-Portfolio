'use client'

import { useRef, useState } from 'react'
import { haptic } from './haptics'
import {
  IB_DEFAULT,
  IB_GUIDES,
  IB_ROLES,
  IB_TIMELINES,
  IB_TOOLS,
  buildMd,
  slugify,
  type IbForm,
} from './enablement-data'

/*
 * AI Enablement case study, Fig. 1: a working Instruction Builder, placed in
 * "What I built" after the copy that describes it. A short form on the left; on the right, the markdown file it hands back, rebuilt on every edit.
 * Lines that changed with the last edit flash briefly so the cause and effect
 * is visible. Panes stack on narrow screens, form first.
 */

export default function InstructionBuilder() {
  const [form, setForm] = useState<IbForm>(IB_DEFAULT)
  // Lines added by the last edit, and an edit counter so a repeat edit replays the flash.
  const [fresh, setFresh] = useState<{ lines: Set<string>; n: number }>({ lines: new Set(), n: 0 })
  const [copied, setCopied] = useState<string | null>(null)
  const out = useRef<HTMLPreElement>(null)
  const copyTimer = useRef<number>()

  const md = buildMd(form)

  const update = (patch: Partial<IbForm>) => {
    const next = { ...form, ...patch }
    const before = new Set(md.split('\n'))
    const added = buildMd(next)
      .split('\n')
      .filter((l) => l && !before.has(l))
    setForm(next)
    setFresh((f) => ({ lines: new Set(added), n: f.n + 1 }))
  }

  const toggle = (key: 'tools' | 'guides', value: string, on: boolean) => {
    haptic('tap')
    // Keep the form's order no matter the click order.
    const order = (key === 'tools' ? IB_TOOLS : IB_GUIDES).map((o) => o.value as string)
    const set = new Set(form[key])
    if (on) set.add(value)
    else set.delete(value)
    update({ [key]: order.filter((v) => set.has(v)) })
  }

  const flash = (text: string) => {
    setCopied(text)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(null), 1400)
  }
  const selectOut = () => {
    const el = out.current
    const sel = window.getSelection()
    if (!el || !sel) return
    const r = document.createRange()
    r.selectNodeContents(el)
    sel.removeAllRanges()
    sel.addRange(r)
    flash('Selected')
  }
  const copy = () => {
    haptic('tap')
    try {
      navigator.clipboard.writeText(md).then(() => flash('Copied'), selectOut)
    } catch {
      selectOut()
    }
  }

  const fname = slugify(form.name) + '.md'

  return (
    <figure className="enf-fig" aria-labelledby="enf-ib-title">
      <div className="wpf enf">
        <div className="wpf-head">
          <span className="wpf-label">Fig. 1 · Instruction Builder</span>
        </div>
        <h3 className="display wpf-title" id="enf-ib-title">
          Context in, a skill-ready file out
        </h3>

        <div className="enf-ib">
          <form className="enf-ib-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className="enf-field">
              <label htmlFor="enf-ib-name">Project</label>
              <input
                id="enf-ib-name"
                type="text"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div className="enf-field">
              <label htmlFor="enf-ib-role">Work through the lens of</label>
              <select id="enf-ib-role" value={form.role} onChange={(e) => update({ role: e.target.value })}>
                {IB_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="enf-field">
              <label htmlFor="enf-ib-goal">Goal</label>
              <textarea
                id="enf-ib-goal"
                rows={3}
                value={form.goal}
                onChange={(e) => update({ goal: e.target.value })}
              />
            </div>
            <fieldset className="enf-field">
              <legend>Tools</legend>
              <div className="enf-chips">
                {IB_TOOLS.map((t) => (
                  <label key={t.value} className="enf-chip">
                    <input
                      type="checkbox"
                      checked={form.tools.includes(t.value)}
                      onChange={(e) => toggle('tools', t.value, e.target.checked)}
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="enf-field">
              <label htmlFor="enf-ib-time">Timeline</label>
              <select id="enf-ib-time" value={form.timeline} onChange={(e) => update({ timeline: e.target.value })}>
                {IB_TIMELINES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <fieldset className="enf-field">
              <legend>Include guidance</legend>
              <div className="enf-chips">
                {IB_GUIDES.map((g) => (
                  <label key={g.value} className="enf-chip">
                    <input
                      type="checkbox"
                      checked={form.guides.includes(g.value)}
                      onChange={(e) => toggle('guides', g.value, e.target.checked)}
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>

          <div className="enf-ib-out">
            <div className="enf-ib-bar">
              <span className="enf-ib-fname">{fname}</span>
              <button type="button" className="enf-btn" onClick={copy}>
                {copied ?? 'Copy'}
              </button>
            </div>
            <pre ref={out} className="enf-md" tabIndex={0} aria-label={`Generated file, ${fname}`}>
              {md.split('\n').map((l, i) => {
                const cls = [l.startsWith('#') ? 'enf-md-h' : '', fresh.lines.has(l) ? 'is-new' : '']
                  .filter(Boolean)
                  .join(' ')
                return (
                  <span key={fresh.lines.has(l) ? `${i}-${fresh.n}` : i} className={cls || undefined}>
                    {l + '\n'}
                  </span>
                )
              })}
            </pre>
            {/* Announces what an edit added, not the whole file on every keystroke. */}
            <p className="sr-only" aria-live="polite">
              {fresh.lines.size ? `Added to ${fname}: ${Array.from(fresh.lines).join('. ')}` : ''}
            </p>
          </div>
        </div>
      </div>
      <figcaption className="enf-caption">
        Designers filled in a form about their project and got back a structured markdown file they could attach to a
        project or turn into a skill. Example values shown.
      </figcaption>
    </figure>
  )
}
