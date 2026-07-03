/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // If you deploy the app under a subpath (e.g. https://example.com/ea-hub/),
  // enabling basePath and assetPrefix ensures Next serves static assets from
  // the subpath. Remove or adjust these if you deploy at the root.
  basePath: '/ea-hub',
  assetPrefix: '/ea-hub',
}

export default nextConfig
