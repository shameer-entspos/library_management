import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'out',
  env: {
    API_URL_PREFIX: process.env.API_URL_PREFIX,
    API_WS_PREFIX: process.env.API_WS_PREFIX,
    SECRET_KEY: process.env.SECRET_KEY,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
