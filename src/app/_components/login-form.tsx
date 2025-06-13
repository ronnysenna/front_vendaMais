"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verifica se existe um parâmetro na URL indicando registro bem-sucedido
  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setStatusMessage({
        type: 'success',
        message: 'Cadastro realizado com sucesso! Faça login para continuar.'
      })
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(formData: LoginFormValues) {
    setIsLoading(true)
    try {
      const result = await authClient.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => router.replace("/dashboard"),
          onError: (ctx) => {
            console.error("Erro ao logar", ctx)
            setStatusMessage({
              type: 'error',
              message: 'Falha ao fazer login. Verifique suas credenciais e tente novamente.'
            })
          },
        },
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignInGoogle() {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => router.replace("/dashboard"),
          onError: (ctx) => console.error("Erro ao logar", ctx),
        },
      )
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
      {statusMessage && (
        <div className={`alert alert-${statusMessage.type} alert-dismissible fade show`} role="alert">
          {statusMessage.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setStatusMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="form-label fw-medium mb-2">
          Email
        </label>
        <input
          type="email"
          className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
          id="email"
          placeholder="Digite seu email"
          style={{ fontSize: '14px' }}
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="password" className="form-label fw-medium m-0">
            Senha
          </label>
          <a href="/recuperar-senha" className="text-primary text-decoration-none small">
            Esqueceu a senha?
          </a>
        </div>
        <div className="input-group input-group-lg">
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            id="password"
            placeholder="Digite sua senha"
            style={{ fontSize: '14px' }}
            disabled={isLoading}
            {...register("password")}
          />
          <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>
      </div>

      <motion.button
        type="submit"
        className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2 mb-4"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span>Entrando...</span>
          </>
        ) : (
          "Entrar"
        )}
      </motion.button>

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="flex-grow-1 border-top"></div>
        <div className="text-muted small fw-medium">ou continue com</div>
        <div className="flex-grow-1 border-top"></div>
      </div>

      <motion.button
        type="button"
        className="btn btn-light w-100 btn-lg d-flex align-items-center justify-content-center gap-2 border shadow-sm"
        onClick={handleSignInGoogle}
        whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width="20" height="20" />
        <span>Entrar com Google</span>
      </motion.button>
    </form>
  )
}
