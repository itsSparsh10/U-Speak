/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Disable all caching mechanisms
  experimental: {
    // Disable webpack caching
    webpackBuildWorker: false,
    // Disable instrumentation to fix the error
    instrumentationHook: false,
  },
  // Disable webpack cache
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
    }
    // Disable instrumentation client resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'private-next-instrumentation-client': false,
    };
    return config;
  },
  // Disable static optimization caching
  generateEtags: false,
  // Disable compression to avoid cache issues
  compress: false,
  // Disable powered by header
  poweredByHeader: false,
};

module.exports = nextConfig;
