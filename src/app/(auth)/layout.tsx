import { ReactNode } from "react"
import { ModernSidebar } from "@/components/ui/modern-sidebar"
import { getProtectedSession } from "@/lib/get-protected-session"
import "../globals.css"

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await getProtectedSession()

  return (
    <div className="d-flex vh-100">
      <ModernSidebar userName={session.user.name ?? "Usuário"} />

      <main className="flex-grow-1 bg-light p-3 p-md-4 overflow-auto">
        <div className="container-fluid py-2 py-md-3 mt-md-0 mt-5">
          {children}
        </div>
      </main>
    </div>
  )
}
