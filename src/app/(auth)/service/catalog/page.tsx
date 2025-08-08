"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, EditIcon, Plus, AlertCircle, Clock } from "lucide-react";

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number; // duração em minutos
    imageUrl?: string;
    category?: string;
}

export default function ServicesCatalogPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const N8N_SEARCH_SERVICES_WEBHOOK_URL =
        "https://n8n.ronnysenna.com.br/webhook/buscar-servicos";

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setServices([]);

        try {
            const response = await fetch(N8N_SEARCH_SERVICES_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchTerm: searchTerm.trim() }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar serviços: ${response.statusText}`);
            }

            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error("Erro:", error);
            setError(
                error instanceof Error ? error.message : "Erro ao buscar serviços",
            );
        } finally {
            setLoading(false);
        }
    };

    // Função para formatar duração
    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0
                ? `${hours}h ${remainingMinutes}min`
                : `${hours}h`;
        }
    };

    return (
        <div className="container-fluid py-4">
            {error && (
                <div className="profile-feedback error d-flex align-items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="profile-card">
                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                        <div>
                            <h1 className="h3 mb-1 fw-bold gradient-number">
                                Catálogo de Serviços
                            </h1>
                            <p className="text-muted mb-0">
                                Gerencie seus serviços e horários
                            </p>
                        </div>
                        <Link
                            href="/service/addService"
                            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 hover-scale"
                        >
                            <Plus size={18} />
                            <span>Novo Serviço</span>
                        </Link>
                    </div>

                    <div className="card-status-info p-3 rounded-3 mb-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch();
                            }}
                        >
                            <div className="profile-form-group mb-0">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control profile-form-control"
                                        placeholder="Digite o nome do serviço, categoria ou descrição..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary d-flex align-items-center gap-2 hover-scale"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                >
                                                    <span className="visually-hidden">Carregando...</span>
                                                </div>
                                                <span>Buscando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <SearchIcon size={18} />
                                                <span>Buscar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p className="text-muted mb-0">Buscando serviços...</p>
                        </div>
                    ) : services.length > 0 ? (
                        <div className="row g-4">
                            {services.map((service) => (
                                <div key={service.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 product-card hover-scale-sm">
                                        <div className="ratio ratio-16x9 rounded-top overflow-hidden">
                                            {service.imageUrl ? (
                                                <Image
                                                    src={service.imageUrl}
                                                    alt={service.name}
                                                    width={300}
                                                    height={200}
                                                    className="object-fit-cover"
                                                />
                                            ) : (
                                                <div className="bg-light d-flex align-items-center justify-content-center">
                                                    <span className="text-muted">Sem imagem</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title mb-2">{service.name}</h5>
                                            {service.description && (
                                                <p className="text-muted small mb-2">
                                                    {service.description}
                                                </p>
                                            )}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="gradient-number h5 mb-0">
                                                    R$ {service.price?.toFixed(2)}
                                                </span>
                                                <div className="d-flex align-items-center gap-1 text-muted">
                                                    <Clock size={16} />
                                                    <span>{formatDuration(service.duration)}</span>
                                                </div>
                                            </div>
                                            {service.category && (
                                                <div className="mb-3">
                                                    <span className="badge bg-secondary">
                                                        {service.category}
                                                    </span>
                                                </div>
                                            )}
                                            <Link
                                                href={`/service/${service.id}/editService`}
                                                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 hover-scale"
                                            >
                                                <EditIcon size={18} />
                                                <span>Editar Serviço</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading &&
                        searchTerm && (
                            <div className="text-center p-5">
                                <div className="icon-glass rounded-circle p-3 d-inline-flex mb-3">
                                    <SearchIcon size={24} className="text-muted" />
                                </div>
                                <h5>Nenhum serviço encontrado</h5>
                                <p className="text-muted mb-0">
                                    Tente buscar com outros termos
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
