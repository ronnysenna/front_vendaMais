"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Save,
    Clock,
    AlertCircle,
    CheckCircle,
    Plus,
    Trash2,
    Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Interface para os horários de funcionamento
interface BusinessHour {
    day: string;
    isOpen: boolean;
    periods: {
        start: string;
        end: string;
        id: string;
    }[];
}

// Constantes
const DAYS_OF_WEEK = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
];

// Gera um ID único para identificar períodos
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function AvailabilitySettingsPage() {
    const router = useRouter();
    const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Carregar dados de disponibilidade
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Simulação de carregamento (substituir por chamada API real)
                await new Promise(resolve => setTimeout(resolve, 500));

                // Dados iniciais de exemplo
                const mockData: BusinessHour[] = DAYS_OF_WEEK.map(day => ({
                    day: day.id,
                    isOpen: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.id),
                    periods: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.id)
                        ? [{ start: "09:00", end: "18:00", id: generateId() }]
                        : [],
                }));

                setBusinessHours(mockData);
            } catch (error) {
                setFeedback({
                    type: "error",
                    message: "Erro ao carregar horários de funcionamento. Tente novamente."
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Alternar status de aberto/fechado para um dia
    const toggleDayStatus = (dayId: string) => {
        setBusinessHours(prev =>
            prev.map(day => {
                if (day.day === dayId) {
                    return {
                        ...day,
                        isOpen: !day.isOpen,
                        // Se estiver abrindo e não houver períodos, adicionar um período padrão
                        periods: (!day.isOpen && day.periods.length === 0)
                            ? [{ start: "09:00", end: "18:00", id: generateId() }]
                            : day.periods
                    };
                }
                return day;
            })
        );
    };

    // Adicionar um novo período a um dia
    const addPeriod = (dayId: string) => {
        setBusinessHours(prev =>
            prev.map(day => {
                if (day.day === dayId) {
                    return {
                        ...day,
                        periods: [...day.periods, { start: "09:00", end: "18:00", id: generateId() }]
                    };
                }
                return day;
            })
        );
    };

    // Remover um período de um dia
    const removePeriod = (dayId: string, periodId: string) => {
        setBusinessHours(prev =>
            prev.map(day => {
                if (day.day === dayId) {
                    return {
                        ...day,
                        periods: day.periods.filter(period => period.id !== periodId)
                    };
                }
                return day;
            })
        );
    };

    // Atualizar horário de um período
    const updatePeriodTime = (dayId: string, periodId: string, field: 'start' | 'end', value: string) => {
        setBusinessHours(prev =>
            prev.map(day => {
                if (day.day === dayId) {
                    return {
                        ...day,
                        periods: day.periods.map(period => {
                            if (period.id === periodId) {
                                return { ...period, [field]: value };
                            }
                            return period;
                        })
                    };
                }
                return day;
            })
        );
    };

    // Copiar horários de um dia para todos os outros dias
    const copyToAllDays = (sourceDayId: string) => {
        const sourceDay = businessHours.find(day => day.day === sourceDayId);
        if (!sourceDay) return;

        setBusinessHours(prev =>
            prev.map(day => {
                if (day.day !== sourceDayId) {
                    return {
                        ...day,
                        isOpen: sourceDay.isOpen,
                        periods: sourceDay.periods.map(period => ({
                            ...period,
                            id: generateId() // Gerar novos IDs para evitar conflitos
                        }))
                    };
                }
                return day;
            })
        );

        setFeedback({
            type: "success",
            message: `Horários copiados com sucesso para todos os dias!`
        });

        setTimeout(() => {
            setFeedback(null);
        }, 3000);
    };

    // Salvar configurações de disponibilidade
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // Simulação de salvamento (substituir por chamada API real)
            await new Promise(resolve => setTimeout(resolve, 1000));

            setFeedback({
                type: "success",
                message: "Horários de disponibilidade salvos com sucesso!"
            });

            setTimeout(() => {
                setFeedback(null);
            }, 3000);
        } catch (error) {
            setFeedback({
                type: "error",
                message: "Erro ao salvar horários de disponibilidade. Tente novamente."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Renderizar um dia de funcionamento
    const renderBusinessDay = (day: BusinessHour) => {
        const dayInfo = DAYS_OF_WEEK.find(d => d.id === day.day);

        return (
            <Card key={day.day} className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{dayInfo?.label}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                {day.isOpen ? 'Aberto' : 'Fechado'}
                            </span>
                            <Switch
                                checked={day.isOpen}
                                onCheckedChange={() => toggleDayStatus(day.day)}
                            />
                        </div>
                    </div>
                </CardHeader>

                {day.isOpen && (
                    <CardContent>
                        <div className="space-y-4">
                            {day.periods.map((period, index) => (
                                <div key={period.id} className="flex items-center space-x-3">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">
                                                Início
                                            </span>
                                            <Input
                                                type="time"
                                                value={period.start}
                                                onChange={(e) => updatePeriodTime(day.day, period.id, 'start', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">
                                                Fim
                                            </span>
                                            <Input
                                                type="time"
                                                value={period.end}
                                                onChange={(e) => updatePeriodTime(day.day, period.id, 'end', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePeriod(day.day, period.id)}
                                        disabled={day.periods.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addPeriod(day.day)}
                                    className="flex items-center"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Adicionar Horário
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToAllDays(day.day)}
                                    className="flex items-center"
                                >
                                    <Copy className="mr-1 h-4 w-4" />
                                    Copiar para Todos
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        );
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Configurações de Disponibilidade</h1>
                <Button
                    variant="outline"
                    onClick={() => router.push("/availability")}
                >
                    Voltar para Disponibilidade
                </Button>
            </div>

            {feedback && (
                <div
                    className={`p-4 mb-6 rounded-lg flex items-center ${feedback.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {feedback.type === "success" ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    {feedback.message}
                </div>
            )}

            <Tabs defaultValue="weekly">
                <TabsList className="mb-6">
                    <TabsTrigger value="weekly">Horário Semanal</TabsTrigger>
                    <TabsTrigger value="exceptions">Exceções</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Horários de Funcionamento</CardTitle>
                                <CardDescription>
                                    Defina os horários em que você está disponível para agendamentos em cada dia da semana.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {businessHours.map(renderBusinessDay)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="exceptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datas Especiais e Feriados</CardTitle>
                            <CardDescription>
                                Defina datas especiais, como feriados ou dias com horários diferentes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center p-8">
                                <p className="text-muted-foreground">
                                    Funcionalidade em desenvolvimento. Em breve você poderá definir exceções para dias específicos.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
                <Button onClick={saveSettings} disabled={isSaving || isLoading}>
                    {isSaving ? (
                        <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
