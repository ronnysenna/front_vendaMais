"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function ButtonSignOut() {
  const router = useRouter();

  async function signOut() {
    try {
      // Fazendo um logout direto com fetch para garantir
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para incluir os cookies
      });

      if (response.ok) {
        const data = await response.json();
        const redirectUrl = data.redirectUrl || "/";
        router.replace(redirectUrl);
      } else {
        console.error("Erro ao fazer logout:", response.statusText);
        // Mesmo com erro, redireciona para a página inicial
        router.replace("/");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Redirecionamento forçado em caso de erro
      router.replace("/");
    }
  }

  return (
    <button
      onClick={signOut}
      className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
    >
      <LogOut size={18} />
      <span>Sair</span>
    </button>
  );
}
