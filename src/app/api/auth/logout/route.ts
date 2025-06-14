import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Criar uma resposta com status 200 e incluir URL de redirecionamento
    const response = NextResponse.json(
      {
        success: true,
        redirectUrl: "/",
      },
      { status: 200 }
    );

    // Lista de possíveis cookies de autenticação
    const authCookies = [
      "better_auth_session",
      "session_token",
      "auth_token",
      "user_session",
      "refresh_token",
    ];

    // Expirar cada cookie de autenticação
    for (const cookieName of authCookies) {
      response.cookies.set({
        name: cookieName,
        value: "",
        expires: new Date(0), // Data no passado para expirar
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Expirar o principal cookie do Better Auth
    response.cookies.set({
      name: "better_auth_session",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      {
        error: "Falha ao deslogar",
        redirectUrl: "/", // Mesmo com erro, indicamos redirecionamento para a página inicial
      },
      { status: 500 }
    );
  }
}
