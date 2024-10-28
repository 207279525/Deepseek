'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MathJax, MathJaxContext } from "better-react-mathjax"
import { Copy, Check, FileText, Code, FileJson, Send, Square, Moon, Sun, MessageSquarePlus, History, ArrowRight } from 'lucide-react'

const API_KEY = "sk-aaaa6d3edc0e44f08569b4619878defc"

const mathJaxConfig = {
  loader: { load: ["[tex]/ams", "[tex]/cases"] },
  tex: {
    packages: { "[+]": ["ams", "cases"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true,
    tags: "ams",
    macros: {
      // 添加常用的数学宏
      "\\R": "\\mathbb{R}",
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\matrix": "\\begin{matrix}",
      "\\endmatrix": "\\end{matrix}",
      "\\pmatrix": "\\begin{pmatrix}",
      "\\endpmatrix": "\\end{pmatrix}",
      "\\bmatrix": "\\begin{bmatrix}",
      "\\endbmatrix": "\\end{bmatrix}",
      "\\cases": "\\begin{cases}",
      "\\endcases": "\\end{cases}"
    }
  },
  options: {
    enableMenu: false,
    menuOptions: {
      settings: {
        zoom: "Click",
        zscale: "200%"
      }
    }
  }
};

const renderMathInContent = (content: string) => {
  const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$)/g);
  
  return parts.map((part, index) => {
    try {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // 处理块级公式
        const formula = part.slice(2, -2).trim();
        return (
          <div key={index} className="my-4 flex justify-center overflow-x-auto">
            <MathJax inline={false}>
              {formula}
            </MathJax>
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // 处理行内公式
        const formula = part.slice(1, -1).trim();
        return <MathJax inline={true}>{formula}</MathJax>;
      } else if (part.trim()) {
        // 处理普通文本
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}: {
                node?: any;
                inline?: boolean;
                className?: string;
                children: React.ReactNode;
                [key: string]: any;
              } & React.HTMLAttributes<HTMLElement>) {  // 添加 HTMLAttributes
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
              blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">{children}</blockquote>,
            }}
          >
            {part}
          </ReactMarkdown>
        );
      }
      return null;
    } catch (error) {
      console.error('Math rendering error:', error, 'in part:', part);
      return (
        <span key={index} className="text-red-500">
          Error rendering math: {part}
        </span>
      );
    }
  }).filter(Boolean);
};

interface CopyFormat {
  type: 'text' | 'markdown' | 'html';
  label: string;
  icon: React.ReactNode;
}

const copyFormats: CopyFormat[] = [
  { type: 'text', label: '纯文本', icon: <FileText className="w-4 h-4" /> },
  { type: 'markdown', label: 'Markdown', icon: <Code className="w-4 h-4" /> },
  { type: 'html', label: 'HTML', icon: <FileJson className="w-4 h-4" /> },
]

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-md bg-gray-700/50 hover:bg-gray-700/70 dark:bg-gray-600/50 dark:hover:bg-gray-600/70 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
        title="复制代码"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          marginTop: 0,
          marginBottom: 0,
          paddingRight: '3rem' // 为复制按钮留出空间
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// 添加对话历史类型定义
interface ChatHistory {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  timestamp: number;
}

