"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  address: z.string().optional(),
  image: z.any().optional(),
})

type ProfileFormData = z.infer<typeof schema>

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      cpfCnpj: "",
      address: "",
    },
  })

  // Carregar dados do perfil
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) throw new Error("Erro ao carregar perfil")
        const data = await response.json()

        // Atualizar formulário com dados do servidor
        form.reset(data)

        // Se houver imagem, atualizar preview
        if (data.image) {
          setPreviewUrl(data.image)
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        setErrorMessage("Erro ao carregar dados do perfil")
      }
    }

    loadProfile()
  }, [form])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      form.setValue("image", file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      if (data.phone) formData.append("phone", data.phone)
      if (data.cpfCnpj) formData.append("cpfCnpj", data.cpfCnpj)
      if (data.address) formData.append("address", data.address)
      if (data.image) formData.append("image", data.image)

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao atualizar perfil")
      }

      setSuccessMessage("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setErrorMessage(error instanceof Error ? error.message : "Erro ao atualizar perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {successMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <h1 className="h3 mb-0 fw-bold">Perfil</h1>
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Camera size={18} />
                  <span>{isEditing ? "Cancelar" : "Editar"}</span>
                </button>
              </div>

              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div className="rounded-circle overflow-hidden bg-light shadow-sm" style={{ width: '120px', height: '120px' }}>
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Foto do perfil"
                        width={120}
                        height={120}
                        className="img-fluid hover-scale"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Camera size={40} className="text-muted" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label
                      htmlFor="image-upload"
                      className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm hover-scale"
                      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                    >
                      <Camera size={18} />
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    <div className="col-12">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="text"
                                className="form-control transition-all"
                                placeholder="Nome completo"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="tel"
                                className="form-control transition-all"
                                placeholder="Telefone"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        control={form.control}
                        name="cpfCnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="text"
                                className="form-control transition-all"
                                placeholder="CPF/CNPJ"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-12">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="text"
                                className="form-control transition-all"
                                placeholder="Endereço completo"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className={`mt-4 ${isEditing ? 'animate-slide-in' : ''}`}>
                    {isEditing ? (
                      <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Salvando alterações...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
                              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                            <span>Salvar Alterações</span>
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
