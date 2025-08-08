import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getProtectedSession() {
  try {
    // Verificar se o usuário tem uma sessão válida
    try {
      console.log("[getProtectedSession] Verificando sessão...");

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        console.log(
          "[getProtectedSession] Sessão inválida - redirecionando para login"
        );
        // Adicionar um timestamp para evitar problemas de cache no redirecionamento
        redirect(`/login?timestamp=${Date.now()}`);
      }

      console.log(
        "[getProtectedSession] Sessão válida encontrada para usuário:",
        session.user.id
          ? session.user.id.substring(0, 8) + "..."
          : "ID não disponível"
      );

      return session;
    } catch (sessionError) {
      // Em caso de erro na API de sessão, log detalhado para depuração
      console.error(
        "[getProtectedSession] Erro ao processar sessão:",
        sessionError
      );

      // Se estamos no ambiente de desenvolvimento, mostrar mais detalhes
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[getProtectedSession] Detalhes do erro de sessão:",
          typeof sessionError === "object"
            ? JSON.stringify(sessionError)
            : sessionError
        );
      }

      // Adicionar um timestamp para evitar problemas de cache no redirecionamento
      redirect(`/login?error=session-invalid&timestamp=${Date.now()}`);
    }
  } catch (error) {
    // Erro geral no processamento da função
    console.error(
      "[getProtectedSession] Erro crítico ao obter sessão protegida:",
      error
    );

    // Adicionar um timestamp para evitar problemas de cache no redirecionamento
    redirect(`/login?error=session-error&timestamp=${Date.now()}`);
  }
}
