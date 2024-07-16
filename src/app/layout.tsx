import { ReactNode } from 'react'

import { Inter } from 'next/font/google'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { GA_TRACKING_ID } from '@/utils/env'
import { GoogleAnalytics } from '@next/third-parties/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Better code coffee 블로그',
    template: '%s | Better code coffee 블로그',
  },
  description: '더 좋은 코드를 위해 고민하거나 공부했던 내용을 올리는 블로그입니다.',
  icons: {
    icon: '/images/icons/favicons/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="flex flex-col w-full max-w-screen-lg mx-auto">
        <Header />
        <main className="grow max-lg:px-3">{children}</main>
        <Footer />
      </body>
      <GoogleAnalytics gaId={GA_TRACKING_ID as string} />
    </html>
  )
}
