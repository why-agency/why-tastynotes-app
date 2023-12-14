import './globals.css'

import localFont from 'next/font/local'

import Logo from './logo'

const primaryFont = localFont({
  src: './fonts/ABCDiatype-Regular-Trial.otf',
  display: 'swap',
  variable: '--font-primary'
})

const secondaryFont = localFont({
  src: './fonts/ClearfaceStd-Regular.ttf',
  display: 'swap',
  variable: '--font-secondary'
})

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${primaryFont.variable} ${secondaryFont.variable}`}>
      <body>
        <main className="min-h-screen flex flex-col items-center bg-background-earthy-grape antialiased">
          {children}
        </main>
      </body>
    </html>
  )
}
