import type { Metadata } from 'next'
import { Gochi_Hand } from 'next/font/google'
import './globals.css'

const gochiHand = Gochi_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gochi-hand',
})

export const metadata: Metadata = {
  title: 'Face Looker',
  description: 'An interactive face that follows your cursor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={gochiHand.variable}>
      <head>
        <link
          rel="preload"
          href="/background.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
