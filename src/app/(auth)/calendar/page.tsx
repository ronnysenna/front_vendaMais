"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';
import { Plus, Settings, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Calendar as CalendarIcon, List, Calendar as DayIcon, Calendar as WeekIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppointmentModal from '@/components/appointments/appointment-modal';

// Localização para português
const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Mensagens customizadas em português
const messages = {
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há agendamentos neste período.',
    allDay: 'Dia todo',
    showMore: (total: number) => `+${total} mais`,
};

// Tipos de eventos
interface AppointmentEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource?: {
        clientName: string;
        clientPhone: string;
        serviceName: string;
        status: string;
    };
}

export default function CalendarPage() {
    const router = useRouter();
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<AppointmentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Estado para controlar o modal de novo agendamento
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, [date]);

    // Buscar agendamentos da API
    const fetchAppointments = async () => {
        try {
            setIsLoading(true);

            // Calcular intervalo de datas para a consulta com base na visualização atual
            let startDate = new Date(date);
            let endDate = new Date(date);

            if (view === Views.MONTH) {
                startDate.setDate(1);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
            } else if (view === Views.WEEK) {
                const start = startOfWeek(date, { locale: ptBR });
                startDate = new Date(start);
                endDate = new Date(start);
                endDate.setDate(endDate.getDate() + 6);
            } else {
                // No modo dia, apenas pegamos o dia atual
            }

            // Construir a URL com os parâmetros de consulta
            const queryParams = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            // Simulação - deve ser substituído pela chamada API real
            // const response = await fetch(`/api/appointment?${queryParams}`);
            // const data = await response.json();

            // Dados de exemplo para teste
            const mockEvents: AppointmentEvent[] = [
                {
                    id: '1',
                    title: 'Corte de Cabelo - João',
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
                    end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
                    resource: {
                        clientName: 'João Silva',
                        clientPhone: '(11) 98765-4321',
                        serviceName: 'Corte de Cabelo',
                        status: 'CONFIRMED',
                    },
                },
                {
                    id: '2',
                    title: 'Manicure - Maria',
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0),
                    end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 30),
                    resource: {
                        clientName: 'Maria Oliveira',
                        clientPhone: '(11) 91234-5678',
                        serviceName: 'Manicure',
                        status: 'SCHEDULED',
                    },
                },
            ];

            setTimeout(() => {
                setEvents(mockEvents);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            setIsLoading(false);
            setFeedback({
                type: 'error',
                message: 'Erro ao carregar os agendamentos. Tente novamente.'
            });

            // Limpar mensagem após alguns segundos
            setTimeout(() => setFeedback(null), 5000);
        }
    };

    // Função para criar novo agendamento
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

            // Atualizar a lista de agendamentos
            fetchAppointments();

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

    // Função para renderizar os eventos customizados
    const eventPropGetter = (event: AppointmentEvent) => {
        let backgroundColor = '#4F46E5'; // cor padrão

        if (event.resource?.status === 'CONFIRMED') {
            backgroundColor = '#10B981'; // verde para confirmado
        } else if (event.resource?.status === 'CANCELLED') {
            backgroundColor = '#EF4444'; // vermelho para cancelado
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            }
        };
    };

    // Renderizar o tooltip com detalhes do agendamento
    const EventComponent = ({ event }: { event: AppointmentEvent }) => (
        <div className="rbc-event-content" title={`
      Cliente: ${event.resource?.clientName}
      Telefone: ${event.resource?.clientPhone}
      Serviço: ${event.resource?.serviceName}
    `}>
            {event.title}
        </div>
    );

    // Mudar para uma data específica (hoje)
    const handleToday = () => {
        setDate(new Date());
    };

    // Navegar para a data anterior
    const handlePrev = () => {
        const newDate = new Date(date);
        if (view === Views.MONTH) {
            newDate.setMonth(date.getMonth() - 1);
        } else if (view === Views.WEEK) {
            newDate.setDate(date.getDate() - 7);
        } else {
            newDate.setDate(date.getDate() - 1);
        }
        setDate(newDate);
    };

    // Navegar para a próxima data
    const handleNext = () => {
        const newDate = new Date(date);
        if (view === Views.MONTH) {
            newDate.setMonth(date.getMonth() + 1);
        } else if (view === Views.WEEK) {
            newDate.setDate(date.getDate() + 7);
        } else {
            newDate.setDate(date.getDate() + 1);
        }
        setDate(newDate);
    };

    // Formatar o título do calendário
    const formatCalendarTitle = () => {
        if (view === Views.MONTH) {
            return format(date, 'MMMM yyyy', { locale: ptBR });
        } else if (view === Views.WEEK) {
            const start = startOfWeek(date, { locale: ptBR });
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            return `${format(start, 'dd', { locale: ptBR })} - ${format(end, 'dd')} de ${format(end, 'MMMM yyyy', { locale: ptBR })}`;
        } else {
            return format(date, 'dd MMMM yyyy', { locale: ptBR });
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <h1 className="h3 mb-1 fw-bold gradient-number">Agenda de Atendimentos</h1>
                        <p className="text-muted mb-0">Gerencie seus horários e agendamentos</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link
                            href="/calendar/settings"
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                        >
                            <Settings size={18} />
                            <span>Configurações</span>
                        </Link>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Novo Agendamento</span>
                        </button>
                    </div>
                </div>

                {/* Controles de navegação do calendário */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="btn-group">
                        <button
                            type="button"
                            className={`btn ${view === Views.MONTH ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setView(Views.MONTH)}
                        >
                            <CalendarIcon size={18} className="me-1" />
                            Mês
                        </button>
                        <button
                            type="button"
                            className={`btn ${view === Views.WEEK ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => {
                                if (view === Views.WEEK) {
                                    // Navegar para a visualização semanal em página separada
                                    router.push(`/calendar/week?date=${date.toISOString()}`);
                                } else {
                                    setView(Views.WEEK);
                                }
                            }}
                        >
                            <WeekIcon size={18} className="me-1" />
                            Semana
                        </button>
                        <button
                            type="button"
                            className={`btn ${view === Views.DAY ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => {
                                if (view === Views.DAY) {
                                    // Navegar para a visualização diária em página separada
                                    router.push(`/calendar/day?date=${date.toISOString()}`);
                                } else {
                                    setView(Views.DAY);
                                }
                            }}
                        >
                            <DayIcon size={18} className="me-1" />
                            Dia
                        </button>
                    </div>

                    <div className="d-flex align-items-center">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={handlePrev}>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={handleToday}>
                            Hoje
                        </button>
                        <button className="btn btn-sm btn-outline-secondary me-3" onClick={handleNext}>
                            <ChevronRight size={16} />
                        </button>
                        <h5 className="mb-0 text-capitalize">
                            {formatCalendarTitle()}
                        </h5>
                    </div>
                </div>

                {/* Calendário */}
                <div className="calendar-container" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            messages={messages}
                            eventPropGetter={eventPropGetter}
                            components={{
                                event: EventComponent,
                            }}
                            popup
                            selectable
                            onSelectSlot={(slotInfo) => {
                                console.log('Slot selecionado:', slotInfo);
                                // Aqui você pode abrir um modal para criar um novo agendamento
                            }}
                            onSelectEvent={(event) => {
                                console.log('Evento selecionado:', event);
                                // Aqui você pode abrir um modal para visualizar/editar o agendamento
                            }}
                        />
                    )}
                </div>

                {/* Legenda */}
                <div className="mt-4 d-flex gap-3">
                    <div className="d-flex align-items-center">
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%', marginRight: '6px' }} />
                        <span className="small">Agendado</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '50%', marginRight: '6px' }} />
                        <span className="small">Confirmado</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#EF4444', borderRadius: '50%', marginRight: '6px' }} />
                        <span className="small">Cancelado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
