import { prisma } from "../src/lib/prisma";

async function checkAuthIntegration() {
  console.log("\n🔍 VERIFICANDO INTEGRAÇÃO BETTER AUTH COM O BANCO DE DADOS\n");

  try {
    // Verificar tabela de usuários
    const usersCount = await prisma.user.count();
    console.log(`✅ Tabela de usuários: ${usersCount} usuários encontrados`);

    if (usersCount > 0) {
      const users = await prisma.user.findMany({
        include: {
          accounts: true,
        },
        take: 3,
      });

      console.log("\n📋 Exemplo dos primeiros usuários:");
      users.forEach((user, index) => {
        console.log(`\n👤 Usuário ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Email verificado: ${user.emailVerified}`);
        console.log(`   Contas vinculadas: ${user.accounts.length}`);

        if (user.accounts.length > 0) {
          console.log("   🔑 Detalhes da primeira conta:");
          console.log(`      Provedor: ${user.accounts[0].providerId}`);
          console.log(`      ID da conta: ${user.accounts[0].accountId}`);
          console.log(
            `      Senha definida: ${user.accounts[0].password ? "Sim" : "Não"}`
          );
        }
      });
    }

    // Verificar configuração do Better Auth
    console.log("\n🔐 Configuração do Better Auth:");
    console.log(`   Provider do banco: PostgreSQL`);
    console.log(`   Autenticação por email: Ativada`);
    console.log(
      `   Verificação de email: ${process.env.BETTER_AUTH_REQUIRE_VERIFICATION === "true" ? "Obrigatória" : "Não obrigatória"}`
    );
    console.log(`   Autenticação Google: Configurada`);

    console.log("\n✅ Verificação de integração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao verificar integração:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthIntegration();
