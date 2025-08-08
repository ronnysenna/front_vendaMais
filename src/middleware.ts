import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  // Verifica se existe um token de autenticação nos cookies
  const authCookie = request.cookies.get("auth_session");
  const authCookieBetterAuth = request.cookies.get("better_auth_session");

  // Verificar todos os cookies disponíveis para debug
  console.log(
    "[Middleware] Cookies disponíveis:",
    Array.from(request.cookies.getAll()).map((c) => c.name)
  );

  // Verificar qual cookie está sendo usado
  if (authCookie?.value) {
    console.log("[Middleware] Autenticado com cookie auth_session");
  } else if (authCookieBetterAuth?.value) {
    console.log("[Middleware] Autenticado com cookie better_auth_session");
  }

  // Verificar cookie de sucesso de login
  const loginSuccessCookie = request.cookies.get("login_success");

  // Considerar autenticado se qualquer um dos cookies de autenticação estiver presente
  // ou se o cookie de sucesso de login estiver presente
  const isAuthenticated =
    !!authCookie?.value ||
    !!authCookieBetterAuth?.value ||
    !!loginSuccessCookie?.value;

  console.log("[Middleware] isAuthenticated:", isAuthenticated);

  const pathname = request.nextUrl.pathname;

  // Rotas públicas (acessíveis sem autenticação)
  const publicRoutes = [
    "/login",
    "/signup",
    "/recuperar-senha",
    "/redefinir-senha",
  ];

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar se a rota atual é parte da API
  const isApiRoute = pathname.startsWith("/api");

  // Verificar se a rota é parte dos recursos estáticos
  const isStaticRoute =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  // Se for uma rota pública ou estática ou API, permitir acesso
  if (isPublicRoute || isStaticRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Se o usuário estiver autenticado, permitir acesso
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Se o usuário não estiver autenticado e tentar acessar a home ou rotas protegidas,
  // redirecionar para a página de login
  if (pathname === "/" || !isPublicRoute) {
    console.log(
      "[Middleware] Usuário não autenticado tentando acessar rota protegida:",
      pathname
    );

    // Se for a rota de dashboard após um login ou se tiver cookie de login_success, não redirecionar
    if (
      (pathname === "/dashboard" &&
        (request.nextUrl.search.includes("callbackURL") ||
          request.nextUrl.search.includes("callbackUrl"))) ||
      request.cookies.get("login_success")?.value === "true"
    ) {
      console.log(
        "[Middleware] Parece ser um redirecionamento após login ou temos cookie de sucesso, permitindo acesso"
      );

      // Criar uma resposta que continua a navegação
      const response = NextResponse.next();

      // Se temos o cookie de login_success, vamos removê-lo após uso
      if (request.cookies.get("login_success")) {
        response.cookies.delete("login_success");
      }

      return response;
    }

    // Usar callbackUrl (com u minúsculo) para compatibilidade
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
    console.log("[Middleware] Redirecionando para:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Por padrão, continuar
  return NextResponse.next();
}

// Configuração de quais rotas o middleware deve verificar
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
