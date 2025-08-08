"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, ArrowLeft, Clock, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

const schema = z.object({
    name: z.string().min(1, "Nome do serviço é obrigatório"),
    description: z.string().optional(),
    price: z.string().min(1, "Preço é obrigatório"),
    duration: z.string().min(1, "Duração é obrigatória"),
    category: z.string().optional(),
    image: z.any().optional(),
});

type ServiceFormData = z.infer<typeof schema>;

interface Service {
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    duration: number;
    category?: string | null;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function EditServicePage(props: any) {
    const { params } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const router = useRouter();

    const form = useForm<ServiceFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            duration: "",
            category: "",
        },
    });

    // Buscar dados do serviço
    useEffect(() => {
        const fetchService = async () => {
            setIsFetching(true);
            setError(null);

            try {
                const response = await fetch(`/api/service/${params.id}`);

                if (!response.ok) {
                    throw new Error("Serviço não encontrado");
                }

                const data = await response.json();
                setService(data);

                // Preencher o formulário com os dados
                form.reset({
                    name: data.name,
                    description: data.description || "",
                    price: data.price?.toString() || "",
                    duration: data.duration?.toString() || "",
                    category: data.category || "",
                });

                // Exibir a imagem se existir
                if (data.imageUrl) {
                    setPreviewUrl(data.imageUrl);
                }
            } catch (error) {
                console.error("Erro ao carregar serviço:", error);
                setError("Não foi possível carregar os dados do serviço");
            } finally {
                setIsFetching(false);
            }
        };

        fetchService();
    }, [params.id, form]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue("image", file);
        }
    };

    const onSubmit = async (data: ServiceFormData) => {
        setIsLoading(true);
        setFeedbackMessage(null);

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    formData.append(key, value);
                }
            });

            const response = await fetch(`/api/service/${params.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) throw new Error("Erro ao atualizar serviço");

            setFeedbackMessage({
                type: "success",
                text: "Serviço atualizado com sucesso!"
            });

            setTimeout(() => {
                router.push("/service/catalog");
            }, 2000);

        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            setFeedbackMessage({
                type: "error",
                text: "Erro ao atualizar serviço. Tente novamente."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        // Confirmação antes de excluir
        if (!window.confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.")) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/service/${params.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.appointmentsCount) {
                    throw new Error(`Este serviço possui ${data.appointmentsCount} agendamentos e não pode ser excluído.`);
                }
                throw new Error("Erro ao excluir serviço");
            }

            setFeedbackMessage({
                type: "success",
                text: "Serviço excluído com sucesso!"
            });

            setTimeout(() => {
                router.push("/service/catalog");
            }, 2000);

        } catch (error: any) {
            console.error("Erro ao excluir serviço:", error);
            setFeedbackMessage({
                type: "error",
                text: error.message || "Erro ao excluir serviço"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="container py-4">
                <div className="card product-form-card p-5 text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mb-0">Carregando dados do serviço...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="card product-form-card p-4">
                    <div className="alert alert-danger d-flex align-items-center">
                        <AlertCircle size={20} className="me-2" />
                        {error}
                    </div>
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => router.push("/service/catalog")}
                        >
                            Voltar para o catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {feedbackMessage && (
                <div className={`alert ${feedbackMessage.type === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center mb-3`}>
                    {feedbackMessage.type === "success" ? (
                        <CheckCircle size={20} className="me-2" />
                    ) : (
                        <AlertCircle size={20} className="me-2" />
                    )}
                    {feedbackMessage.text}
                </div>
            )}

            <div className="card product-form-card p-4">
                <div className="d-flex align-items-center mb-4">
                    <button
                        type="button"
                        className="back-button bg-transparent border-0"
                        onClick={() => router.push("/service/catalog")}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="h3 mb-0 ms-3">Editar Serviço</h1>
                </div>

                <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <div
                                className="image-upload-area d-flex align-items-center justify-content-center"
                                style={{ width: "200px", height: "200px" }}
                            >
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Imagem do serviço"
                                        width={200}
                                        height={200}
                                        className="rounded-3 object-fit-cover w-100 h-100"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Camera size={48} className="text-muted mb-2" />
                                        <p className="small text-muted mb-0">
                                            Clique para adicionar uma imagem
                                        </p>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageChange}
                        />
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
                                        <label className="form-label">Nome do Serviço</label>
                                        <FormControl>
                                            <input
                                                type="text"
                                                className="product-form-input w-100"
                                                placeholder="Digite o nome do serviço"
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
                                                placeholder="Digite a descrição do serviço"
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
                                name="price"
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
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="form-label">Duração (minutos)</label>
                                        <FormControl>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="product-form-input w-100"
                                                    placeholder="60"
                                                    min="5"
                                                    {...field}
                                                />
                                                <span className="input-group-text">
                                                    <Clock size={16} />
                                                </span>
                                            </div>
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

                        <div className="col-12 mt-4 d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-outline-danger d-flex align-items-center gap-2"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Excluindo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        <span>Excluir Serviço</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Atualizando...</span>
                                    </>
                                ) : (
                                    "Salvar Alterações"
                                )}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
