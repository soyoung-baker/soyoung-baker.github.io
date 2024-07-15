import { Metadata } from 'next'

import MarkdownViewer from '@/components/common/MarkdownViewer'
import { getPostData } from '@/service/posts'
import { readdirSync } from 'fs'
import path from 'path'

type Props = {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const blogDirectory = path.join(process.cwd(), 'data', 'posts', 'blog')
  const years = readdirSync(blogDirectory)

  let paths: { slug: string }[] = []

  for (const year of years) {
    const monthsDirectory = path.join(blogDirectory, year)
    const months = readdirSync(monthsDirectory)

    for (const month of months) {
      const postsDirectory = path.join(monthsDirectory, month)
      const filenames = readdirSync(postsDirectory)

      filenames.forEach((filename) => {
        paths.push({
          slug: `${filename.replace(/\.md$/, '')}`,
        })
      })
    }
  }

  return paths
}

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const { title } = await getPostData(slug)

  return {
    title,
    description: `${title}에 관한 공부한 내용을 적은 포스트입니다.`,
  }
}

export default async function PostPage({ params: { slug } }: Props) {
  const { content, date, category } = await getPostData(slug)

  return (
    <article className="mt-16">
      <time className="text-zinc-400">{date.toString()}</time>
      {category && <div>{category}</div>}
      <section className="mt-4 pb-20">
        <MarkdownViewer content={content} />
      </section>
    </article>
  )
}
