/**
 * Security note: upgraded Next.js + React to patched stable versions to mitigate
 * known Server Components / Server Actions security advisories.
 * (See `docs/security-patches.md` for details.)
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
