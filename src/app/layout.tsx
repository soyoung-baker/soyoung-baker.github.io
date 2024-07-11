import { ReactNode } from 'react'

import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
