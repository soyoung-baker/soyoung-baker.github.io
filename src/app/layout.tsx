import { ReactNode } from 'react'

import { Inter } from 'next/font/google'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="flex flex-col w-full max-w-screen-lg mx-auto">
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
