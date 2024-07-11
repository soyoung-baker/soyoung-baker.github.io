import { readFile } from 'fs/promises'
import path from 'path'

export type Post = {
  title: string
  description: string
  date: Date
  category: string
  path: string
}

export async function getAllPosts(): Promise<Post[]> {
  const filePath = path.join(process.cwd(), 'data', 'posts.json')
  const text = await readFile(filePath, 'utf-8')
  const posts: Post[] = await JSON.parse(text)

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}
