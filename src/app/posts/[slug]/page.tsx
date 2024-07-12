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
    <article>
      <section>
        <time>{date.toString()}</time>
        <h1>{title}</h1>
        <div>{category}</div>
        <MarkdownViewer content={content} />
      </section>
    </article>
  )
}
