/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 确保Vercel部署时正确处理路径
  basePath: process.env.VERCEL_URL ? '' : process.env.NODE_ENV === 'production' ? '/interaction' : '',
  images: {
    unoptimized: true
  },
  // 禁用严格模式以避免开发环境中的双重渲染
  reactStrictMode: false,
}

module.exports = nextConfig