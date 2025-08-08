"use client";

import React, { useState, useEffect } from 'react';
import { format, parse, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import AppointmentModal from '@/components/appointments/appointment-modal';

interface Appointment {
    id: string;
    clientName: string;
    clientPhone: string;
    serviceName: string;
    startTime: Date;
    endTime: Date;
    status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

// Horário comercial padrão (8:00 às 18:00)
const BUSINESS_HOURS = {
    start: 8,
    end: 18,
};

// Intervalo em horas
const HOUR_INTERVAL = 1;

export default function CalendarWeekPage(props: any) {
    const { params } = props;
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Modal de agendamento
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

    // Carregar a data da URL se disponível
    useEffect(() => {
        if (params?.date) {
            try {
                const date = new Date(params.date);
                if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                }
            } catch (e) {
                console.error("Data inválida na URL");
            }
        }

        // Calcular os dias da semana
        generateWeekDays();
    }, [params, selectedDate]);

    // Gerar os dias da semana a partir da data selecionada
    const generateWeekDays = () => {
        const start = startOfWeek(selectedDate, { locale: ptBR });
        const end = endOfWeek(selectedDate, { locale: ptBR });

        const days: Date[] = [];
        let day = start;

        while (day <= end) {
            days.push(new Date(day));
            day = addDays(day, 1);
        }

        setWeekDays(days);
        fetchAppointments(start, end);
    };

    // Buscar agendamentos para a semana
    const fetchAppointments = async (start: Date, end: Date) => {
        try {
            setIsLoading(true);
            setError(null);

            // Formatar as datas para consulta
            const startDate = format(start, 'yyyy-MM-dd');
            const endDate = format(end, 'yyyy-MM-dd');

            // Chamada para API (simulado)
            /*
            const response = await fetch(`/api/appointment?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
              throw new Error('Erro ao buscar agendamentos');
            }
            const data = await response.json();
            */

            // Simulação de dados
            const mockAppointments: Appointment[] = [];

            // Gerar alguns agendamentos aleatórios para cada dia da semana
            weekDays.forEach(day => {
                const numAppointments = Math.floor(Math.random() * 3) + 1; // 1 a 3 agendamentos por dia

                for (let i = 0; i < numAppointments; i++) {
                    const hour = Math.floor(Math.random() * (BUSINESS_HOURS.end - BUSINESS_HOURS.start)) + BUSINESS_HOURS.start;
                    const duration = [30, 60, 90][Math.floor(Math.random() * 3)]; // 30, 60 ou 90 minutos
                    const startTime = new Date(day);
                    startTime.setHours(hour, 0, 0);

                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + duration);

                    const serviceNames = ['Corte de Cabelo', 'Manicure', 'Pedicure', 'Hidratação', 'Barba'];
                    const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];

                    const clientNames = ['João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa', 'Carlos Pereira'];
                    const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];

                    const phones = ['(11) 98765-4321', '(11) 97654-3210', '(11) 96543-2109', '(11) 95432-1098'];
                    const clientPhone = phones[Math.floor(Math.random() * phones.length)];

                    const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;
                    const status = statuses[Math.floor(Math.random() * statuses.length)];

                    mockAppointments.push({
                        id: `${day.getTime()}-${i}`,
                        clientName,
                        clientPhone,
                        serviceName,
                        startTime,
                        endTime,
                        status,
                    });
                }
            });

            setAppointments(mockAppointments);
            setTimeout(() => {
                setIsLoading(false);
            }, 700); // Simulação de carregamento

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            setError('Erro ao carregar os agendamentos para esta semana');
            setIsLoading(false);
        }
    };

    // Navegar para a semana anterior
    const handlePreviousWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedDate(newDate);
    };

    // Navegar para a próxima semana
    const handleNextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedDate(newDate);
    };

    // Voltar para a semana atual
    const handleCurrentWeek = () => {
        setSelectedDate(new Date());
    };

    // Abrir modal para agendar em um horário específico
    const handleSelectSlot = (day: Date, hour: number) => {
        const date = new Date(day);
        date.setHours(hour, 0, 0);

        setSelectedSlot(date);
        setShowModal(true);
    };

    // Verificar se há agendamento em um horário específico
    const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
        return appointments.filter(appointment => {
            const appointmentHour = appointment.startTime.getHours();
            return isSameDay(appointment.startTime, day) && appointmentHour === hour;
        });
    };

    // Obter classe de estilo com base no status do agendamento
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-success';
            case 'CANCELLED':
                return 'bg-danger';
            case 'COMPLETED':
                return 'bg-primary';
            case 'NO_SHOW':
                return 'bg-warning';
            default:
                return 'bg-info';
        }
    };

    // Fechar o modal de agendamento
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSlot(null);
    };

    // Criar novo agendamento
    const handleCreateAppointment = async (appointmentData: any) => {
        try {
            // Chamada para a API
            const response = await fetch('/api/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar agendamento');
            }

            // Agendamento criado com sucesso
            setFeedback({
                type: 'success',
                message: 'Agendamento criado com sucesso!'
            });

            // Atualizar os horários
            generateWeekDays();

            // Limpar mensagem após alguns segundos
            setTimeout(() => setFeedback(null), 5000);

        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error);
            setFeedback({
                type: 'error',
                message: error.message || 'Erro ao criar agendamento'
            });

            // Rejeitar a Promise para que o modal saiba que houve erro
            throw error;
        }
    };

    // Gerar os horários para a grade
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour += HOUR_INTERVAL) {
            slots.push(hour);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="container-fluid py-4">
            {/* Feedback para o usuário */}
            {feedback && (
                <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-3`}>
                    {feedback.message}
                </div>
            )}

            <div className="card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h3 mb-1 fw-bold gradient-number">Agenda Semanal</h1>
                        <p className="text-muted mb-0">
                            {format(startOfWeek(selectedDate, { locale: ptBR }), "dd 'de' MMMM", { locale: ptBR })}
                            <ArrowRight size={14} className="mx-1" />
                            {format(endOfWeek(selectedDate, { locale: ptBR }), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>

                    {/* Navegação */}
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handlePreviousWeek}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleCurrentWeek}
                        >
                            Esta Semana
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleNextWeek}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <Link
                            href="/calendar"
                            className="btn btn-outline-secondary d-flex align-items-center gap-2 ms-2"
                        >
                            <CalendarIcon size={16} />
                            <span className="d-none d-md-inline">Calendário Completo</span>
                        </Link>
                    </div>
                </div>

                {/* Visualização da semana */}
                <div className="week-view-container">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p>Carregando agenda...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : (
                        <div className="week-schedule">
                            <div className="table-responsive">
                                <table className="table table-bordered week-calendar">
                                    <thead>
                                        <tr>
                                            <th className="time-column"></th>
                                            {weekDays.map((day, index) => (
                                                <th
                                                    key={index}
                                                    className={`text-center ${isToday(day) ? 'bg-light today-column' : ''}`}
                                                >
                                                    <div className="fw-bold">{format(day, 'EEEE', { locale: ptBR })}</div>
                                                    <div className={`${isToday(day) ? 'text-primary fw-bold' : ''}`}>
                                                        {format(day, 'dd/MM')}
                                                    </div>
                                                    <Link
                                                        href={`/calendar/day?date=${format(day, 'yyyy-MM-dd')}`}
                                                        className="d-block mt-1 small text-decoration-none"
                                                    >
                                                        Ver detalhes
                                                    </Link>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((hour, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td className="time-cell align-middle text-center">
                                                    {hour}:00
                                                </td>
                                                {weekDays.map((day, colIndex) => {
                                                    const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                                                    return (
                                                        <td
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={`schedule-cell position-relative ${isToday(day) ? 'today-column' : ''}`}
                                                            onClick={() => handleSelectSlot(day, hour)}
                                                        >
                                                            {dayAppointments.length > 0 ? (
                                                                dayAppointments.map((appointment, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`appointment-pill ${getStatusClass(appointment.status)} text-white p-1 rounded mb-1`}
                                                                        title={`${appointment.clientName} - ${appointment.serviceName}`}
                                                                    >
                                                                        <div className="small">{format(appointment.startTime, 'HH:mm')} - {appointment.clientName}</div>
                                                                        <div className="tiny">{appointment.serviceName}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="empty-slot" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Agendamento */}
            {showModal && selectedSlot && (
                <AppointmentModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    startDate={selectedSlot}
                    onSave={handleCreateAppointment}
                />
            )}

            <style jsx>{`
        .week-schedule {
          max-height: calc(100vh - 250px);
          overflow-y: auto;
        }
        
        .time-column {
          width: 80px;
          min-width: 80px;
        }
        
        .today-column {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .schedule-cell {
          height: 80px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .schedule-cell:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        
        .appointment-pill {
          font-size: 0.8rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .tiny {
          font-size: 0.7rem;
          opacity: 0.9;
        }
        
        .week-calendar th, .week-calendar td {
          padding: 0.5rem;
        }
      `}</style>
        </div>
    );
}
