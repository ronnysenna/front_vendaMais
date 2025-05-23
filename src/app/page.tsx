import { getOptionalSession } from "@/lib/get-optional-session"
import Link from "next/link"

export default async function HomePage() {
  const session = await getOptionalSession()

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-gray-900">
      {/* fundo animado */}
      <div className="absolute inset-0 animate-background bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-blue-500/10 blur-2xl opacity-60"></div>

      <div className="relative z-10 text-center p-6">
        <h1 className="text-4xl font-bold text-[#fba931] mb-4">Bem-vindo ao Venda Mais</h1>

        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
          Sua plataforma de vendas automatizadas via WhatsApp.<br />
          Organize seus catálogos, atenda com agilidade e venda todos os dias.
        </p>

        {session ? (
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-400 transition"
          >
            Ir para o painel
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-400 transition"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Criar conta
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
