import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProtectedSession } from "@/lib/get-protected-session";
import { cloudinary } from "@/lib/cloudinary";

const serviceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser positivo"),
  duration: z.number().int().min(1, "Duração deve ser positiva"),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
});

// GET: Listar serviços do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getProtectedSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}

// POST: Criar um novo serviço
export async function POST(req: NextRequest) {
  try {
    const session = await getProtectedSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Para multipart form data
    const formData = await req.formData();

    // Converter os campos do formulário para o formato do schema
    const serviceData: any = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      price: Number(formData.get("price")) || 0,
      duration: Number(formData.get("duration")) || 60,
      category: (formData.get("category") as string) || undefined,
    };

    // Validar os dados
    try {
      serviceSchema.parse(serviceData);
    } catch (validationError) {
      console.error("Erro de validação:", validationError);
      return NextResponse.json(
        { error: "Dados de serviço inválidos" },
        { status: 400 }
      );
    }

    // Upload da imagem, se fornecida
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const result = await cloudinary.uploader.upload(
          `data:${imageFile.type};base64,${base64Image}`,
          {
            folder: "agenda-ai/services",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
          }
        );

        serviceData.imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Erro ao fazer upload da imagem:", uploadError);
        return NextResponse.json(
          { error: "Erro ao fazer upload da imagem" },
          { status: 500 }
        );
      }
    }

    // Criar o serviço no banco de dados
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}
