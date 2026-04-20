/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse and mammoth are CJS-only Node modules — keep them server-side only
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
}

export default nextConfig
