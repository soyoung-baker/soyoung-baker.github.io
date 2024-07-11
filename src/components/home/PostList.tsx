import { getAllPosts } from '@/service/posts'

import PostItem from './PostItem'

export default async function PostList() {
  const posts = await getAllPosts()

  return (
    <section className="pt-16 pb-20">
      <h2 className="font-extrabold text-2xl">POST</h2>
      <ul className="flex flex-col gap-10 mt-6">
        {posts.map((post) => (
          <li key={post.path}>{<PostItem post={post} />}</li>
        ))}
      </ul>
    </section>
  )
}
