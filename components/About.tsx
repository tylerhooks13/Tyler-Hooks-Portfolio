'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function About() {
  const wrapperRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  // Panel starts invisible and fades in during the first ~12% of the section scroll,
  // so the opening view is just the giant letterforms with no content visible yet.
  const panelOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1])
  const panelY = useTransform(scrollYProgress, [0, 0.12], [20, 0])

  return (
    <section ref={wrapperRef} className="about-wrapper" id="about">
      {/*
        Zero-height sticky anchor: takes no layout space but sticks to the top
        of the viewport the entire time the section is on screen. The panel hangs
        off it via position:absolute, staying top-right while the title scrolls past.
      */}
      <div className="about-sticky-overlay">
        <motion.div
          className="about-panel"
          style={{ opacity: panelOpacity, y: panelY }}
        >
          <div className="about-tags">
            <span>TEXAS NATIVE</span>
            <span>DESIGN TECHNOLOGIST</span>
            <span>LEGO ENTHUSIAST</span>
          </div>

          <div className="about-bio-group">
            <p className="about-bio">
              I&apos;m a design technologist at HEB, leveraging my strong
              technical background to enhance user experiences. My expertise in
              developing and managing UI libraries has led to improved
              compatibility, accessibility, and efficiency across numerous
              projects. Collaborating closely with UX designers, I&apos;ve shaped
              responsive web architectures and transformed wireframes into
              high-fidelity prototypes.
            </p>
            <Link
              href="/resume.pdf"
              className="resume-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              RESUME
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Oversized title — each line is ~1 viewport tall, scrolls off naturally */}
      <h2 className="about-title">
        BEHIND
        <br />
        THE PIXELS
      </h2>
    </section>
  )
}
