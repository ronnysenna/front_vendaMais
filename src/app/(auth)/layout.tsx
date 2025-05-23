import { ReactNode } from "react"
import Sidebar from "../_components/sidebar"
import { getProtectedSession } from "@/lib/get-protected-session"
import "../globals.css"

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await getProtectedSession()

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar sempre renderizada, mas visível só no md: */}
      <Sidebar userName={session.user.name ?? "Usuário"} />
      
      {/* Conteúdo: sem margem lateral em mobile, com ml-64 a partir de md: */}
      <main className="flex-1 w-full px-4 py-6 md:ml-64">
        {children}
      </main>
    </div>
  )
}
