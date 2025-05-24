// app/auth/products/[productId]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation'; // Hook para pegar parâmetros da URL

// Defina a interface para o tipo de produto que você espera do seu backend
interface Product {
  id: string;
  name: string;
  description?: string;
  value: string;
  stockQuantity: string;
  variations: string[]; // Espera um array de strings
  category: string;
  imageUrl?: string;
}

// **SEU WEBHOOK N8N PARA BUSCAR UM ÚNICO PRODUTO**
// Este webhook deve receber um productId e retornar os dados completos do produto
const N8N_GET_PRODUCT_WEBHOOK_URL = 'https://n8n.ronnysenna.com.br/webhook/buscar-produto-por-id'; // Substitua pelo seu URL real

// **SEU WEBHOOK N8N PARA ATUALIZAR PRODUTO**
// Este webhook deve receber productId e os dados atualizados do produto
const N8N_UPDATE_PRODUCT_WEBHOOK_URL = 'https://n8n.ronnysenna.com.br/webhook/atualizar-produto'; // Substitua pelo seu URL real

// **SEU API ROUTE DO NEXT.JS PARA UPLOAD DE IMAGEM NO CLOUDINARY**
const NEXTJS_IMAGE_UPLOAD_API = '/api/upload'; // O mesmo que você usa para adicionar

