import { readFile } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

export type Post = {
  title: string
  description: string
  date: string
  category?: string
  path: string
}

export type PostData = Post & { content: string }

export async function getAllPosts(): Promise<Post[]> {
  const filePath = path.join(process.cwd(), 'data', 'posts.json')
  const text = await readFile(filePath, 'utf-8')
  const posts: Post[] = await JSON.parse(text)

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export async function getPostData(fileName: string): Promise<PostData> {
  const filePattern = path.join(process.cwd(), 'data', 'posts', 'blog', '**', `${fileName}.md`)
  const files = glob.sync(filePattern)

  if (files.length === 0) {
    throw new Error(`${fileName}에 해당하는 포스트를 찾을 수 없습니다.`)
  }

  const filePath = files[0]
  const metadata = await getAllPosts().then((posts) => posts.find((post) => post.path === fileName))

  if (!metadata) {
    throw new Error(`${fileName}에 해당하는 메타데이터를 찾을 수 없습니다.`)
  }

  const content = await readFile(filePath, 'utf-8')
  return { ...metadata, content }
}
