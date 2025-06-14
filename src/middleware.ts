import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Clone da resposta
  const response = NextResponse.next();

  // Adicionar headers para prevenir cache
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");

  return response;
}

// Configurar para quais caminhos o middleware deve ser executado
export const config = {
  // Executar em todos os caminhos exceto coisas específicas como API e assets estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
