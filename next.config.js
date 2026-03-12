/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore ESLint errors during production builds
  // This prevents ESLint from stopping the build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
