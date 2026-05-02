import type { Metadata } from 'next'
import { Cinzel, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-var',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-var',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-var',
})

export const metadata: Metadata = {
  title: 'Obliterate — Albion PvP Analytics',
  description: 'Build win rates, meta trends, and kill analytics for Albion Online PvP.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-bg-base text-text-primary min-h-screen flex antialiased">
        <QueryProvider>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <TopBar />
            <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-6">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
