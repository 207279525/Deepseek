declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/esm/styles/prism';
declare module 'better-react-mathjax' {
  interface MathJaxProps {
    children: React.ReactNode;
    inline?: boolean;
    className?: string;
  }

  interface MathJaxContextProps {
    config?: any;
    children: React.ReactNode;
  }

  export const MathJax: React.FC<MathJaxProps>;
  export const MathJaxContext: React.FC<MathJaxContextProps>;
}
