import ReactMarkdown from 'react-markdown'

import remarkGfm from 'remark-gfm'

type Props = {
  content: string
}

export default function MarkdownViewer({ content }: Props) {
  return (
    <ReactMarkdown className="prose lg:prose-lg" rehypePlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  )
}
