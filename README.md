# Tyler Hooks Portfolio

A modern portfolio site built with Next.js 14, TypeScript, and CSS.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

The site is implemented from the Claude Design file `Tyler Hooks Portfolio.dc.html`.

```
tyler-hooks-portfolio/
├── app/
│   ├── site.css         # Design tokens, layout, hover states, breakpoints
│   ├── layout.tsx       # Archivo (variable wdth) + JetBrains Mono fonts
│   ├── icon.svg         # Favicon
│   └── page.tsx         # Renders <Site />
├── components/site/
│   ├── Site.tsx         # Client root; mounts the motion engine once
│   ├── motion.ts        # Loader, curtain routing (#guided-tasks, #about, …), reveals,
│   │                    # word scrub, scroller, magnets, scramble, Ask the Archive
│   ├── data.ts          # All copy: case studies, archive sample, timeline
│   ├── Chrome.tsx       # Texture, loader, header, counter rail
│   ├── HomeView.tsx / CaseView.tsx (project + case-study pages) / AboutView.tsx
│   ├── Contact.tsx
│   └── Media.tsx        # Image slot: renders `src` or a labeled placeholder
└── public/images/       # portrait.jpg (add project captures here)
```

## Customization

- **Content**: edit `components/site/data.ts`
- **Projects & case study**: fill in `WORK_PAGES` in `data.ts` (`kind` sets the "Project" /
  "Case study" label and nav highlight). Every `TBD` field renders as a visible `[TBD]`
  placeholder (search for `TODO: copy pending`). `links` adds links under a page's summary;
  the Texas WPA page links to the live demo on the home page.
- **Project images**: drop captures in `public/images/` and set `src` on the matching
  entry in `WORK_PAGES`
- **Colors & spacing**: CSS variables at the top of `app/site.css`
- **Motion knobs** (loader on/off, grain): `MOTION` in `components/site/Site.tsx`
- **Motion spec** (every effect's trigger, timing and curve): `MOTION-SPEC.md`

## Build for Production

```bash
npm run build
npm start
```
