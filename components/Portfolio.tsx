'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

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
  const wrapperRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  // Label fades in as user scrolls — opacity driven by scroll progress.
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1])

  return (
    <>
      <motion.div
        className="about-divider"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
      <section ref={wrapperRef} className="portfolio-wrapper" id="portfolio">
        <div className="portfolio-sticky">
          <h2 className="portfolio-title">PORTFOLIO</h2>

          <motion.div className="portfolio-content" style={{ opacity: contentOpacity }}>
            <span className="portfolio-label">
              A COLLECTION OF
              <br />
              WORK I&apos;M MOST
              <br />
              PROUD OF
            </span>
          </motion.div>
        </div>
      </section>
    </>
  )
}
