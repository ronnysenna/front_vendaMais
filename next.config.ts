/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vendamais.ronnysenna.com.br",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL:
      process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL,
  },
};

module.exports = nextConfig;
