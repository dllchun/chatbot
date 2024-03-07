// next.config.js

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
};

export default nextConfig;
