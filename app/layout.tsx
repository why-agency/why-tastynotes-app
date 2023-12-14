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
  title: 'A tasting room for your wine notes',
  description: 'Create tasting notes collaboratively with your friends'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable}`}
    >
      <body>
        <main className="min-h-screen flex flex-col items-center bg-background-earthy-grape antialiased">
          {children}
        </main>
      </body>
    </html>
  )
}
