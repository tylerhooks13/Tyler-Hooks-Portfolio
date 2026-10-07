import Media from './Media'
import { CONTACT, PORTRAIT, SKILLS, TIMELINE } from './data'

export default function AboutView() {
  return (
    <div className="view" data-view="about" hidden>
      <section className="section about" data-section="00" data-section-label="about">
        <div className="eyebrow meta-row wrap">
          <span>About</span>
          <span>Austin, TX</span>
        </div>
        <h1 className="display d-about-hero" data-reveal="chars" data-hero="">
          Seven years
          <br />
          between the mockup
          <br />
          and the <span className="outline">merge</span>
        </h1>

        <div className="about-grid ruled">
          <div className="frame portrait-lg">
            <Media id="th-portrait-b" src={PORTRAIT} alt="Portrait of Tyler Hooks" placeholder="Portrait" priority />
          </div>
          <div className="about-copy">
            <p className="lede lede-20" data-scrub="">
              I started as a software engineer at Dell, building a UI component library used across hundreds of IT
              Services projects. At Disney, I moved into UX engineering, building prototypes, a component library, and a
              metrics dashboard for the CTO. At H-E-B, I started as a Design Technologist II and now work as a senior
              design technologist on a lean, agile team that explores emerging technologies and turns them into tools,
              prototypes, and new ways of working.
            </p>
            <p className="lede lede-20" data-scrub="">
              That background shapes how I work: I make practical trade-offs between fidelity, speed, and learning, and I
              care about turning ambiguous ideas into something people can test and react to.
            </p>
            <a
              className="mono-link about-resume"
              data-magnet=""
              data-scramble=""
              href={CONTACT.resume}
              target="_blank"
              rel="noreferrer"
            >
              Resume ↗
            </a>
          </div>
        </div>
      </section>

      <section className="section timeline" data-section="01" data-section-label="timeline">
        <ol className="tl">
          {TIMELINE.map((t) => (
            <li key={t.org} className="tl-row" data-tl="">
              <span className="tl-when">{t.when}</span>
              <span className="tl-org">
                {t.org}
                <br />
                <span className="tl-role">{t.role}</span>
              </span>
              <span className="tl-detail">{t.detail}</span>
            </li>
          ))}
        </ol>

        <div className="skills ruled">
          {SKILLS.map((s) => (
            <div key={s.tier} className="kv kv-10">
              <span className="eyebrow eyebrow-tight">{s.tier}</span>
              <span className="kv-body kv-loose">{s.items}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
