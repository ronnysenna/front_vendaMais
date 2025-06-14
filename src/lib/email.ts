"use server";

import nodemailer from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html: string;
};

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // Obtenha as credenciais do ambiente
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");

  if (!user || !pass) {
    console.error(
      "Credenciais de email não configuradas. Verifique as variáveis de ambiente EMAIL_USER e EMAIL_PASS.",
    );
    throw new Error("Configuração de email incompleta");
  }

  // Crie um transportador reutilizável usando SMTP
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // true para 465, false para outros portas
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    // Envie o email com o transportador definido
    const info = await transporter.sendMail({
      from: `"VendaMais" <${user}>`, // endereço do remetente
      to: to,
      subject: subject,
      text: text || "",
      html: html,
    });

    console.log("Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error(`Falha ao enviar email: ${(error as Error).message}`);
  }
}
