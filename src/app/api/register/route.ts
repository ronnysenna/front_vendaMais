import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  console.log("⭐ Rota de registro personalizada acessada");
  try {
    const { name, email, password, confirmPassword } = await request.json();
    console.log("📝 Dados recebidos:", {
      name,
      email,
      passwordLength: password?.length,
    });

    // Validações básicas
    if (!name || !email || !password) {
      console.log("❌ Dados inválidos - campos obrigatórios faltando");
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      console.log("❌ Senhas não coincidem");
      return NextResponse.json(
        { error: "As senhas não coincidem" },
        { status: 400 },
      );
    }

    // Verifica se o usuário já existe
    console.log("🔍 Verificando se email já existe:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ Email já está em uso:", email);
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 409 },
      );
    }

    // Gerar um ID único para o usuário
    const userId = uuidv4();
    const now = new Date();

    // Hash da senha para armazenamento seguro
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    console.log("🔐 Criando novo usuário com ID:", userId);

    try {
      // Criar o usuário diretamente
      const user = await prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      });

      console.log("✅ Usuário criado:", user.id);

      // Criar a conta associada
      console.log("🔑 Criando conta para o usuário");
      const account = await prisma.account.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          providerId: "credentials",
          accountId: email,
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      });

      console.log("✅ Conta criada:", account.id);

      return NextResponse.json(
        {
          message: "Usuário cadastrado com sucesso",
          userId: user.id,
        },
        { status: 201 },
      );
    } catch (dbError) {
      console.error("❌ ERRO DB:", dbError);
      throw dbError; // Repassar para tratamento externo
    }
  } catch (error) {
    console.error("❌❌❌ Erro ao criar usuário:", error);

    // Logs mais detalhados
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Erro ao processar o cadastro",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
