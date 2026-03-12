/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TypeScript errors ko ignore karo build ke time
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
