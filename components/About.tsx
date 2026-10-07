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

  // Scroll-driven camera pan: title drifts left while panel slides in from off-screen right.
  // No opacity changes — purely spatial (translateX only), fully reversible.
  const titleX = useTransform(scrollYProgress, [0, 1], ['-8vw', '-50vw'])
  const panelX = useTransform(scrollYProgress, [0, 1], ['60vw', '0vw'])

  return (
    <section ref={wrapperRef} className="about-wrapper" id="about">
      {/*
        Full-height sticky container — clips both the title and panel so the
        overflow:hidden acts as the "viewport frame" for the camera pan.
      */}
      <div className="about-sticky">
        <motion.h2 className="about-title" style={{ x: titleX }}>
          BEHIND
          <br />
          THE PIXELS
        </motion.h2>

        <motion.div className="about-panel" style={{ x: panelX }}>
          <div className="about-tags">
            <span>TEXAS NATIVE</span>
            <span>DESIGN TECHNOLOGIST</span>
            <span>LEGO ENTHUSIAST</span>
          </div>

          <div className="about-bio-group">
            <p className="about-bio">
           I'm a Design Technologist at H-E-B, leveraging my strong technical background to enhance user experiences. My expertise in developing and managing UI libraries has led to improved compatibility, accessibility, and efficiency across numerous projects. Collaborating closely with UX designers, I've shaped responsive web architectures and transformed wireframes into high-fidelity prototypes. As a mentor and subcommittee member of an IT Development Program, I've guided passionate teams, while my proficiency in modern tech stacks like JavaScript, ReactJS, and AWS enables me to tackle challenges and optimize performance. My track record includes constructing insightful applications, producing web pages on cutting-edge stacks, and creating reusable component libraries. I'm dedicated to pushing boundaries and crafting seamless, impactful designs.
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
    </section>
  )
}
