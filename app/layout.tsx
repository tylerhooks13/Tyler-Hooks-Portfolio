import type { Metadata, Viewport } from 'next'
import { Archivo, Courier_Prime, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './site.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

// Typewriter face for the WPA card art, echoing the original transcripts.
const courierPrime = Courier_Prime({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-typewriter',
})

export const metadata: Metadata = {
  title: 'Tyler Hooks — Senior Design Technologist',
  description:
    'Tyler Hooks, senior design technologist at H-E-B in Austin, TX. Prototypes that become products, AI enablement, and rapid iterative testing — previously Disney and Dell.',
}

export const viewport: Viewport = {
  themeColor: '#F3F2EF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable} ${courierPrime.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
