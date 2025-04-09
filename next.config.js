/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel需要去掉output配置才能正确部署
  // output: 'export',
  // 去掉basePath以便适应Vercel部署
  // basePath: process.env.VERCEL_URL ? '' : process.env.NODE_ENV === 'production' ? '/interaction' : '',
  images: {
    unoptimized: true
  },
  // 禁用严格模式以避免开发环境中的双重渲染
  reactStrictMode: false,
}

module.exports = nextConfig