import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Site from '@/components/site/Site'
import { VIEWS, WORK_PAGES } from '@/components/site/data'

// Every page lives at its own path (/guided-tasks, /about). It's the same
// single-page site as the home route; motion.ts reads the path and opens
// that view. Anything else 404s.
export const dynamicParams = false

export function generateStaticParams() {
  return VIEWS.filter((v) => v !== 'home').map((view) => ({ view }))
}

export function generateMetadata({ params }: { params: { view: string } }): Metadata {
  const page = WORK_PAGES.find((p) => p.id === params.view)
  const name = page ? page.title : params.view === 'about' ? 'About' : null
  return name ? { title: `${name} — Tyler Hooks` } : {}
}

export default function ViewPage({ params }: { params: { view: string } }) {
  if (!(VIEWS as string[]).includes(params.view) || params.view === 'home') notFound()
  return <Site />
}
