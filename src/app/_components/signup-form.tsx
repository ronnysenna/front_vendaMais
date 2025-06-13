"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Usar o Better Auth para registrar o usuário
      const result = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Dados do formulário enviados:", {
        name: formData.name,
        email: formData.email
      });

      if (result.error) {
        // Tratamento de erros específicos para melhor feedback ao usuário
        const errorMessage = result.error.message || result.error.statusText || "Erro desconhecido";

        if (errorMessage.includes("email") || errorMessage.includes("e-mail")) {
          setErrors({ email: "Este e-mail já está sendo utilizado por outro usuário" });
          throw new Error("Este e-mail já está sendo utilizado por outro usuário");
        } else {
          throw new Error(errorMessage || "Ocorreu um erro ao criar sua conta.");
        }
      }

      // Adiciona um parâmetro de sucesso na URL
      // Isso ajuda a mostrar uma mensagem personalizada na página de login
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1000);

      // Atualiza o estado com a mensagem de sucesso
      setErrors({ success: "Conta criada com sucesso! Redirecionando para o login..." })
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error)
      setErrors({ form: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation">
      {errors.form && (
        <div className="alert alert-danger" role="alert">
          {errors.form}
        </div>
      )}
      {errors.success && (
        <div className="alert alert-success" role="alert">
          {errors.success}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="name" className="form-label">Nome completo</label>
        <input
          type="text"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Digite seu nome completo"
          disabled={isLoading}
          required
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">E-mail</label>
        <input
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="nome@exemplo.com"
          disabled={isLoading}
          required
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Senha</label>
        <input
          type="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mínimo 6 caracteres"
          disabled={isLoading}
          required
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="form-label">Confirmar senha</label>
        <input
          type="password"
          className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Digite novamente sua senha"
          disabled={isLoading}
          required
        />
        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 btn-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Processando...
          </>
        ) : "Criar conta"}
      </button>
    </form>
  )
}
