// app/auth/products/catalog/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchIcon, Loader2, EditIcon, Plus, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  value: string;
  stockQuantity: string;
  imageUrl?: string;
  variations?: string[];
  category?: string;
}

export default function ProductsCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const N8N_SEARCH_PRODUCTS_WEBHOOK_URL = 'https://n8n.ronnysenna.com.br/webhook/buscar-produtos';

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch(N8N_SEARCH_PRODUCTS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchTerm.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar produtos');
    } finally {
      setLoading(false);
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
              <h1 className="h3 mb-1 fw-bold gradient-number">Catálogo de Produtos</h1>
              <p className="text-muted mb-0">Gerencie seus produtos e estoque</p>
            </div>
            <Link
              href="/product/addProduct"
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2 hover-scale"
            >
              <Plus size={18} />
              <span>Novo Produto</span>
            </Link>
          </div>

          <div className="card-status-info p-3 rounded-3 mb-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="profile-form-group mb-0">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control profile-form-control"
                    placeholder="Digite o nome do produto, categoria ou descrição..."
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
                        <div className="spinner-border spinner-border-sm" role="status">
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
              <p className="text-muted mb-0">Buscando produtos...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="row g-4">
              {products.map((product) => (
                <div key={product.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 product-card hover-scale-sm">
                    <div className="ratio ratio-16x9 rounded-top overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
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
                      <h5 className="card-title mb-2">{product.name}</h5>
                      {product.description && (
                        <p className="text-muted small mb-2">{product.description}</p>
                      )}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="gradient-number h5 mb-0">R$ {product.value}</span>
                        <span className="badge bg-info">Estoque: {product.stockQuantity}</span>
                      </div>
                      {product.category && (
                        <div className="mb-3">
                          <span className="badge bg-secondary">{product.category}</span>
                        </div>
                      )}
                      <Link
                        href={`/product/${product.id}/editProduct`}
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 hover-scale"
                      >
                        <EditIcon size={18} />
                        <span>Editar Produto</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && searchTerm && (
            <div className="text-center p-5">
              <div className="icon-glass rounded-circle p-3 d-inline-flex mb-3">
                <SearchIcon size={24} className="text-muted" />
              </div>
              <h5>Nenhum produto encontrado</h5>
              <p className="text-muted mb-0">Tente buscar com outros termos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}