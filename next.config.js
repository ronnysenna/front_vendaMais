/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar o cache para garantir que sempre obtenha o conteúdo mais recente durante desenvolvimento
  reactStrictMode: true,

  // Configuração para URLs dinâmicas e diretório de saída personalizado
  distDir: ".next",

  // Configuração de imagens remotas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "agenda-ai.ronnysenna.com.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "developers.google.com",
        pathname: "/**",
      },
    ],
    domains: [
      "res.cloudinary.com",
      "agenda-ai.ronnysenna.com.br",
      "developers.google.com",
    ],
  },

  // Configurações para melhorar o carregamento de arquivos estáticos
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL:
      process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL,
  },
  // Gera um ID de build único para cada deploy
  // Isso força os navegadores e CDNs a baixarem novas versões dos arquivos
  generateBuildId: async () => {
    // Use a variável de ambiente se disponível, ou gere um timestamp no momento do build
    return process.env.NEXT_PUBLIC_BUILD_ID || `build-${Date.now()}`;
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
