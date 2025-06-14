"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  address: z.string().optional(),
  image: z.any().optional(),
});

type ProfileFormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      cpfCnpj: "",
      address: "",
    },
  });

  useEffect(() => {
    if (successMessage || errorMessage) {
      setShowFeedback(true);
      const timer = setTimeout(() => {
        setShowFeedback(false);
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Carregar dados do perfil
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Erro ao carregar perfil");
        const data = await response.json();

        // Atualizar formulário com dados do servidor
        form.reset(data);

        // Se houver imagem, atualizar preview
        if (data.image) {
          setPreviewUrl(data.image);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setErrorMessage("Erro ao carregar dados do perfil");
      }
    }

    loadProfile();
  }, [form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image", file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.phone) formData.append("phone", data.phone);
      if (data.cpfCnpj) formData.append("cpfCnpj", data.cpfCnpj);
      if (data.address) formData.append("address", data.address);
      if (data.image) formData.append("image", data.image);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar perfil");
      }

      setSuccessMessage("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar perfil. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {showFeedback && (errorMessage || successMessage) && (
            <div
              className={`profile-feedback ${errorMessage ? "error" : "success"} d-flex align-items-center gap-2`}
            >
              {errorMessage ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-exclamation-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
              )}
              {errorMessage || successMessage}
            </div>
          )}

          <div className="profile-card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h1 className="h3 mb-1 fw-bold gradient-number">
                    Perfil da Empresa
                  </h1>
                  <p className="text-muted mb-0">
                    Gerencie as informações da sua empresa
                  </p>
                </div>
                <button
                  type="button"
                  className={`btn d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto hover-scale ${
                    isEditing ? "btn-secondary" : "btn-primary"
                  }`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                      </svg>
                      <span>Cancelar</span>
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      <span>Editar Empresa</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mb-4">
                <div className="profile-avatar-wrapper">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Logo da empresa"
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary text-white d-flex align-items-center justify-content-center">
                      <Camera size={48} />
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="imageInput"
                      className="profile-avatar-overlay d-flex align-items-center justify-content-center"
                    >
                      <Camera size={24} className="text-white" />
                      <input
                        type="file"
                        id="imageInput"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <small className="text-muted mt-2 d-block">
                  Logo da empresa
                </small>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    <div className="col-12">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="profile-form-group">
                            <label className="form-label">Razão Social</label>
                            <FormControl>
                              <input
                                type="text"
                                className="profile-form-control form-control"
                                placeholder="Nome da empresa"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small mt-1" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="profile-form-group">
                            <label className="form-label">
                              Telefone Comercial
                            </label>
                            <FormControl>
                              <input
                                type="tel"
                                className="profile-form-control form-control"
                                placeholder="(00) 0000-0000"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small mt-1" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        control={form.control}
                        name="cpfCnpj"
                        render={({ field }) => (
                          <FormItem className="profile-form-group">
                            <label className="form-label">CNPJ</label>
                            <FormControl>
                              <input
                                type="text"
                                className="profile-form-control form-control"
                                placeholder="00.000.000/0000-00"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small mt-1" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-12">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="profile-form-group">
                            <label className="form-label">
                              Endereço Comercial
                            </label>
                            <FormControl>
                              <input
                                type="text"
                                className="profile-form-control form-control"
                                placeholder="Rua, número, bairro, cidade - UF"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small mt-1" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 animate-slide-in">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Carregando...
                              </span>
                            </div>
                            <span>Salvando alterações...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-check2"
                              viewBox="0 0 16 16"
                            >
                              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                            <span>Salvar Alterações</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </Form>

              {isLoading && (
                <div className="loading-overlay">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
