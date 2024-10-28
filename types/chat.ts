export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopyFormat {
  type: 'text' | 'markdown' | 'html';
  label: string;
  icon: React.ReactNode;
}

export interface CodeBlockProps {
  language: string;
  value: string;
}
