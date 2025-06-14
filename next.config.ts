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
  // Gera um ID de build único para cada deploy
  // Isso força os navegadores e CDNs a baixarem novas versões dos arquivos
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Otimiza o cache para garantir conteúdo mais recente
  onDemandEntries: {
    // Tempo que a página deve permanecer em buffer (10 segundos)
    maxInactiveAge: 10 * 1000,
    // Número de páginas a manter em cache
    pagesBufferLength: 1,
  },
};

module.exports = nextConfig;
