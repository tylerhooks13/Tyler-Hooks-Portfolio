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

```
tyler-hooks-portfolio/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Home page
├── components/
│   ├── Navigation.tsx   # Fixed navigation
│   ├── Hero.tsx         # Hero section
│   ├── About.tsx        # About/Behind the Pixels section
│   ├── Portfolio.tsx    # Portfolio projects section
│   ├── Footer.tsx       # Footer with social links
│   └── index.ts         # Barrel exports
├── public/              # Static assets
├── next.config.js
├── package.json
└── tsconfig.json
```

## Customization

- **Colors**: Edit CSS variables in `app/globals.css`
- **Fonts**: Modify font imports in `app/layout.tsx`
- **Projects**: Update the `projects` array in `components/Portfolio.tsx`
- **Content**: Edit text in individual components

## Build for Production

```bash
npm run build
npm start
```
