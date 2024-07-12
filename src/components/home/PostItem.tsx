import Link from 'next/link'

import { Post } from '@/service/posts'

type Props = {
  post: Post
}

export default function PostItem({ post: { title, description, date, path } }: Props) {
  return (
    <Link href={`/posts/${path}`}>
      <article>
        <h3 className="text-xl font-semibold">{title}</h3>
        <time className="mt-1 text-sm text-zinc-400">{date}</time>
        <p className="mt-4 line-clamp-3 text-zinc-700">{description}</p>
      </article>
    </Link>
  )
}
