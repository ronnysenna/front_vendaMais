import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Função auxiliar para verificar se o usuário está autenticado
async function getAuthenticatedUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    return session.user;
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return null;
  }
}

// GET: Obter um serviço específico pelo ID
export async function GET(request: NextRequest, { params }: any) {
  try {
    const user = await getAuthenticatedUser(request);
    const id = params.id;

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o serviço pelo ID
    const service = await prisma.service.findUnique({
      where: {
        id,
        userId: user.id, // Garantir que o serviço pertença ao usuário autenticado
      },
    });

    // Verificar se o serviço foi encontrado
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Retornar o serviço
    return NextResponse.json(service);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviço" },
      { status: 500 }
    );
  }
}

// PUT: Atualizar um serviço existente
export async function PUT(request: NextRequest, { params }: any) {
  try {
    const user = await getAuthenticatedUser(request);
    const id = params.id;

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter os dados do corpo da requisição
    const data = await request.json();

    // Verificar dados obrigatórios
    if (!data.name || !data.duration) {
      return NextResponse.json(
        { error: "Nome e duração são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

    // Atualizar o serviço
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price !== undefined ? parseFloat(data.price) : null,
        imageUrl: data.imageUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

// DELETE: Remover um serviço
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const user = await getAuthenticatedUser(request);
    const id = params.id;

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

    // Verificar se existem agendamentos associados a este serviço
    const appointmentCount = await prisma.appointment.count({
      where: {
        serviceId: id,
        // Opcionalmente, verificar apenas agendamentos futuros
        startTime: {
          gt: new Date(),
        },
      },
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir um serviço com agendamentos ativos" },
        { status: 400 }
      );
    }

    // Excluir o serviço
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Serviço excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao excluir serviço" },
      { status: 500 }
    );
  }
}
