import Image from "next/image"
import Link from "next/link"
import { SignupForm } from "./_components/signup-form"

export default function Signup() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-dark py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Logo e Cabeçalho */}
            <div className="text-center mb-4">
              <Image
                src="/images/logo.png"
                alt="Logo Venda Mais"
                width={320}
                height={320}
                className="img-fluid mb-4"
              />

              <h1 className="display-6 fw-bold text-white mb-2">Cadastro</h1>
              <p className="text-light-emphasis mb-2">
                Crie sua conta para começar a vender mais!
              </p>
            </div>

            {/* Card do Formulário */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                <SignupForm />
              </div>
            </div>

            {/* Link para Login */}
            <div className="text-center mt-4">
              <p className="text-light">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary text-decoration-none fw-semibold">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
