// app/auth/products/catalog/page.tsx
'use client';

import { useState } from 'react';
// Importe o Link do Next.js para navegação entre páginas
import Link from 'next/link'; // <--- Importação adicionada
import { SearchIcon, Loader2, EditIcon } from 'lucide-react'; // <--- EditIcon já importado, ótimo!
import Image from 'next/image'; // <--- Importação já existente, ótimo!

// Defina a interface para o tipo de produto que você espera do seu backend
interface Product {
  id: string; // O ID do produto é crucial para a edição
  name: string;
  description?: string;
  value: string; // Ou number, dependendo como você lida com valores
  stockQuantity: string; // Ou number
  imageUrl?: string;
  // Se o backend também retornar variações e categoria na pesquisa, adicione-os aqui:
  variations?: string[]; // Por exemplo, se forem strings separadas por vírgula no DB, seu webhook deve converter para array
  category?: string;
}

export default function ProductsCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // **SEU WEBHOOK N8N PARA PESQUISA DE PRODUTOS**
  const N8N_SEARCH_PRODUCTS_WEBHOOK_URL = 'https://n8n.ronnysenna.com.br/webhook/buscar-produtos'; // Substitua pelo seu URL real

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setProducts([]); // Limpa produtos anteriores

    try {
      const response = await fetch(N8N_SEARCH_PRODUCTS_WEBHOOK_URL, {
        method: 'POST', // Geralmente POST para pesquisas com corpo de requisição
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchTerm.trim() }), // Envia o termo de busca para o backend
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
      }

      const data = await response.json();
      // Verifique se a resposta do seu webhook n8n retorna um array de produtos.
      // O n8n pode retornar a resposta em diferentes formatos, ajuste aqui se necessário.
      // Assumindo que seu webhook retorna { products: [...] }
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]); // Se não for um array válido, não mostra nada
        setError("Formato de resposta inesperado do backend.");
      }

    } catch (err) {
      console.error('Erro na pesquisa de produtos:', err);
      setError(`Não foi possível buscar os produtos. Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg text-center">

        <h3 className="text-3xl font-bold mb-6 text-[#fba931]">Catálogo de Produtos</h3>

        <div className="w-full mb-6 flex gap-2">
          <input
            type="text"
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
            placeholder="Pesquisar produto por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { // Permite pesquisar ao apertar Enter
                if (e.key === 'Enter') handleSearch();
            }}
            disabled={loading}
          />
          <button
            className="p-3 bg-[#fba931] text-gray-900 font-bold rounded-lg shadow-md hover:bg-[#e09a2d] focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon size={20} />
            )}
          </button>
        </div>

        {loading && (
          <div className="flex items-center text-[#fba931] my-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Buscando produtos...</span>
          </div>
        )}

        {error && (
          <p className="text-red-500 my-4">{error}</p>
        )}

        {!loading && !error && products.length === 0 && searchTerm && (
          <p className="text-gray-400 my-4">Nenhum produto encontrado para &quot;{searchTerm}&quot;.</p>
        )}

        {!loading && !error && products.length === 0 && !searchTerm && (
          <p className="text-gray-400 my-4">Digite um termo para pesquisar produtos.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="w-full text-left space-y-4 mt-6">
            <h4 className="text-xl font-semibold text-[#fba931] mb-4">Resultados:</h4>
            {products.map((product) => (
              // Adicionado flex-col para o conteúdo e alinhamento no final, e espaço entre o texto e o botão
              <div key={product.id} className="bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 flex flex-col sm:flex-row sm:items-center gap-4">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover flex-shrink-0" // flex-shrink-0 para evitar que a imagem encolha
                  />
                )}
                <div className="flex-grow"> {/* flex-grow para ocupar o espaço disponível */}
                  <p className="text-lg font-bold text-white">{product.name}</p>
                  {product.description && <p className="text-gray-300 text-sm">{product.description}</p>}
                  <p className="text-yellow-400 font-semibold">Valor: R$ {product.value}</p>
                  <p className="text-gray-400 text-sm">Estoque: {product.stockQuantity}</p>
                  {/* Se você adicionar variações e categoria à interface Product, pode exibi-los aqui */}
                  {product.category && <p className="text-gray-400 text-sm">Categoria: {product.category}</p>}
                  {product.variations && product.variations.length > 0 && (
                    <p className="text-gray-400 text-sm">Variações: {product.variations.join(', ')}</p>
                  )}
                </div>
                {/* Botão de Edição */}
                <Link
                  href={`/product/${product.id}/editProduct`} // Caminho para a página de edição com o ID do produto
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1 sm:self-end mt-2 sm:mt-0" // Ajustes de estilo
                >
                  <EditIcon size={16} /> Editar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}