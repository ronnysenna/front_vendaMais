'use client'

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { HomeIcon, UserIcon } from "lucide-react"
import { ButtonSignOut } from "../../components/ui/button-signout"

export default function Sidebar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Topo Mobile */}
      <div className="md:hidden p-4 bg-gray-900 text-white flex justify-between items-center fixed w-full z-40">
        {/*<Image src="/images/logo1.png" alt="Logo" width={32} height={32} />*/}
        <button onClick={() => setOpen(true)} className="text-2xl">☰</button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:block bg-gray-800 text-white w-64 h-screen fixed z-30">
        <SidebarContent userName={userName} />
      </aside>

      {/* Sidebar Mobile */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-gray-800 text-white w-64 h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              {/*<Image src="/images/logo1.png" alt="Logo" width={32} height={32} />*/}
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <SidebarContent userName={userName} />
          </div>
        </div>
      )}
    </>
  )
}

function SidebarContent({ userName }: { userName: string }) {
  return (
    <>
      {/* Cabeçalho com nome */}
      <div className="flex flex-col items-center p-6 border-b border-gray-700">
        <Image src="/images/logo1.png" alt="Logo" width={100} height={100} />
        <p className="text-sm mt-2 text-gray-300">Olá, {userName}</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-yellow-400 font-medium">
              <HomeIcon size={18} /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center gap-2 hover:text-yellow-400 font-medium">
              <UserIcon size={18} /> Perfil
            </Link>
          </li>
          <li>

          </li>
        </ul>
      </nav>
      {/* Botão sair fixo no rodapé */}
      <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
        <ButtonSignOut />
      </div>

    </>
  )
}
