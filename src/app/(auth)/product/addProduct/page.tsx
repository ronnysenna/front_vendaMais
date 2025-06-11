// app/auth/products/add/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  value: z.string().min(1, "Preço é obrigatório"),
  stockQuantity: z.string().min(1, "Quantidade em estoque é obrigatória"),
  category: z.string().optional(),
  variations: z.string().optional(),
  color: z.string().optional(),
  image: z.any().optional(),
});

type ProductFormData = z.infer<typeof schema>;

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      value: "",
      stockQuantity: "",
      category: "",
      variations: "",
      color: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image", file);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      const response = await fetch("/api/product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao cadastrar produto");

      router.push("/product/catalog");
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card product-form-card p-4">
        <div className="d-flex align-items-center mb-4">
          <button
            type="button"
            className="back-button bg-transparent border-0"
            onClick={() => router.back()}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="h3 mb-0 ms-3">Adicionar Produto</h1>
        </div>

        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <div className="image-upload-area d-flex align-items-center justify-content-center" style={{ width: '200px', height: '200px' }}>
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Imagem do produto"
                  width={200}
                  height={200}
                  className="rounded-3 object-fit-cover w-100 h-100"
                />
              ) : (
                <div className="text-center">
                  <Camera size={48} className="text-muted mb-2" />
                  <p className="small text-muted mb-0">Clique para adicionar uma imagem</p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="row g-3">
            <div className="col-12">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Nome do Produto</label>
                    <FormControl>
                      <input
                        type="text"
                        className="product-form-input w-100"
                        placeholder="Digite o nome do produto"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Descrição</label>
                    <FormControl>
                      <textarea
                        className="product-form-input w-100"
                        placeholder="Digite a descrição do produto"
                        rows={3}
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Preço</label>
                    <FormControl>
                      <input
                        type="number"
                        step="0.01"
                        className="product-form-input w-100"
                        placeholder="R$ 0.00"
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
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Quantidade em Estoque</label>
                    <FormControl>
                      <input
                        type="number"
                        className="product-form-input w-100"
                        placeholder="0"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Categoria</label>
                    <FormControl>
                      <input
                        type="text"
                        className="product-form-input w-100"
                        placeholder="Digite a categoria"
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Cor</label>
                    <FormControl>
                      <input
                        type="text"
                        className="product-form-input w-100"
                        placeholder="Ex: Azul, Vermelho"
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
                name="variations"
                render={({ field }) => (
                  <FormItem>
                    <label className="form-label">Variações</label>
                    <FormControl>
                      <input
                        type="text"
                        className="product-form-input w-100"
                        placeholder="Ex: P,M,G"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-danger small mt-1" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-12 mt-4">
              <button
                type="submit"
                className="submit-button w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  "Cadastrar Produto"
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}