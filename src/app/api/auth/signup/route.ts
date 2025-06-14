import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "As senhas não coincidem" },
        { status: 400 },
      );
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 409 },
      );
    }

    // Gerar um ID único para o usuário
    const userId = uuidv4();
    const now = new Date();

    // Simular um hash de senha (em produção use bcrypt)
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Usar transação para garantir que ambas as operações sejam bem-sucedidas
    const result = await prisma.$transaction(async (prisma) => {
      // Criar o usuário
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

      // Criar a conta com a senha
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

      return { user, account };
    });

    return NextResponse.json(
      {
        message: "Usuário cadastrado com sucesso",
        userId: result.user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    // Logs mais detalhados para depuração
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
