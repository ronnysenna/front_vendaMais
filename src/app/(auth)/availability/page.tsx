"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Settings, Save, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";

// Interface para os horários de funcionamento
interface BusinessHour {
  day: string;
  isOpen: boolean;
  periods: {
    start: string;
    end: string;
  }[];
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

export default function AvailabilityPage() {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Inicializa os horários de funcionamento
  useEffect(() => {
    // Simulação de carregamento de dados (substituir por chamada API real)
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Dados de exemplo (deve vir da API)
        const mockData: BusinessHour[] = DAYS_OF_WEEK.map(day => ({
          day: day.id,
          isOpen: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.id),
          periods: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.id)
            ? [{ start: "09:00", end: "18:00" }]
            : [],
        }));
        
        setTimeout(() => {
          setBusinessHours(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Função para adicionar novo período em um dia
  const addPeriod = (dayIndex: number) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods.push({ start: "09:00", end: "18:00" });
    setBusinessHours(updatedHours);
  };

  // Função para remover um período
  const removePeriod = (dayIndex: number, periodIndex: number) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods.splice(periodIndex, 1);
    setBusinessHours(updatedHours);
  };

  // Função para atualizar o status de um dia (aberto/fechado)
  const toggleDayStatus = (dayIndex: number) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].isOpen = !updatedHours[dayIndex].isOpen;
    
    // Se estiver fechando o dia, limpa os períodos
    if (!updatedHours[dayIndex].isOpen) {
      updatedHours[dayIndex].periods = [];
    } else if (updatedHours[dayIndex].periods.length === 0) {
      // Se estiver abrindo o dia e não tem períodos, adiciona um padrão
      updatedHours[dayIndex].periods = [{ start: "09:00", end: "18:00" }];
    }
    
    setBusinessHours(updatedHours);
  };

  // Função para atualizar um horário específico
  const updateTime = (dayIndex: number, periodIndex: number, field: "start" | "end", value: string) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods[periodIndex][field] = value;
    setBusinessHours(updatedHours);
  };

  // Função para salvar os horários
  const saveBusinessHours = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      // Simular requisição para salvar (substituir pelo endpoint real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simula sucesso
      setSaveMessage({ type: "success", text: "Horários de funcionamento atualizados com sucesso!" });
      
      // Limpa a mensagem após alguns segundos
      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      setSaveMessage({ type: "error", text: "Erro ao salvar horários. Tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mb-0">Carregando horários de funcionamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {saveMessage && (
        <div className={`alert ${saveMessage.type === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center`}>
          {saveMessage.type === "success" ? (
            <CheckCircle size={20} className="me-2" />
          ) : (
            <AlertCircle size={20} className="me-2" />
          )}
          {saveMessage.text}
        </div>
      )}
      
      <div className="card p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold gradient-number">Horários de Disponibilidade</h1>
            <p className="text-muted mb-0">Configure seus horários de atendimento</p>
          </div>
          <div className="d-flex gap-2">
            <Link 
              href="/availability/settings" 
              className="btn btn-outline-primary d-flex align-items-center gap-2"
            >
              <Settings size={18} />
              <span>Configurações Avançadas</span>
            </Link>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={saveBusinessHours}
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
                <>
                  <Save size={18} />
                  <span>Salvar Horários</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Tabela de horários */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Dia da semana</th>
                <th style={{ width: "15%" }}>Status</th>
                <th>Horários</th>
              </tr>
            </thead>
            <tbody>
              {businessHours.map((dayHours, dayIndex) => (
                <tr key={dayHours.day}>
                  <td>
                    <strong>{DAYS_OF_WEEK.find(d => d.id === dayHours.day)?.label}</strong>
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`status-${dayHours.day}`}
                        checked={dayHours.isOpen}
                        onChange={() => toggleDayStatus(dayIndex)}
                      />
                      <label className="form-check-label" htmlFor={`status-${dayHours.day}`}>
                        {dayHours.isOpen ? "Aberto" : "Fechado"}
                      </label>
                    </div>
                  </td>
                  <td>
                    {dayHours.isOpen ? (
                      <div>
                        {dayHours.periods.map((period, periodIndex) => (
                          <div key={periodIndex} className="mb-2 d-flex align-items-center gap-2">
                            <div className="input-group" style={{ maxWidth: "300px" }}>
                              <span className="input-group-text">
                                <Clock size={16} />
                              </span>
                              <input
                                type="time"
                                className="form-control"
                                value={period.start}
                                onChange={(e) => updateTime(dayIndex, periodIndex, "start", e.target.value)}
                              />
                              <span className="input-group-text">até</span>
                              <input
                                type="time"
                                className="form-control"
                                value={period.end}
                                onChange={(e) => updateTime(dayIndex, periodIndex, "end", e.target.value)}
                              />
                            </div>
                            {dayHours.periods.length > 1 && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removePeriod(dayIndex, periodIndex)}
                                title="Remover horário"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 mt-2"
                          onClick={() => addPeriod(dayIndex)}
                        >
                          <Plus size={16} />
                          <span>Adicionar horário</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">Fechado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4">
          <div className="card-status-info p-3 rounded-3">
            <h5 className="mb-2">Configurações de disponibilidade</h5>
            <p className="mb-0">
              Configure seus horários de funcionamento para que seus clientes possam agendar serviços apenas nos horários disponíveis.
              Você pode adicionar múltiplos intervalos por dia, como manhã e tarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
