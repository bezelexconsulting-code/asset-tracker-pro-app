/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Disable static generation for auth-dependent pages
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Disable build traces collection to avoid circular dependency
  outputFileTracing: false,
}

module.exports = nextConfig