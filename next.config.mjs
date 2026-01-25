/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
      },
      {
        protocol: 'https',
        hostname: 'img.discogs.com',
      },
      {
        protocol: 'https',
        hostname: '**.discogs.com',
      },
    ],
  },
};

export default nextConfig;
