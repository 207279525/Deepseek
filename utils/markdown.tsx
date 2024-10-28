import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MathJax } from "better-react-mathjax"
import { CodeBlock } from '@/components/code-block'

export const renderMathInContent = (content: string) => {
  const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g)
  
  return parts.map((part, index) => {
    try {
      if (part.startsWith('$$') || part.startsWith('$')) {
        return <MathJax key={index}>{part}</MathJax>
      } else if (part.trim()) {
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const value = String(children).replace(/\n$/, '')
                
                if (!inline && match) {
                  return <CodeBlock language={match[1]} value={value} />
                }
                
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
              p: ({children}) => <p className="mb-2">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
              li: ({children}) => <li className="mb-1">{children}</li>,
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                  {children}
                </blockquote>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        )
      }
      return null
    } catch (error) {
      console.error('Math rendering error:', error, 'in part:', part)
      return <span key={index} className="text-red-500">Error rendering math: {part}</span>
    }
  }).filter(Boolean)
}
