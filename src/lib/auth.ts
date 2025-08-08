import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Interface básica para o usuário da Better Auth
interface BetterAuthUser {
  id: string;
  email: string;
  [key: string]: any;
}

// Função para obter as origens confiáveis do .env
const getTrustedOrigins = () => {
  const originsString = process.env.TRUSTED_ORIGINS || "http://localhost:3000";
  return originsString.split(",").map((origin) => origin.trim());
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getTrustedOrigins(),
  // Configuração mais segura para tokens e sessões
  tokenOptions: {
    // Aumentar a segurança do token e reduzir erros
    accessToken: {
      expiresIn: "24h", // Aumentando para 24h para reduzir problemas de sessão
    },
    refreshToken: {
      expiresIn: "30d", // 30 dias para token de refresh
    },
  },
  sessionOptions: {
    // Configuração da sessão mais segura com cookies
    cookie: {
      name: "auth_session", // Definindo nome do cookie explicitamente
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
    },
    // Tempo máximo de expiração da sessão (30 dias)
    maxAge: 30 * 24 * 60 * 60,
  },
  onError: (error: Error, context: string) => {
    console.error(`[Better Auth Error] Contexto: ${context}`, error);
    // Implementar tratamento de erro específico se necessário
  },
  emailAndPassword: {
    enabled: true,
    requireVerification: false,
    // Configuração para validação de senha
    passwordOptions: {
      minLength: 6, // Mínimo de 6 caracteres para a senha
    },
    // Hook para salvar o nome do usuário durante o cadastro
    onSignUp: async ({
      user,
      credentials,
    }: {
      user: BetterAuthUser;
      credentials: { name?: string };
    }) => {
      try {
        if (credentials.name) {
          // Atualiza o usuário com o nome fornecido
          await prisma.user.update({
            where: { id: user.id },
            data: { name: credentials.name },
          });
        }
        return { user };
      } catch (error) {
        console.error("Erro ao processar onSignUp:", error);
        return { user };
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account", // Opcional: força a seleção de conta
    },
  },
});
