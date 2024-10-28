import { FileText, Code, FileJson } from 'lucide-react'
import { CopyFormat } from '@/types/chat'

export const API_KEY = "sk-aaaa6d3edc0e44f08569b4619878defc"

export const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
  },
}

export const copyFormats: CopyFormat[] = [
  { type: 'text', label: '纯文本', icon: <FileText className="w-4 h-4" /> },
  { type: 'markdown', label: 'Markdown', icon: <Code className="w-4 h-4" /> },
  { type: 'html', label: 'HTML', icon: <FileJson className="w-4 h-4" /> },
]
