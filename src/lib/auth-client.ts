import { createAuthClient } from "better-auth/react";

// Exemplo de função para login social
const signInWithGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
  return data;
};

// Cliente de autenticação para uso em componentes do frontend
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Adiciona timeout e retry para melhorar confiabilidade
  fetchOptions: {
    timeout: 15000, // Aumentando o timeout para 15 segundos
    retries: 3, // Aumentando para 3 tentativas
  },
  // Configuração para salvar cookies corretamente
  cookieOptions: {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  // Handler de erro personalizado
  onError: (error: any) => {
    console.error("[Auth Client Error]:", error);
  },
});
