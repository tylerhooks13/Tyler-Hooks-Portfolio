import type { Metadata } from 'next'
import { Bebas_Neue, Oswald } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const oswald = Oswald({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-oswald',
})

export const metadata: Metadata = {
  title: 'Tyler Hooks — Design Technologist',
  description: 'Portfolio of Tyler Hooks, Design Technologist based in Texas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${oswald.variable}`}>
      <body>{children}</body>
    </html>
  )
}
