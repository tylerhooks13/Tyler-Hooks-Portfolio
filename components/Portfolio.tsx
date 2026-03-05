'use client'

import { useEffect, useRef } from 'react'

const projects = [
  {
    name: 'DICTIONARY APP',
    description: 'A dictionary app reimagined.',
  },
  {
    name: 'REMEDY',
    description:
      'A wellness platform rooted in the principles of community and equity.',
  },
  {
    name: 'REMEDY',
    description:
      'A wellness platform rooted in the principles of community and equity.',
  },
  {
    name: 'FEATHER NEST',
    description:
      'A rent-native finance platform designed specifically for renters.',
  },
]

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="portfolio fade-in" id="portfolio" ref={sectionRef}>
      <div className="portfolio-header">
        <span className="portfolio-label">
          A COLLECTION OF
          <br />
          WORK I&apos;M MOST
          <br />
          PROUD OF
        </span>
        <h2 className="portfolio-title">PORTFOLIO</h2>
      </div>
      <div className="projects">
        {projects.map((project, index) => (
          <article className="project" key={index}>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-desc">{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
