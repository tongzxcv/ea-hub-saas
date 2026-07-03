/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel deploys at the root domain, so basePath must be empty by default.
  // If you ever deploy under a subpath (e.g. https://example.com/ea-hub/),
  // set NEXT_PUBLIC_BASE_PATH=/ea-hub in the environment.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

export default nextConfig
