import type { Metadata } from 'next'
import { Cinzel, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { FreshnessBar } from '@/components/layout/FreshnessBar'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Albion PvP Analytics',
  description: 'Build win rates, meta trends, and kill analytics for Albion Online PvP.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-bg-base text-text-primary min-h-screen flex flex-col antialiased">
        <QueryProvider>
          <header className="flex items-center justify-between px-6 py-3 bg-bg-surface border-b border-border-subtle flex-shrink-0">
            <a
              href="/"
              className="font-display text-[16px] font-semibold tracking-widest text-gold-text uppercase"
            >
              Albion Analytics
            </a>
            <nav className="flex items-center gap-6 text-[13px] text-text-secondary">
              <a href="/" className="hover:text-text-primary transition-colors">
                Kill Feed
              </a>
              <a href="/builds" className="hover:text-text-primary transition-colors">
                Builds
              </a>
              <a href="/meta" className="hover:text-text-primary transition-colors">
                Meta
              </a>
            </nav>
          </header>
          <FreshnessBar />
          <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  )
}
