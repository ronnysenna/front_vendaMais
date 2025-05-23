"use client"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Loader2, Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      cpfCnpj: "",
      address: "",
    },
  })

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        form.reset(data)
        setPreviewUrl(data.image || null)
      })
  }, [])

  async function onSubmit(values: ProfileFormData) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("phone", values.phone || "")
    formData.append("cpfCnpj", values.cpfCnpj || "")
    formData.append("address", values.address || "")
    if (values.image?.[0]) {
      formData.append("image", values.image[0])
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      body: formData,
    })

    if (res.ok) {
      alert("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } else {
      alert("Erro ao atualizar perfil.")
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center mb-6 relative">
        <h1 className="text-3xl font-bold text-[#fba931] mb-4">Perfil</h1>

        <div className="relative">
          <Image
            src={previewUrl || "/placeholder-avatar.png"}
            alt="Avatar"
            width={120}
            height={120}
            className="rounded-full border-4 border-yellow-500 shadow-md"
          />
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => form.setValue("image", e.target.files)}
            />
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center mt-2 gap-1 text-sm text-yellow-500 hover:underline"
          >
            <Pencil size={14} /> Editar Perfil
          </button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fba931]">Nome</FormLabel>
                <FormControl>
                  {isEditing ? <Input {...field} /> : <p className="bg-gray-800 p-3 rounded">{field.value}</p>}
                </FormControl>
              </FormItem>
            )}
          />

          {/* Telefone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fba931]">Telefone</FormLabel>
                <FormControl>
                  {isEditing ? <Input {...field} /> : <p className="bg-gray-800 p-3 rounded">{field.value}</p>}
                </FormControl>
              </FormItem>
            )}
          />

          {/* CPF/CNPJ */}
          <FormField
            control={form.control}
            name="cpfCnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fba931]">CPF/CNPJ</FormLabel>
                <FormControl>
                  {isEditing ? <Input {...field} /> : <p className="bg-gray-800 p-3 rounded">{field.value}</p>}
                </FormControl>
              </FormItem>
            )}
          />

          {/* Endereço */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fba931]">Endereço</FormLabel>
                <FormControl>
                  {isEditing ? <Input {...field} /> : <p className="bg-gray-800 p-3 rounded">{field.value}</p>}
                </FormControl>
              </FormItem>
            )}
          />

          {isEditing && (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          )}
        </form>
      </Form>
    </div>
  )
}
