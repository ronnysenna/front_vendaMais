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
  emailAndPassword: {
    enabled: true,
    requireVerification: false,
    // Hook para salvar o nome do usuário durante o cadastro
    onSignUp: async ({
      user,
      credentials,
    }: {
      user: BetterAuthUser;
      credentials: { name?: string };
    }) => {
      if (credentials.name) {
        // Atualiza o usuário com o nome fornecido
        await prisma.user.update({
          where: { id: user.id },
          data: { name: credentials.name },
        });
      }
      return { user };
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
