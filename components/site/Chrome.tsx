import { NAV } from './data'

export function Texture() {
  return (
    <>
      <div className="grain" data-grain="" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="columns" aria-hidden="true" />
    </>
  )
}

export function Loader() {
  return (
    <div className="loader" data-loader="" aria-hidden="true">
      <div className="dots" />
      <div className="loader-inner">
        <div className="loader-lines">
          <div className="mask">
            <div className="loader-name" data-loader-line="">
              Tyler Hooks
            </div>
          </div>
          <div className="mask">
            <div className="loader-role" data-loader-line="">
              Senior Design Technologist
            </div>
          </div>
        </div>
        <div className="loader-foot">
          <span className="loader-status" data-loader-status="">
            Indexing archive
          </span>
          <span className="loader-count" data-loader-count="">
            000
          </span>
        </div>
        <div className="loader-track">
          <div className="loader-bar" data-loader-bar="" />
        </div>
      </div>
    </div>
  )
}

export function Header() {
  return (
    <>
      <div className="curtain" data-curtain="" aria-hidden="true" />
      <div className="progress" data-progress="" aria-hidden="true" />
      <header className="hdr" data-hdr="">
        <a className="brand" data-go="home" href="/">
          <span className="brand-dot" aria-hidden="true" />
          <span>Tyler Hooks</span>
        </a>
        {/* Phones only: motion.ts adds .has-menu, which collapses the nav behind this button. */}
        <button
          type="button"
          className="menu-btn"
          data-menu-toggle=""
          aria-expanded="false"
          aria-controls="site-nav"
        >
          <span data-menu-label="">Menu</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>
        <nav id="site-nav" data-nav="" aria-label="Primary">
          {NAV.map(({ label, view, section, matches }) => (
            <a
              key={view}
              data-magnet=""
              data-go={view}
              data-scroll-to={section}
              data-matches={matches?.join(' ')}
              href={section ? `/#${section}` : view === 'home' ? '/' : `/${view}`}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <div className="counter-rail" data-counter-rail="" aria-hidden="true">
        <span data-counter-label="">index</span>
        <span className="counter-rule" />
        <span className="counter-mask">
          <span className="counter-num" data-counter="">
            00
          </span>
        </span>
      </div>
    </>
  )
}
