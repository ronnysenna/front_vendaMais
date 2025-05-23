import Link from "next/link"
import { LoginForm } from "../_components/login-form"
import Image from "next/image"
import logoImg from "@/../public/images/logo1.png"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Image
            src={logoImg}
            alt="Logo"
            width={200}
            height={200}
            className="mx-auto mb-8.5"
          />
          <h1 className="mt-10 text-4xl font-bold mb-4">Login</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm">
          <p>
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-[#fba931] font-bold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
