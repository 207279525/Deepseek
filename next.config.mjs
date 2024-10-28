/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-syntax-highlighter', 'remark-math', 'rehype-katex', 'react-katex']
};

export default nextConfig;
