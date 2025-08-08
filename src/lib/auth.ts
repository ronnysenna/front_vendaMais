import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
const { v4: uuidv4 } = require("uuid");
import bcrypt from "bcrypt";

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
    console.error(`[Better Auth Error] Contexto: ${context}`);
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message);
      console.error("Stack trace:", error.stack);
    } else {
      console.error("Erro desconhecido:", error);
    }
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
      credentials: { name?: string; email?: string; password?: string };
    }) => {
      try {
        // Hash seguro da senha
        const hashedPassword = credentials.password
          ? await bcrypt.hash(credentials.password, 10)
          : undefined;
        // Fluxo robusto: cria/atualiza usuário e conta em transação
        const result = await prisma.$transaction(async (tx) => {
          // Atualiza nome se fornecido
          let updatedUser = user;
          if (credentials.name) {
            updatedUser = await tx.user.update({
              where: { id: user.id },
              data: { name: credentials.name },
            });
          }
          // Garante que a conta existe
          let account = await tx.account.findFirst({
            where: { accountId: user.email, providerId: "credentials" },
          });
          if (!account) {
            account = await tx.account.create({
              data: {
                id: uuidv4(),
                accountId: user.email,
                providerId: "credentials",
                userId: user.id,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          return { user: updatedUser, account };
        });
        return result;
      } catch (error) {
        console.error("Erro ao processar onSignUp:", error);
        throw new Error(
          "Erro ao criar usuário e conta. Tente novamente ou entre em contato com o suporte."
        );
      }
    },
    // Hook para garantir robustez no login
    onSignIn: async ({ email, password }: { email: string; password: string }) => {
      // Busca usuário e conta
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error(
          "Usuário não encontrado. Cadastre-se antes de fazer login."
        );
      }
      const account = await prisma.account.findFirst({
        where: { accountId: email, providerId: "credentials" },
      });
      if (!account) {
        throw new Error(
          "Conta de login não encontrada. Redefina sua senha ou entre em contato com o suporte."
        );
      }
      // Verifica senha
      const senhaCorreta =
        password && account.password
          ? await bcrypt.compare(password, account.password)
          : false;
      if (!senhaCorreta) {
        throw new Error("Senha incorreta. Tente novamente.");
      }
      return { user, account };
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
