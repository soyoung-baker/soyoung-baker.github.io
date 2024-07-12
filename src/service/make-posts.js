import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import path from 'path'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

function collectMarkdownFiles(baseDir) {
  let results = []

  const list = readdirSync(baseDir)

  list.forEach((file) => {
    const filePath = path.join(baseDir, file)
    const stat = statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(collectMarkdownFiles(filePath))
    } else if (file.endsWith('.md')) {
      results.push(filePath)
    }
  })

  return results
}

function checkStartsWith(line) {
  const codes = ['#', '```', '<', '![', '/**', '*', 'const', 'function', 'return']

  return codes.every((code) => !line.startsWith(code))
}

async function removeMarkdownString(content) {
  const file = await remark().use(remarkGfm).process(content)

  const result = []
  const tree = file.toString()

  tree.split('\n').forEach((line) => {
    if (checkStartsWith(line) && line.trim()) {
      result.push(line)
    }
  })

  return result.join(' ').trim()
}

async function createPathObject(filePath) {
  const fileName = path.basename(filePath, '.md')
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const title = lines[0].startsWith('#') ? lines[0].slice(1).trim() : '🚧 제목 고민중... 🚧'
  const date = fileName.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '🗓️ 날짜 없음'
  const removedMarkdownCotent = await removeMarkdownString(lines.slice(1).join('\n'))
  const description = removedMarkdownCotent ? removedMarkdownCotent.slice(0, 1000).trim() : ''

  return { title, description, date, path: fileName }
}

async function makePostsJson() {
  const __dirname = path.resolve()
  const baseDir = path.join(__dirname, 'data/posts/blog')
  const mdFiles = collectMarkdownFiles(baseDir)

  const postsPomises = mdFiles.map(createPathObject)
  const posts = await Promise.all(postsPomises)
  writeFileSync('data/posts.json', JSON.stringify(posts, null, 2), 'utf-8')

  console.log('posts.json 파일이 생성되었습니다.')
}

makePostsJson()
