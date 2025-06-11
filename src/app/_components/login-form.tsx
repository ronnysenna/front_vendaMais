"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  async function onSubmit(formData: LoginFormValues) {
    setIsLoading(true)
    try {
      await authClient.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => router.replace("/dashboard"),
          onError: (ctx) => console.error("Erro ao logar", ctx),
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignInGoogle() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      }, {
        onSuccess: () => router.replace("/dashboard"),
        onError: (ctx) => console.error("Erro ao logar", ctx),
      })
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
      <div className="mb-4">
        <label htmlFor="email" className="form-label text-dark">Email</label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          id="email"
          placeholder="Digite seu email"
          disabled={isLoading}
          {...register('email')}
        />
        {errors.email && (
          <div className="invalid-feedback">
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label text-dark">Senha</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            id="password"
            placeholder="Digite sua senha"
            disabled={isLoading}
            {...register('password')}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <div className="invalid-feedback">
              {errors.password.message}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2 mb-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            <span>Entrando...</span>
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <div className="text-center text-muted mb-3">ou</div>

      <button
        type="button"
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 border"
        onClick={handleSignInGoogle}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width="18"
          height="18"
        />
        <span>Entrar com Google</span>
      </button>
    </form>
  )
}
