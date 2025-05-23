"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { LogOutIcon } from "lucide-react"

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
      className="w-full flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors"
    >
      <LogOutIcon size={18} /> Sair
    </button>
  )
}