export function SimpleChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [autoScroll, setAutoScroll] = useState(true)
  const [controller, setController] = useState<AbortController | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll]) // 添加 autoScroll 到依赖数组

  // 监听滚动事件
  useEffect(() => {
    const content = document.querySelector('.chat-content')
    if (!content) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = content
      // 如果用户向上滚动超过100px，则禁用自动滚动
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setAutoScroll(isAtBottom)
    }

    content.addEventListener('scroll', handleScroll)
    return () => content.removeEventListener('scroll', handleScroll)
  }, [])

  const formatContent = (content: string, format: 'text' | 'markdown' | 'html') => {
    switch (format) {
      case 'text':
        return content.replace(/\$\$(?:[\s\S]*?)\$\$|\$(?:[^$\n]*?)\$/g, '').trim()
      case 'markdown':
        return content
      case 'html':
        // 简单的HTML转换，实际使用时可能需要更复杂的转换逻辑
        return content.split('\n').map(line => `<p>${line}</p>`).join('')
      default:
        return content
    }
  }

  const handleCopy = async (message: { role: string; content: string }, format: 'text' | 'markdown' | 'html') => {
    const formattedContent = formatContent(message.content, format)
    try {
      await navigator.clipboard.writeText(formattedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleStop = () => {
    if (controller) {
      controller.abort();
      // 立即更新状态
      setIsLoading(false);
      setController(null);
      // 立即更新最后一条消息
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content += '\n[回复已中断]';
        }
        return newMessages;
      });
    }
  };

  const handleSend = async () => {
    // 如果正在加载且点击了停止按钮，立即中断
    if (isLoading && controller) {
      handleStop();
      return;
    }

    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInput('')
    setIsLoading(true)

    // 创建新的 AbortController
    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'priority': 'high'  // 添加高优先级标记
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [...messages, userMessage],
          stream: true,
        }),
        signal: newController.signal
      });

      if (!response.ok) {
        throw new Error('网络响应不正常')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }])

      if (reader) {
        try {
          while (true) {
            // 在每次循环开始时立即检查是否被中断
            if (newController.signal.aborted) {
              setMessages(prevMessages => {
                const newMessages = [...prevMessages]
                const lastMessage = newMessages[newMessages.length - 1]
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = aiResponse + '\n[回复已中断]'
                }
                return newMessages
              })
              break;
            }

            const { done, value } = await reader.read()
            if (done) break

            // 在处理每个数据块之前再次检查是��被中断
            if (newController.signal.aborted) break;

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            const parsedLines = lines
              .map(line => line.replace(/^data: /, '').trim())
              .filter(line => line !== '' && line !== '[DONE]')
              .map(line => JSON.parse(line))

            for (const parsedLine of parsedLines) {
              // 在处理每一行数据之前检查是否被中断
              if (newController.signal.aborted) break;
              
              const { choices } = parsedLine
              const { delta } = choices[0]
              const { content } = delta
              if (content) {
                aiResponse += content
                // 使用函数式更新确保状态更新的原子性
                setMessages(prevMessages => {
                  if (newController.signal.aborted) {
                    return prevMessages;
                  }
                  const newMessages = [...prevMessages]
                  newMessages[newMessages.length - 1].content = aiResponse
                  return newMessages
                })
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('响应已中断');
      } else {
        console.error('错误:', error)
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '抱歉，发生了错误。请重试。' }])
      }
    } finally {
      setIsLoading(false)
      setController(null)
    }
  }

  // 添加主题切换函数
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
    // 可选：保存主题偏好到 localStorage
    localStorage.setItem('theme', newTheme)
  }

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取主题偏好
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    // 或者检查系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // 保存当前对话
  const saveCurrentChat = () => {
    if (messages.length > 0) {
      const title = messages[0].content.slice(0, 50) + '...'
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title,
        messages: [...messages],
        timestamp: Date.now()
      }
      setChatHistory(prev => [newChat, ...prev])
      // 保存到 localStorage
      localStorage.setItem('chatHistory', JSON.stringify([newChat, ...chatHistory]))
    }
  }

  // 开始新对话
  const startNewChat = async () => {
    if (messages.length > 0) {
      await saveCurrentChat()
    }
    
    // 如果有历史对话，生成建议
    if (chatHistory.length > 0) {
      const lastChat = chatHistory[0]
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: 'system',
                content: '基于上一次对话的内容，生成3个可能的新对话方向或问题建议。请简短直接地列出这些建议。'
              },
              ...lastChat.messages
            ]
          })
        })

        const data = await response.json()
        if (data.choices && data.choices[0]) {
          const suggestionsText = data.choices[0].message.content
          const parsedSuggestions = suggestionsText
            .split('\n')
            .filter((s: string) => s.trim()) // 添加类型注解
            .slice(0, 3)
          setSuggestions(parsedSuggestions)
        }
      } catch (error) {
        console.error('获取建议失败:', error)
      }
    }

    setMessages([])
    setInput('')
  }

  // 加��历史对话
  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages)
    setShowHistory(false)
  }

  // 初始化时从 localStorage 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory))
    }
  }, [])

  return (
    <MathJaxContext config={mathJaxConfig}>
      <Card className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col">
        <CardHeader className="flex flex-col space-y-2">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle>DeepSeek Chat</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                className="w-8 h-8"
                title="历史记录"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={startNewChat}
                className="w-8 h-8"
                title="新对话"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-8 h-8"
                title={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-end space-x-1">
            <span>Created by</span>
            <a 
              href="mailto:xuyangz315@gmail.com"
              className="hover:underline hover:text-primary transition-colors"
              title="联系作者"
            >
              xuyangz315@gmail.com
            </a>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto chat-content relative">
          {showHistory ? (
            <div className="space-y-2 p-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <p className="text-sm font-medium">{chat.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(chat.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {suggestions.length > 0 && messages.length === 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">建议的对话方向：</p>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900 ml-auto text-right' 
                      : 'bg-gray-100 dark:bg-gray-800 mr-auto'
                  } max-w-[80%] group relative transition-colors`}>
                    <p className="font-bold mb-2 dark:text-gray-200">{message.role === 'user' ? '您' : 'DeepSeek'}:</p>
                    <div className={message.role === 'user' ? 'text-right' : 'text-left'}>
                      {message.role === 'user' ? (
                        <div className="dark:text-gray-300">{message.content}</div>
                      ) : (
                        <div className="markdown-content dark:text-gray-300">
                          {renderMathInContent(message.content)}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              {copyFormats.map((format) => (
                                <Button
                                  key={format.type}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 dark:hover:bg-gray-700"
                                  onClick={() => handleCopy(message, format.type)}
                                  title={`复制为${format.label}`}
                                >
                                  {copied ? <Check className="h-4 w-4" /> : format.icon}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && <div className="text-center dark:text-gray-300">DeepSeek 正在思考...</div>}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t dark:border-gray-700">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full space-x-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="在这里输入您的消息..." 
              className="dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <Button 
              type="submit" 
              className="dark:hover:bg-gray-700 min-w-[80px]"
              variant={isLoading ? "destructive" : "default"}
            >
              {isLoading ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  停止
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  发送
                </>
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </MathJaxContext>
  )
}
