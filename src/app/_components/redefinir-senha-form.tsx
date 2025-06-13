"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Alert } from "react-bootstrap"
import { useSearchParams } from "next/navigation" // Importação correta para o Next.js 13+ App Router
import { useRouter } from "next/navigation" // Para redirecionar após o sucesso

const formSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof formSchema>

export function RedefinirSenhaForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') // Pega o token da URL, ex: /redefinir-senha?token=XYZ
  const router = useRouter() // Hook para navegação

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Verifica se o token existe antes de prosseguir
    if (!token) {
      setError("Token de redefinição de senha não encontrado ou inválido. Por favor, solicite um novo link.")
      setIsLoading(false)
      return
    }

    try {
      // **CHAMADA PARA SUA API DE REDEFINIÇÃO DE SENHA**
      const response = await fetch("/api/auth/reset-password", { // Ajuste esta URL para sua rota de API real
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          password: data.password,
          token: token // Envia o token junto com a nova senha
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Não foi possível redefinir sua senha. Link inválido ou expirado.");
      }

      // Se a resposta for OK
      setSuccess("Sua senha foi redefinida com sucesso! Redirecionando para o login...");
      
      // Redireciona para a página de login após um pequeno atraso
      setTimeout(() => {
        router.push('/login'); 
      }, 2000); // Espera 2 segundos para o usuário ler a mensagem

    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Por favor, tente novamente.");
      console.error("Erro na redefinição de senha:", err);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {/* Mensagem de alerta se não houver token na URL */}
      {!token && (
        <Alert variant="warning" className="mb-3">
          Link de redefinição inválido ou expirado. Por favor, solicite uma nova recuperação de senha.
        </Alert>
      )}

      <div className="mb-3">
        <label htmlFor="password" className="form-label text-dark">Nova Senha</label>
        <input
          type={showPassword ? "text" : "password"}
          className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
          id="password"
          placeholder="Digite sua nova senha"
          disabled={isLoading || !token} 
          {...register("password")}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="form-label text-dark">Confirmar Nova Senha</label>
        <input
          type={showPassword ? "text" : "password"}
          className={`form-control form-control-lg ${errors.confirmPassword ? "is-invalid" : ""}`}
          id="confirmPassword"
          placeholder="Confirme sua nova senha"
          disabled={isLoading || !token} 
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
      </div>

      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          disabled={isLoading || !token}
        />
        <label className="form-check-label text-dark" htmlFor="showPassword">
          Mostrar Senha
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg w-100 mt-2"
        disabled={isLoading || !token} 
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="ms-2">Redefinindo...</span>
          </>
        ) : (
          "Redefinir Senha"
        )}
      </button>
    </form>
  )
}