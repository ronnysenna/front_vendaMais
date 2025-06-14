import { NextResponse } from "next/server";

/**
 * API para verificação de versão do aplicativo
 * Retorna o build ID atual para comparação com a versão do cliente
 */
export async function GET() {
  // Usa a variável de ambiente definida durante o build do Docker
  // ou gera um fallback se não estiver disponível
  const buildId =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    `build-${Date.now()}-${Math.floor(Math.random() * 1000).toString()}`;

  // Definindo headers anti-cache para garantir que sempre obtemos a versão mais recente
  return NextResponse.json(
    {
      buildId,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
