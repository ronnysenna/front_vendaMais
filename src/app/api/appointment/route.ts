import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProtectedSession } from "@/lib/get-protected-session";

const appointmentSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  clientPhone: z.string().min(1, "Telefone do cliente é obrigatório"),
  clientEmail: z.string().email("Email inválido").optional().nullable(),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .default("SCHEDULED"),
  notes: z.string().optional().nullable(),
});

// GET: Listar agendamentos do usuário (com filtros)
export async function GET(req: NextRequest) {
  try {
    const session = await getProtectedSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parâmetros de filtro
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const serviceId = searchParams.get("serviceId");
    const clientName = searchParams.get("clientName");

    // Construir o filtro
    const filter: any = {
      userId: session.user.id,
    };

    // Adicionar filtros condicionais
    if (startDate || endDate) {
      filter.startTime = {};

      if (startDate) {
        filter.startTime.gte = new Date(startDate);
      }

      if (endDate) {
        filter.startTime.lte = new Date(endDate);
      }
    }

    if (status) {
      filter.status = status;
    }

    if (serviceId) {
      filter.serviceId = serviceId;
    }

    if (clientName) {
      filter.clientName = {
        contains: clientName,
        mode: "insensitive",
      };
    }

    // Buscar agendamentos com filtros
    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

// POST: Criar um novo agendamento
export async function POST(req: NextRequest) {
  try {
    const session = await getProtectedSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do corpo da requisição
    const data = await req.json();

    // Validar os dados
    try {
      appointmentSchema.parse(data);
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

    // Verificar se o serviço existe e pertence ao usuário
    const service = await prisma.service.findFirst({
      where: {
        id: data.serviceId,
        userId: session.user.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

    // Converter as datas de string para Date se necessário
    const startTime =
      typeof data.startTime === "string"
        ? new Date(data.startTime)
        : data.startTime;
    const endTime =
      typeof data.endTime === "string" ? new Date(data.endTime) : data.endTime;

    // Verificar se o horário já está ocupado
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: session.user.id,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        OR: [
          {
            // Novo agendamento começa durante um existente
            startTime: {
              lt: endTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // Novo agendamento termina durante um existente
            startTime: {
              lt: endTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // Novo agendamento engloba um existente
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
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

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        serviceId: data.serviceId,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || null,
        startTime: startTime,
        endTime: endTime,
        status: data.status || "SCHEDULED",
        notes: data.notes || null,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}
