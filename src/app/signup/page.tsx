import Image from "next/image"
import Link from "next/link"
import { SignupForm } from "./_components/signup-form"

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6 text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/images/logo1.png"
            alt="Logo Venda Mais"
            width={200}
            height={200}
            className="mx-auto mb-8"
          />

          <h1 className="mt-10 text-4xl font-bold mb-4">Cadastro</h1>
          <p className="text-sm text-gray-400 mt-1">Crie sua conta para começar a vender mais!</p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <SignupForm />
        </div>

        {/* Link para login */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Já tem uma conta?{" "}
            <Link href="/login" className="text-[#fba931] font-semibold hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
