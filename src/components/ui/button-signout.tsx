"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"

export function ButtonSignOut() {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.replace("/"),
        onError: (err) => console.error("Erro ao deslogar:", err)
      }
    })
  }

  return (
    <button
      onClick={signOut}
      className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
    >
      <LogOut size={18} />
      <span>Sair</span>
    </button>
  )
}
