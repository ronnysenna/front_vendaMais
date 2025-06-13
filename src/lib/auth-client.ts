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
    timeout: 10000,
    retries: 2,
  },
});
