// app/auth/products/catalog/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchIcon, Loader2, EditIcon, Plus } from 'lucide-react';

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
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Catálogo de Produtos</h1>
        <Link
          href="/product/addProduct"
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus size={18} />
          <span>Novo Produto</span>
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
          </form>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Grade de Produtos */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {products.map((product) => (
          <div key={product.id} className="col">
            <div className="card h-100 border-0 shadow-sm">
              {/* Imagem do Produto */}
              <div className="position-relative" style={{ height: '200px' }}>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="card-img-top"
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="card-body">
                <h5 className="card-title mb-2">{product.name}</h5>
                {product.description && (
                  <p className="card-text text-muted small mb-2">{product.description}</p>
                )}
                <p className="card-text fw-bold text-primary mb-2">
                  R$ {parseFloat(product.value).toFixed(2)}
                </p>
                <p className="card-text small mb-3">
                  <span className="text-muted">Em estoque: </span>
                  <span className="fw-medium">{product.stockQuantity}</span>
                </p>

                {/* Tags */}
                <div className="mb-3">
                  {product.category && (
                    <span className="badge bg-secondary me-2">{product.category}</span>
                  )}
                  {product.variations?.map((variation, index) => (
                    <span key={index} className="badge bg-light text-dark me-1">
                      {variation}
                    </span>
                  ))}
                </div>

                {/* Botão de Editar */}
                <Link
                  href={`/product/${product.id}/edit`}
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <EditIcon size={18} />
                  <span>Editar</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há produtos */}
      {!loading && products.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted mb-0">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}