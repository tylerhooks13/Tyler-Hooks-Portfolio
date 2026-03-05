'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Footer() {
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
    <section className="footer fade-in" ref={sectionRef}>
      <div className="footer-content">
        <div>
          <h2 className="footer-title">
            THANKS FOR
            <br />
            STOPPING BY
          </h2>
          <div className="social-links">
            <Link href="#" aria-label="LinkedIn">
              in
            </Link>
            <Link href="#" aria-label="Twitter">
              𝕏
            </Link>
            <Link href="#" aria-label="Dribbble">
              ◉
            </Link>
          </div>
        </div>
        <div className="footer-image"></div>
      </div>
    </section>
  )
}
