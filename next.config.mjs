/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 如果您想在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 如果您想在生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  transpilePackages: ['react-syntax-highlighter', 'remark-math', 'rehype-katex', 'react-katex']
};

export default nextConfig;
