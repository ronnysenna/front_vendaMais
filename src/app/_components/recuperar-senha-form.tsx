"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
// Se você está usando Bootstrap, o componente Alert é do 'react-bootstrap'
// Certifique-se de ter 'react-bootstrap' instalado: npm install react-bootstrap bootstrap
import { Alert } from "react-bootstrap"

const formSchema = z.object({
  email: z.string().email("E-mail inválido."),
})

type FormData = z.infer<typeof formSchema>

export function RecuperarSenhaForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset // Adicionado para limpar o formulário após o sucesso
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null) // Limpa erros anteriores
    setSuccess(null) // Limpa mensagens de sucesso anteriores

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      // Verifica primeiro se a resposta existe
      if (!response) {
        throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
      }

      // Captura o texto da resposta antes de tentar parsear como JSON
      const responseText = await response.text();

      // Se a resposta estiver vazia, trate adequadamente
      if (!responseText) {
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: Resposta vazia do servidor`);
        }
        // Se a resposta for OK mas vazia, considere como sucesso
        setSuccess("Um link de recuperação foi enviado para o seu e-mail, se a conta existir.");
        reset();
        return;
      }

      // Tenta parsear o texto como JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Erro ao parsear JSON:", responseText);
        throw new Error("Resposta inválida do servidor. Por favor, tente novamente mais tarde.");
      }

      // Agora podemos verificar se a resposta indica sucesso ou erro
      if (!response.ok) {
        throw new Error(responseData.error || "Erro desconhecido ao solicitar a recuperação.");
      }

      // Se chegamos aqui, a resposta foi bem-sucedida
      setSuccess("Um link de recuperação foi enviado para o seu e-mail, se a conta existir. Verifique sua caixa de entrada e spam.");
      reset(); // Limpa o campo de e-mail após o envio bem-sucedido

    } catch (err: any) { // Captura qualquer tipo de erro
      setError(err.message || "Ocorreu um erro. Por favor, tente novamente.");
      console.error("Erro na recuperação de senha:", err);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Exibição de mensagens de erro ou sucesso */}
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      <div className="mb-3">
        <label htmlFor="email" className="form-label text-dark">E-mail</label>
        <input
          type="email"
          className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
          id="email"
          placeholder="seu@email.com"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg w-100 mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="ms-2">Enviando...</span>
          </>
        ) : (
          "Enviar Link de Recuperação"
        )}
      </button>
    </form>
  )
}