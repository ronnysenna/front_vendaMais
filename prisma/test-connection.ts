require("dotenv").config({
  path: require("fs").existsSync(".env.local") ? ".env.local" : ".env",
});
require("dotenv").config(); // fallback para .env

import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    // Teste uma query simples
    const userCount = await prisma.user.count();
    console.log(`Número de usuários no banco: ${userCount}`);
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
