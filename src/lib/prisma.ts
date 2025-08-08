import { PrismaClient } from "../generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Tratamento de erros de conexão
// Não use process.on em ambientes Edge
if (
  process.env.NODE_ENV !== "production" &&
  typeof process !== "undefined" &&
  typeof process.on === "function"
) {
  // Verificamos se estamos em um ambiente Node.js completo antes de registrar listeners
  const handleShutdown = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };

  // Usa once em vez de on para evitar múltiplos registros
  process.once("SIGTERM", handleShutdown);
  process.once("SIGINT", handleShutdown);
}
