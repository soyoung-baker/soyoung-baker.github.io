import Image from 'next/image'

import MarkdownViewer from '@/components/common/MarkdownViewer'
import { getPostData } from '@/service/posts'

import image from '../../../../data/posts/blog/2024/2024-01/syntax-error.png'

type Props = {
  params: {
    slug: string
  }
}

export default async function PostPage({ params: { slug } }: Props) {
  const { title, content, date, category } = await getPostData(slug)

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
