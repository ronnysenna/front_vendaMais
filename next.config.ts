/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  env: {
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL:
      process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL,
  },
};

module.exports = nextConfig;
