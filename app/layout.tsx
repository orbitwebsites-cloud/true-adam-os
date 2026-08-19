import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TRUE ADAM • Core OS',
  description: 'Advanced AI Operating System',
  icons: {
    icon: '⚡',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-slate-950 text-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
