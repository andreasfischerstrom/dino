import type { Metadata } from 'next'
import { Cinzel, Cinzel_Decorative, Crimson_Pro } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cinzelDeco = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-deco',
  display: 'swap',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jurassic Brawl',
  description: 'A gladiatorial dinosaur fighting game. 65 million years in the making.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${cinzel.variable} ${cinzelDeco.variable} ${crimson.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
