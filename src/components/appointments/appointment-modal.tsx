"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, Phone, Mail, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Service {
    id: string;
    name: string;
    duration: number;
    price?: number | null;
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    startDate: Date;
    onSave: (appointmentData: any) => Promise<void>;
}

export default function AppointmentModal({
    isOpen,
    onClose,
    startDate,
    onSave
}: AppointmentModalProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedService, setSelectedService] = useState<string>('');
    const [appointmentDate, setAppointmentDate] = useState<string>('');
    const [appointmentTime, setAppointmentTime] = useState<string>('');
    const [clientName, setClientName] = useState<string>('');
    const [clientPhone, setClientPhone] = useState<string>('');
    const [clientEmail, setClientEmail] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    // Efeito para carregar os serviços quando o modal for aberto
    useEffect(() => {
        if (isOpen) {
            fetchServices();

            // Formatar a data selecionada
            setAppointmentDate(format(startDate, 'yyyy-MM-dd'));
            setAppointmentTime(format(startDate, 'HH:mm'));
        }
    }, [isOpen, startDate]);

    // Buscar os serviços disponíveis
    const fetchServices = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/service');

            if (!response.ok) {
                throw new Error('Erro ao buscar serviços');
            }

            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            setError('Não foi possível carregar a lista de serviços');
        } finally {
            setIsLoading(false);
        }
    };

    // Calcular o horário de término com base no serviço selecionado
    const calculateEndTime = () => {
        if (!selectedService || !appointmentTime) return '';

        const service = services.find(s => s.id === selectedService);
        if (!service) return '';

        const [hours, minutes] = appointmentTime.split(':').map(Number);
        const startTimeDate = new Date();
        startTimeDate.setHours(hours, minutes, 0);

        const endTimeDate = new Date(startTimeDate);
        endTimeDate.setMinutes(endTimeDate.getMinutes() + service.duration);

        return format(endTimeDate, 'HH:mm');
    };

    // Manipular o envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setIsSaving(true);

            // Validação básica
            if (!selectedService || !appointmentDate || !appointmentTime || !clientName || !clientPhone) {
                throw new Error('Preencha todos os campos obrigatórios');
            }

            const service = services.find(s => s.id === selectedService);
            if (!service) {
                throw new Error('Serviço inválido');
            }

            // Criar datas para início e fim do agendamento
            const [year, month, day] = appointmentDate.split('-').map(Number);
            const [hours, minutes] = appointmentTime.split(':').map(Number);

            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);

            const appointmentData = {
                serviceId: selectedService,
                clientName,
                clientPhone,
                clientEmail: clientEmail || null,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                notes: notes || null,
                status: 'SCHEDULED'
            };

            await onSave(appointmentData);

            // Fechar o modal e limpar formulário
            resetForm();
            onClose();

        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error);
            setError(error.message || 'Erro ao criar agendamento');
        } finally {
            setIsSaving(false);
        }
    };

    // Limpar o formulário
    const resetForm = () => {
        setSelectedService('');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Novo Agendamento</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center">
                                <span className="me-2">⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* Serviço */}
                                <div className="col-md-12">
                                    <label className="form-label">Serviço</label>
                                    <select
                                        className="form-select"
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="">Selecione um serviço</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - {service.duration} min
                                                {service.price ? ` - R$ ${service.price.toFixed(2)}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoading && (
                                        <div className="form-text text-muted">
                                            <div className="spinner-border spinner-border-sm me-1" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                            Carregando serviços...
                                        </div>
                                    )}
                                </div>

                                {/* Data e Hora */}
                                <div className="col-md-6">
                                    <label className="form-label">Data</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Calendar size={16} />
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Hora</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Clock size={16} />
                                        </span>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={appointmentTime}
                                            onChange={(e) => setAppointmentTime(e.target.value)}
                                            required
                                        />
                                        <span className="input-group-text">até</span>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={calculateEndTime()}
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Informações do Cliente */}
                                <div className="col-md-12">
                                    <hr className="my-2" />
                                    <h6>Informações do Cliente</h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Nome</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <User size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nome do cliente"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Telefone</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Phone size={16} />
                                        </span>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="(11) 98765-4321"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <label className="form-label">Email (opcional)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="email@exemplo.com"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <label className="form-label">Observações (opcional)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FileText size={16} />
                                        </span>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            placeholder="Observações sobre o agendamento..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={handleSubmit}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Salvando...</span>
                                    </div>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                'Criar Agendamento'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
