"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .min(8, {
        message: "A confirmação de senha deve ter pelo menos 8 caracteres",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(formData: SignupFormValues) {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email(
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
        },
        {
          onRequest: () => { },
          onSuccess: (ctx) => {
            console.log("Cadastrado com sucesso", ctx);
            router.replace("/")
          },
          onError: (ctx) => {
            console.log("Erro ao criar sua Conta", ctx);
          },
        }
      );
    } catch (err) {
      console.error("Erro na requisição:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="needs-validation">
        <div className="mb-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="name" className="form-label text-dark">
                  Nome Completo
                </label>
                <FormControl>
                  <input
                    type="text"
                    className={`form-control ${form.formState.errors.name ? "is-invalid" : ""
                      }`}
                    id="name"
                    placeholder="Digite seu nome completo"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="invalid-feedback" />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="email" className="form-label text-dark">
                  Email
                </label>
                <FormControl>
                  <input
                    type="email"
                    className={`form-control ${form.formState.errors.email ? "is-invalid" : ""
                      }`}
                    id="email"
                    placeholder="Digite seu email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="invalid-feedback" />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="password" className="form-label text-dark">
                  Senha
                </label>
                <div className="input-group">
                  <FormControl>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${form.formState.errors.password ? "is-invalid" : ""
                        }`}
                      id="password"
                      placeholder="Digite sua senha"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <FormMessage className="invalid-feedback" />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="mb-4">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="confirmPassword" className="form-label text-dark">
                  Confirmar Senha
                </label>
                <div className="input-group">
                  <FormControl>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${form.formState.errors.confirmPassword ? "is-invalid" : ""
                        }`}
                      id="confirmPassword"
                      placeholder="Confirme sua senha"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <FormMessage className="invalid-feedback" />
                </div>
              </FormItem>
            )}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              <span>Cadastrando...</span>
            </>
          ) : (
            "Criar Conta"
          )}
        </button>
      </form>
    </Form>
  );
}
