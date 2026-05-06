import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cretaceous Carnage',
  description: 'A gladiatorial dinosaur fighting game. 65 million years in the making.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
