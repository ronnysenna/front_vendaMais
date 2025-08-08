import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return NextResponse.json(
        { error: "Senha e token são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o token é válido (não vazio e é uma string)
    if (!token || typeof token !== "string") {
      console.error("Token inválido recebido:", token);
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    console.log(
      `Processando redefinição de senha. Token recebido (${typeof token}): ${token.substring(0, 8)}...`
    );

    // Hash do token recebido para comparação com o armazenado
    const tokenForHashing = token.trim(); // Remover espaços extras
    if (!tokenForHashing) {
      return NextResponse.json(
        { error: "Token inválido (vazio após trim)" },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(tokenForHashing)
      .digest("hex");
    console.log(
      `Token hash gerado para comparação: ${hashedToken.substring(0, 16)}...`
    );

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
      console.log("Usuário não encontrado com o token fornecido");
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    console.log(`Usuário encontrado para redefinição: ${user.email}`);

    // Hash da nova senha com bcrypt (método seguro)
    try {
      // Gerar salt e hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Atualizar a senha do usuário com o hash seguro
      await prisma.account.updateMany({
        where: { userId: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      console.log(`Senha alterada com sucesso para o usuário: ${user.email}`);

      // Limpar o token de redefinição
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      throw new Error("Falha ao atualizar senha");
    }

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
