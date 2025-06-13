"use client"

import Link from "next/link"
// Importe o componente de formulário específico para redefinição de senha
// Crie este componente em um local como: ../_components/redefinir-senha-form.tsx
import { RedefinirSenhaForm } from "../_components/redefinir-senha-form" 
import { motion } from "framer-motion"

export default function RedefinirSenhaPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative py-5">
      {/* Background gradiente animado (mantido do login) */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-dark overflow-hidden">
        <div className="position-absolute w-100 h-100 opacity-10">
          <div
            className="position-absolute top-0 start-0 w-100 h-100 animate-background"
            style={{
              background:
                "linear-gradient(45deg, rgba(251,169,49,0.1) 0%, rgba(251,169,49,0) 70%, rgba(25,135,84,0.1) 100%)",
              backgroundSize: "400% 400%",
            }}
          ></div>
        </div>
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4"
            >
              {/* Elemento de brilho/logo (mantido do login, mas sem a imagem real) */}
              <div className="position-relative d-inline-block mb-3">
                <div
                  className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary"
                  style={{ width: "180px", height: "180px", filter: "blur(40px)", opacity: "0.2" }}
                ></div>
                {/* Se você tiver uma logo específica para esta página, pode inserí-la aqui */}
              </div>
              <h1 className="display-6 fw-bold text-white mb-2">
                Redefinir <span className="text-primary">Senha</span>
              </h1>
              <p className="text-light-emphasis mb-4">
                Crie uma nova senha para sua conta.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Card do Formulário com efeito de vidro (mantido do login) */}
              <div
                className="card border-0 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "1rem",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  {/* Componente do formulário de redefinição de senha */}
                  <RedefinirSenhaForm />
                </div>
              </div>

              {/* Link para Voltar ao Login (opcional, dependendo do fluxo) */}
              <div className="text-center mt-4" style={{ position: 'relative', zIndex: 10 }}>
                <p className="text-light">
                  <Link href="/login" className="text-primary text-decoration-none fw-semibold hover-scale-sm">
                    Voltar para o Login
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}