// app/auth/products/add/page.tsx
'use client';

import { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';

// **SEU WEBHOOK N8N PARA ADICIONAR PRODUTO**
const N8N_ADD_PRODUCT_WEBHOOK_URL = 'https://n8n-fluxo-n8n.exzgdz.easypanel.host/webhook/venda+'; // Substitua pelo seu URL real
// **SEU API ROUTE DO NEXT.JS PARA UPLOAD DE IMAGEM NO CLOUDINARY**
const NEXTJS_IMAGE_UPLOAD_API = '/api/uploud'; // Você precisa criar este API Route

export default function AddProductPage() {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productValue, setProductValue] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [variations, setVariations] = useState(''); // Novo estado para Variações
  const [category, setCategory] = useState('');     // Novo estado para Categoria
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file)); // Pré-visualização da imagem
    } else {
      setProductImage(null);
      setProductImageUrl(null);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!productImage) return null;

    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', productImage); // 'file' deve ser o nome que seu API Route espera

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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validação básica
    if (!productName.trim() || !productValue.trim() || !stockQuantity.trim() || !variations.trim() || !category.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    let uploadedImageUrl: string | null = productImageUrl;
    if (productImage) {
      uploadedImageUrl = await handleImageUpload();
      if (!uploadedImageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(N8N_ADD_PRODUCT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName.trim(),
          description: productDescription.trim(),
          value: productValue.trim(),
          stockQuantity: stockQuantity.trim(),
          variations: variations.trim().split(',').map(v => v.trim()), // Transforma variações em array de strings
          category: category.trim(),
          imageUrl: uploadedImageUrl,
          // userId: MOCK_USER_ID, // Se você precisar vincular o produto ao usuário
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar produto.');
      }

      setSuccessMessage('Produto adicionado com sucesso!');
      // Limpar formulário após o sucesso
      setProductName('');
      setProductDescription('');
      setProductValue('');
      setStockQuantity('');
      setVariations(''); // Limpa variações
      setCategory('');    // Limpa categoria
      setProductImage(null);
      setProductImageUrl(null);

    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      setErrorMessage(`Não foi possível adicionar o produto. Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg text-center">

        <h3 className="text-3xl font-bold mb-6 text-[#fba931]">Adicionar Produto</h3>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Nome do Produto */}
          <div>
            <label htmlFor="productName" className="block text-left mb-1 text-[#fba931] font-medium">Nome do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="productName"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: Camiseta Básica"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Descrição do Produto */}
          <div>
            <label htmlFor="productDescription" className="block text-left mb-1 text-[#fba931] font-medium">Descrição do Produto (Opcional)</label>
            <textarea
              id="productDescription"
              rows={3}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400 resize-y"
              placeholder="Ex: Camiseta 100% algodão, disponível em P, M, G."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>

                    {/* NOVO CAMPO: Variações */}
          <div>
            <label htmlFor="variations" className="block text-left mb-1 text-[#fba931] font-medium">Variações <span className="text-red-500">*</span></label>
            <textarea
              id="variations"
              rows={2}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400 resize-y"
              placeholder="Ex: P, M, G, GG (separe por vírgulas)"
              value={variations}
              onChange={(e) => setVariations(e.target.value)}
              disabled={loading}
              required
            ></textarea>
          </div>

          {/* NOVO CAMPO: Categoria */}
          <div>
            <label htmlFor="category" className="block text-left mb-1 text-[#fba931] font-medium">Categoria <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="category"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: Camisetas, Acessórios, Eletrônicos"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Valor do Produto */}
          <div>
            <label htmlFor="productValue" className="block text-left mb-1 text-[#fba931] font-medium">Valor do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="productValue"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
              placeholder="Ex: 59.90 (use ponto como separador decimal)"
              value={productValue}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value) || value === '') {
                  setProductValue(value);
                }
              }}
              disabled={loading}
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
              value={stockQuantity}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) || value === '') {
                  setStockQuantity(value);
                }
              }}
              disabled={loading}
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
              disabled={loading}
            />
            {productImageUrl && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={productImageUrl}
                  alt="Pré-visualização do Produto"
                  width={150}
                  height={150}
                  className="rounded-md object-cover border-2 border-yellow-500"
                />
              </div>
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
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                Adicionando Produto...
              </>
            ) : (
              "Adicionar Produto"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}