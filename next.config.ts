// next.config.js or next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.goat.com',
      },
    ],
  },
};

export default nextConfig;
