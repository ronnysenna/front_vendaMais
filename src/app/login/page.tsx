import Link from "next/link"
import { LoginForm } from "../_components/login-form"
import Image from "next/image"
import logoImg from "@/../public/images/logo.png"

export default function LoginPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-dark py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Logo e Cabeçalho */}
            <div className="text-center mb-4">
              <Image
                src={logoImg}
                alt="Logo"
                width={320}
                height={320}
                className="img-fluid mb-4"
              />
              <h1 className="display-6 fw-bold text-white mb-2">
                Bem-vindo ao VendaMais
              </h1>
              <p className="text-light-emphasis mb-2">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            {/* Card do Formulário */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                <LoginForm />
              </div>
            </div>

            {/* Link para Cadastro */}
            <div className="text-center mt-4">
              <p className="text-light">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="text-primary text-decoration-none fw-semibold"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
