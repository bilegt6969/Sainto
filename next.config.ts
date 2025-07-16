/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.goat.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: "cdn2.thecatapi.com"
      },
      {
        protocol: 'https',
        hostname: "graph.facebook.com"
      }
    ],
  },
 };

export default nextConfig;
