import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import Image from 'next/image'

import remarkGfm from 'remark-gfm'

type ImageProps = {
  src?: string
  alt?: string
}

function getImage({ src, alt }: ImageProps) {
  const imagePath = src ? src.replace('/public', '') : ''

  return (
    <Image
      className="w-full max-h-60 object-cover"
      src={imagePath}
      alt={alt || ''}
      width={1440}
      height={1200}
      sizes="(max-width: 768px) 1440px, 2304px"
    />
  )
}

type Props = {
  content: string
}

export default function MarkdownViewer({ content }: Props) {
  return (
    <ReactMarkdown
      className="prose lg:prose-lg max-w-none"
      rehypePlugins={[remarkGfm]}
      components={{
        img: getImage,
        code(props) {
          const { ref, children, className, node, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={oneDark}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
