import MarkdownViewer from '@/components/common/MarkdownViewer'
import { getPostData } from '@/service/posts'

type Props = {
  params: {
    slug: string
  }
}

export default async function PostPage({ params: { slug } }: Props) {
  const post = await getPostData(slug)

  return (
    <div>
      <h1>{post.title}</h1>
      <MarkdownViewer content={post.content} />
    </div>
  )
}
