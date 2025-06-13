import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return NextResponse.json(
        { error: "Senha e token são obrigatórios" },
        { status: 400 }
      );
    }

    // Hash do token recebido para comparação com o armazenado
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Procurar usuário com o token e que ainda não expirou
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token ainda não expirou
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Atualizar a senha do usuário e limpar o token
    // Aqui você deve aplicar o hash à senha antes de salvá-la
    // Exemplo usando bcrypt (você precisaria instalar e importar bcrypt)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Para este exemplo, estamos armazenando a senha em texto simples
    // IMPORTANTE: Em produção, use sempre uma biblioteca como bcrypt para fazer o hash da senha
    await prisma.account.updateMany({
      where: { userId: user.id },
      data: {
        password: password, // Em produção: Substituir por hashedPassword
        updatedAt: new Date(),
      },
    });

    // Limpar o token de redefinição
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Senha redefinida com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar solicitação" },
      { status: 500 }
    );
  }
}
