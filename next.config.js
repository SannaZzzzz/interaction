/** @type {import('next').NextConfig} */
const nextConfig = {
  // 我们需要移除output:'export'设置，因为在Vercel上部署时不需要此设置
  // output: 'export',
  
  // 去掉basePath以便适应Vercel部署
  // basePath: process.env.VERCEL_URL ? '' : process.env.NODE_ENV === 'production' ? '/interaction' : '',
  
  // 针对Vercel部署，将images的配置调整为兼容模式
  images: {
    domains: ['vercel.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 禁用严格模式以避免开发环境中的双重渲染
  reactStrictMode: false,
}

module.exports = nextConfig