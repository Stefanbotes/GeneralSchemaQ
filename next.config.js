/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the default server build (☞ DO NOT set `output: 'export'`)
  reactStrictMode: true,
  swcMinify: true,

  // Vercel defaults to `.next` already; keeping explicit is fine
  distDir: '.next',

  // Build hygiene
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  // If you’re not optimizing images via Next/Image on Vercel
  images: { unoptimized: true },

  // Small hardening + fewer headers
  poweredByHeader: false,

  // Avoid enabling experimental features unless you really need them
  experimental: {
    instrumentationHook: false,
  },

  // DO NOT add `output: 'export'` here — it would break dynamic routes like /results
};

module.exports = nextConfig;
