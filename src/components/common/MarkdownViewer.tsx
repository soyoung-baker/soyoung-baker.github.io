import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { Nanum_Myeongjo } from 'next/font/google'

import { assetPrefixPath } from '@/utils/url'
import remarkGfm from 'remark-gfm'

const nanum = Nanum_Myeongjo({ subsets: ['latin'], weight: '700' })

type ImageProps = {
  src?: string
  alt?: string
}

function getImage({ src, alt }: ImageProps) {
  const imagePath = src ? src.replace('/public', '') : ''

  // TODO: next/image 로 변경해야함
  return (
    <img
      className="w-full h-auto object-cover"
      src={assetPrefixPath(imagePath)}
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
        a: (a) => (
          <a href={a.href} className={nanum.className}>
            {a.children}
          </a>
        ),
        code(props) {
          const { ref, children, className, node, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={oneDark}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              {...rest}
              className={`${className} ${'bg-zinc-100 p-1 rounded-md font-normal text-zinc-600 after:content-[""] before:content-[""]'}`}
            >
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
