import { CONTACT } from './data'

export default function Contact() {
  return (
    <footer id="contact" className="section contact" data-section="04" data-section-label="contact">
      <div className="eyebrow meta-row">
        <span>04 / Contact</span>
      </div>
      <h2 className="display d-contact" data-reveal="chars">
        Let&apos;s build
        <br />
        <span className="outline">something</span> real
      </h2>
      <div className="contact-grid ruled">
        <a className="mono-link self-end" data-magnet="" href={`mailto:${CONTACT.email}`}>
          Email
        </a>
        <a className="mono-link self-end" data-magnet="" href={CONTACT.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="mono-link self-end" data-magnet="" href={CONTACT.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <div className="eyebrow eyebrow-9 meta-row wrap colophon">
        <span>Tyler Hooks — Senior Design Technologist</span>
        <span>Austin, TX</span>
      </div>
    </footer>
  )
}
