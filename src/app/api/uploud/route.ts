// app/api/upload/route.ts
// Importações necessárias
import { NextResponse } from 'next/server';
// Importe seu objeto cloudinary configurado.
// Pelo seu código, parece que você tem uma configuração global em `@/lib/cloudinary`.
// Isso é ótimo! Use-o.
import { cloudinary } from "@/lib/cloudinary"; // Assumindo que seu 'cloudinary' está exportado assim

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File; // O nome 'file' é o que o frontend envia

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo de imagem foi enviado.' }, { status: 400 });
    }

    // Você pode adicionar validação de tipo de arquivo/tamanho aqui
    // Ex: const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    // if (file.size > MAX_FILE_SIZE) { ... }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para o Cloudinary
    // Use a pasta que deseja para as imagens de produto.
    // Mude 'vendaMais_products' se quiser outra.
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "vendaMais_products" }, (error, result) => { // Pasta específica para produtos
          if (error || !result) {
            console.error("Erro no Cloudinary:", error);
            return reject(new Error(`Falha no upload para o Cloudinary: ${error?.message || 'Erro desconhecido.'}`));
          }
          resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });

  } catch (error) {
    console.error('Erro na API de upload:', error);
    return NextResponse.json({ message: `Erro interno do servidor ao fazer upload da imagem. Detalhes: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}