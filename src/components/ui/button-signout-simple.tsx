"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function ButtonSignOutSimple() {
    const router = useRouter();

    async function signOut() {
        try {
            // Tenta usar a rota personalizada de logout
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            // Independentemente da resposta, redirecionar para login
            router.push("/login");

            // Forçar um recarregamento completo da página para limpar o estado
            setTimeout(() => {
                window.location.href = "/login";
            }, 100);
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            // Forçar redirecionamento
            window.location.href = "/login";
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