export default function EditProductPage() {
  const params = useParams();
  const productId = params.productId as string; // Pega o ID do produto da URL

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para o estado do botão de submit
  const [productImage, setProductImage] = useState<File | null>(null); // Novo arquivo de imagem selecionado
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null); // Pré-visualização da imagem
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Efeito para buscar os dados do produto ao carregar a página
  useEffect(() => {
    if (!productId) return; // Garante que o ID exista

    const fetchProduct = async () => {
      setLoadingInitialData(true);
      setError(null);
      try {
        const response = await fetch(N8N_GET_PRODUCT_WEBHOOK_URL, {
          method: 'POST', // ou GET, dependendo da sua API n8n
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar produto: ${response.statusText}`);
        }
        const data = await response.json();

        // Assumindo que seu webhook retorna { product: {...} } e as variações como string[]
        if (data && data.product) {
          setProduct({
            ...data.product,
            // Certifique-se de que 'variations' é um array de strings e converta para string separada por vírgulas para o textarea
            variations: Array.isArray(data.product.variations) ? data.product.variations.join(', ') : '',
            // Valor e estoque podem precisar de tratamento se vierem como number e você os quer como string para o input
            value: String(data.product.value),
            stockQuantity: String(data.product.stockQuantity),
          });
          setPreviewImageUrl(data.product.imageUrl || null); // Define a pré-visualização com a imagem existente
        } else {
          setError("Produto não encontrado.");
          setProduct(null);
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(`Não foi possível carregar o produto. Erro: ${err instanceof Error ? err.message : String(err)}`);
        setProduct(null);
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchProduct();
  }, [productId, N8N_GET_PRODUCT_WEBHOOK_URL]); // Roda quando productId ou o URL do webhook mudar

  // Funções de manipulação de estado do formulário (replicadas do Adicionar Produto)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProduct(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleValueOrStockChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'value' | 'stockQuantity') => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') { // Para value, permite ponto decimal
      setProduct(prev => prev ? { ...prev, [field]: value } : null);
    } else if (field === 'stockQuantity' && /^\d*$/.test(value) || value === '') { // Para stockQuantity, apenas dígitos
      setProduct(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      setPreviewImageUrl(URL.createObjectURL(file)); // Pré-visualização da nova imagem
    } else {
      setProductImage(null);
      // Se o usuário limpar o input file, mas não havia imagem original, o preview deve sumir
      // Se havia imagem original, o preview deve voltar para ela.
      // Simplificado: se o input for limpo, o preview também é.
      setPreviewImageUrl(product?.imageUrl || null); // Volta para a imagem original se houver
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!productImage) return product?.imageUrl || null; // Se não houver novo arquivo, retorna a URL existente

    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', productImage);

    try {
      const response = await fetch(NEXTJS_IMAGE_UPLOAD_API, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload da imagem.');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      setErrorMessage(`Erro no upload da imagem: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      setIsSubmitting(false); // Será definido como false novamente no handleSubmit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!product) { // Não deveria acontecer se o produto for carregado
      setErrorMessage("Dados do produto não carregados.");
      setIsSubmitting(false);
      return;
    }

    // Validação
    if (!product.name.trim() || !product.value.trim() || !product.stockQuantity.trim() || !product.variations.toString().trim() || !product.category.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    let updatedImageUrl: string | null = product.imageUrl || null;
    if (productImage) { // Se um novo arquivo de imagem foi selecionado
      updatedImageUrl = await handleImageUpload();
      if (!updatedImageUrl) {
        setIsSubmitting(false);
        return; // Parar se o upload da imagem falhou
      }
    } else if (previewImageUrl === null && product.imageUrl) {
        // Se o usuário limpou a imagem e não tinha uma prévia, e havia uma URL original
        // Isso pode significar que a imagem deve ser removida.
        // Se a API do WooCommerce aceitar null/vazio para remover imagens, pode ser feito aqui.
        // Por simplicidade, vou manter a imagem original se o preview for null mas imageUrl não for.
        // Se você quiser remover a imagem, a lógica aqui precisaria ser mais explícita.
        updatedImageUrl = null; // Assume que a imagem deve ser removida
    }


    try {
      const response = await fetch(N8N_UPDATE_PRODUCT_WEBHOOK_URL, {
        method: 'POST', // ou PATCH se seu webhook n8n for configurado assim
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId, // Envia o ID do produto que está sendo editado
          name: product.name.trim(),
          description: product.description?.trim(),
          value: product.value.trim(),
          stockQuantity: product.stockQuantity.trim(),
          variations: product.variations.toString().split(',').map(v => v.trim()), // Garante que variações seja um array
          category: product.category.trim(),
          imageUrl: updatedImageUrl,
          // userId: MOCK_USER_ID, // Se você precisar vincular o produto ao usuário
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar produto.');
      }

      setSuccessMessage('Produto atualizado com sucesso!');
      // Não limpa o formulário, mas pode recarregar os dados do produto do backend
      // para garantir que a UI reflita o estado mais recente (ex: URL final da imagem)
      // fetchProduct(); // Pode chamar fetchProduct novamente aqui se quiser.

    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setErrorMessage(`Não foi possível atualizar o produto. Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loadingInitialData) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-white flex justify-center items-center h-48">
        <Loader2 className="h-12 w-12 animate-spin text-[#fba931]" />
        <p className="ml-4 text-xl">Carregando produto...</p>
      </div>
    );
  }

  if (errorMessage && !product) { // Mostra erro se não conseguiu carregar o produto
    return (
      <div className="max-w-xl mx-auto mt-10 text-white text-center">
        <p className="text-red-500 text-lg">{errorMessage}</p>
        <p className="text-gray-400 mt-2">Verifique o ID do produto ou tente novamente.</p>
      </div>
    );
  }

  if (!product) { // Caso não encontre o produto e não haja erro específico
    return (
      <div className="max-w-xl mx-auto mt-10 text-white text-center">
        <p className="text-gray-400 text-lg">Produto não encontrado.</p>
      </div>
    );
  }

  // Formulário de Edição
  return (
    <div className="max-w-xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg text-center">

        <h3 className="text-3xl font-bold mb-6 text-[#fba931]">Editar Produto</h3>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Nome do Produto */}
          <div>
            <label htmlFor="name" className="block text-left mb-1 text-[#fba931] font-medium">Nome do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: Camiseta Básica"
              value={product.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Descrição do Produto */}
          <div>
            <label htmlFor="description" className="block text-left mb-1 text-[#fba931] font-medium">Descrição do Produto (Opcional)</label>
            <textarea
              id="description"
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400 resize-y"
              placeholder="Ex: Camiseta 100% algodão, disponível em P, M, G."
              value={product.description || ''} // Usar '' para evitar undefined
              onChange={handleChange}
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Valor do Produto */}
          <div>
            <label htmlFor="value" className="block text-left mb-1 text-[#fba931] font-medium">Valor do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="value"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: 59.90 (use ponto como separador decimal)"
              value={product.value}
              onChange={(e) => handleValueOrStockChange(e, 'value')}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Quantidade em Estoque */}
          <div>
            <label htmlFor="stockQuantity" className="block text-left mb-1 text-[#fba931] font-medium">Quantidade em Estoque <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="stockQuantity"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: 100"
              value={product.stockQuantity}
              onChange={(e) => handleValueOrStockChange(e, 'stockQuantity')}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Variações */}
          <div>
            <label htmlFor="variations" className="block text-left mb-1 text-[#fba931] font-medium">Variações <span className="text-red-500">*</span></label>
            <textarea
              id="variations"
              rows={2}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400 resize-y"
              placeholder="Ex: P, M, G, GG (separe por vírgulas)"
              value={Array.isArray(product.variations) ? product.variations.join(', ') : product.variations || ''} // Converte array para string, ou mantém string
              onChange={handleChange}
              disabled={isSubmitting}
              required
            ></textarea>
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="category" className="block text-left mb-1 text-[#fba931] font-medium">Categoria <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="category"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: Camisetas, Acessórios, Eletrônicos"
              value={product.category}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Imagem do Produto */}
          <div>
            <label htmlFor="productImage" className="block text-left mb-1 text-[#fba931] font-medium">Imagem do Produto (Opcional)</label>
            <input
              type="file"
              id="productImage"
              accept="image/*"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fba931] file:text-gray-900 hover:file:bg-[#e09a2d] focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
            {previewImageUrl && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={previewImageUrl}
                  alt="Pré-visualização do Produto"
                  width={150}
                  height={150}
                  className="rounded-md object-cover border-2 border-yellow-500"
                />
              </div>
            )}
            {/* Botão para remover imagem, se desejar */}
            {product.imageUrl && !productImage && ( // Mostra botão se há imagem original e nenhuma nova foi selecionada
              <button
                type="button"
                className="mt-2 text-red-500 text-sm hover:underline"
                onClick={() => {
                  setProduct(prev => prev ? { ...prev, imageUrl: undefined } : null); // Remove do estado
                  setPreviewImageUrl(null); // Limpa a prévia
                }}
              >
                Remover imagem atual
              </button>
            )}
          </div>

          {/* Mensagens de feedback */}
          {successMessage && (
            <p className="text-green-500 font-bold mt-4">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 font-bold mt-4">{errorMessage}</p>
          )}

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#fba931] text-gray-900 font-bold rounded-lg shadow-md hover:bg-[#e09a2d] focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                Atualizando Produto...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}