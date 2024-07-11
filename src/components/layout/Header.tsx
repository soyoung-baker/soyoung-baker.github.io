import { Sigmar_One } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

import IconGitHub from '@/assets/svgs/ic_github_24.svg'
import IconLinkedIn from '@/assets/svgs/ic_linkedin_24.svg'

const sigmar = Sigmar_One({ subsets: ['latin'], weight: '400' })

export default function Header() {
  return (
    <header className="relative flex justify-center items-center p-8">
      <Link href="/" className="flex flex-col items-center text-5xl">
        <h1 className={sigmar.className}>Better code coffee</h1>
        <p className="text-base mt-3">
          A blog by someone who strives for and enjoys writing better code and loves coffee
        </p>
      </Link>
      <div className="absolute top-11 right-8 flex items-center gap-3">
        <a href="https://github.com/soyoung-baker">
          <Image src={IconGitHub} alt="GitHub logo" />
        </a>
        <a href="https://www.linkedin.com/in/soyoung-jung-baker">
          <Image src={IconLinkedIn} alt="LinkedIn logo" />
        </a>
      </div>
    </header>
  )
}
