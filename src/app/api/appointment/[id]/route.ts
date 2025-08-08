import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

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

// Schema para validação de atualização de agendamento
const updateAppointmentSchema = z.object({
  clientName: z.string().min(1).optional(),
  clientPhone: z.string().min(1).optional(),
  clientEmail: z.string().email().optional().nullable(),
  serviceId: z.string().optional(),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  notes: z.string().optional().nullable(),
});

// GET: Obter um agendamento específico pelo ID
export async function GET(request: NextRequest, { params }: any) {
  try {
    const user = await getAuthenticatedUser(request);
    const id = params.id;

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o agendamento pelo ID
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        userId: user.id, // Garantir que o agendamento pertença ao usuário autenticado
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    // Verificar se o agendamento foi encontrado
    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Retornar o agendamento
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamento" },
      { status: 500 }
    );
  }
}

// PUT: Atualizar um agendamento existente
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

    // Validar os dados
    try {
      updateAppointmentSchema.parse(data);
    } catch (validationError: any) {
      console.error("Erro de validação:", validationError);
      return NextResponse.json(
        {
          error: "Dados de agendamento inválidos",
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

    // Se o serviceId foi alterado, verificar se o novo serviço existe
    if (data.serviceId && data.serviceId !== existingAppointment.serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: data.serviceId,
          userId: user.id,
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Serviço não encontrado ou não pertence a este usuário" },
          { status: 400 }
        );
      }
    }

    // Converter as datas de string para Date se necessário
    let updateData: any = { ...data };
    if (data.startTime && typeof data.startTime === "string") {
      updateData.startTime = new Date(data.startTime);
    }
    if (data.endTime && typeof data.endTime === "string") {
      updateData.endTime = new Date(data.endTime);
    }

    // Se as datas foram alteradas, verificar conflitos
    if (data.startTime || data.endTime) {
      const startTime = data.startTime
        ? typeof data.startTime === "string"
          ? new Date(data.startTime)
          : data.startTime
        : existingAppointment.startTime;

      const endTime = data.endTime
        ? typeof data.endTime === "string"
          ? new Date(data.endTime)
          : data.endTime
        : existingAppointment.endTime;

      // Verificar conflitos de horário
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          userId: user.id,
          id: { not: id }, // Excluir o agendamento atual
          status: {
            notIn: ["CANCELLED", "NO_SHOW"],
          },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
            {
              startTime: { gte: startTime, lte: endTime },
            },
            {
              endTime: { gte: startTime, lte: endTime },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "Este horário já está ocupado com outro agendamento" },
          { status: 409 }
        );
      }
    }

    // Atualizar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE: Cancelar um agendamento
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const user = await getAuthenticatedUser(request);
    const id = params.id;

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

    // Em vez de excluir fisicamente, marcar como cancelado
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      message: "Agendamento cancelado com sucesso",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento" },
      { status: 500 }
    );
  }
}
