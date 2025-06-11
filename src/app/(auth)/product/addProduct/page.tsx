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
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <button
                  type="button"
                  className="btn btn-link text-muted p-0"
                  onClick={() => router.back()}
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="h3 mb-0">Adicionar Produto</h1>
              </div>

              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div className="rounded-3 overflow-hidden bg-light" style={{ width: '200px', height: '200px' }}>
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Imagem do produto"
                        width={200}
                        height={200}
                        className="img-fluid"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Camera size={48} className="text-muted" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                    style={{ cursor: 'pointer' }}
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
                                className="form-control"
                                placeholder="Nome do produto"
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <textarea
                                className="form-control"
                                placeholder="Descrição do produto"
                                rows={3}
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
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                placeholder="Preço"
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
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantidade em estoque"
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Categoria"
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
                        name="variations"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Variações (separadas por vírgula)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-danger small" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
        </div>
      </div>
    </div>
  );
}