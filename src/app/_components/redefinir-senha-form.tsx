"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import { useSearchParams } from "next/navigation"; // Importação correta para o Next.js 13+ App Router
import { useRouter } from "next/navigation"; // Para redirecionar após o sucesso

const formSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token"); // Pega o token da URL, ex: /redefinir-senha?token=XYZ
  const router = useRouter(); // Hook para navegação
  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Processar o token assim que o componente for montado
  useEffect(() => {
    if (tokenFromUrl) {
      // Limpar o token removendo possíveis espaços ou caracteres problemáticos
      const cleanedToken = tokenFromUrl.trim();
      setToken(cleanedToken);

      if (!cleanedToken) {
        setError("O token de redefinição é inválido. Solicite um novo link.");
      }
    } else {
      setError("Token de redefinição não encontrado. Solicite um novo link.");
    }
  }, [tokenFromUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Verifica se o token existe antes de prosseguir
    if (!token) {
      setError(
        "Token de redefinição de senha não encontrado ou inválido. Por favor, solicite um novo link.",
      );
      setIsLoading(false);
      return;
    }

    try {
      // Chamada para API de redefinição de senha
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          token: token, // Token já foi limpo no useEffect
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
          "Não foi possível redefinir sua senha. Link inválido ou expirado.",
        );
      }

      // Se a resposta for OK
      setSuccess(
        "Sua senha foi redefinida com sucesso! Redirecionando para o login...",
      );

      // Redireciona para a página de login após um pequeno atraso
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Espera 2 segundos para o usuário ler a mensagem
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Por favor, tente novamente.");
      console.error("Erro na redefinição de senha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-3">
          {success}
        </Alert>
      )}

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Nova Senha
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            id="password"
            {...register("password")}
            disabled={isLoading}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {errors.password && (
          <div className="invalid-feedback d-block">
            {errors.password.message}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirme a Senha
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
          id="confirmPassword"
          {...register("confirmPassword")}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <div className="invalid-feedback d-block">
            {errors.confirmPassword.message}
          </div>
        )}
      </div>

      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !!error}
        >
          {isLoading ? "Processando..." : "Redefinir Senha"}
        </button>
      </div>
    </form>
  );
}
