import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 },
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retornar uma resposta positiva
    // mesmo se o usuário não existir (para evitar enumeration attacks)
    if (!user) {
      // Note que retornamos 200 mesmo se o usuário não existir
      // para não revelar quais e-mails estão cadastrados
      return NextResponse.json(
        {
          message:
            "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
        },
        { status: 200 },
      );
    }

    // Gerar um token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Salvar o token no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHashed,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hora de validade
      },
    });

    // Construir o link de recuperação
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/redefinir-senha?token=${resetToken}`;

    // Enviar email com o link de recuperação
    try {
      await sendEmail({
        to: user.email,
        subject: "VendaMais - Recuperação de Senha",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #fb964c;">Recuperação de Senha</h2>
            <p>Olá ${user.name},</p>
            <p>Recebemos uma solicitação para redefinir sua senha no VendaMais.</p>
            <p>Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #fb964c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Redefinir minha senha
              </a>
            </div>
            <p>Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p>
            <p>Atenciosamente,<br>Equipe VendaMais</p>
          </div>
        `,
      });

      console.log("Email de recuperação enviado para:", user.email);
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Não retornamos erro para o cliente por questões de segurança
    }

    return NextResponse.json(
      {
        message:
          "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar solicitação" },
      { status: 500 },
    );
  }
}
