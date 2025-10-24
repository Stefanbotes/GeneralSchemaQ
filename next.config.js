/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit output configuration for Vercel
  distDir: '.next',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: { 
    unoptimized: true 
  },
  
  // Optimize build process
  swcMinify: true,
  
  // Experimental features for better Vercel compatibility
  experimental: {
    instrumentationHook: false,
  },
};

module.exports = nextConfig;
