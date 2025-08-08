"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Save,
    Clock,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const calendarSettingsSchema = z.object({
    defaultView: z.enum(["month", "week", "day"], {
        required_error: "Por favor, selecione uma visualização padrão",
    }),
    defaultDuration: z.number().min(5, {
        message: "A duração mínima deve ser pelo menos 5 minutos",
    }).max(240, {
        message: "A duração máxima não pode ultrapassar 240 minutos",
    }),
    workDayStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido. Use HH:MM",
    }),
    workDayEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido. Use HH:MM",
    }),
    allowOverlappingAppointments: z.boolean(),
    sendRemindersByWhatsapp: z.boolean(),
    reminderTimeInHours: z.number().min(1, {
        message: "O tempo mínimo de lembrete deve ser pelo menos 1 hora antes",
    }).max(72, {
        message: "O tempo máximo de lembrete não pode ultrapassar 72 horas",
    }),
});

type CalendarSettingsFormData = z.infer<typeof calendarSettingsSchema>;

export default function CalendarSettingsPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Formulário com validação zod
    const form = useForm<CalendarSettingsFormData>({
        resolver: zodResolver(calendarSettingsSchema),
        defaultValues: {
            defaultView: "month",
            defaultDuration: 60,
            workDayStartTime: "09:00",
            workDayEndTime: "18:00",
            allowOverlappingAppointments: false,
            sendRemindersByWhatsapp: true,
            reminderTimeInHours: 24,
        },
    });

    // Carregar configurações do usuário quando a página for carregada
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Simulando carregamento de dados (substituir pela chamada API real)
                const response = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            defaultView: "month",
                            defaultDuration: 60,
                            workDayStartTime: "09:00",
                            workDayEndTime: "18:00",
                            allowOverlappingAppointments: false,
                            sendRemindersByWhatsapp: true,
                            reminderTimeInHours: 24,
                        });
                    }, 500);
                });

                // Atualiza o formulário com os dados carregados
                form.reset(response as CalendarSettingsFormData);
            } catch (error) {
                setFeedback({
                    type: "error",
                    message: "Erro ao carregar configurações. Tente novamente.",
                });
            }
        };

        fetchSettings();
    }, [form]);

    // Manipula o envio do formulário
    const onSubmit = async (data: CalendarSettingsFormData) => {
        setIsSaving(true);
        try {
            // Simulação de envio (substituir pela chamada API real)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mostrar feedback de sucesso
            setFeedback({
                type: "success",
                message: "Configurações salvas com sucesso!",
            });

            // Limpar feedback após alguns segundos
            setTimeout(() => {
                setFeedback(null);
            }, 3000);
        } catch (error) {
            setFeedback({
                type: "error",
                message: "Erro ao salvar configurações. Tente novamente.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Configurações do Calendário</h1>
                <Button
                    variant="outline"
                    onClick={() => router.push("/calendar")}
                >
                    Voltar para o Calendário
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

            <Tabs defaultValue="general">
                <TabsList className="mb-6">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="notifications">Notificações</TabsTrigger>
                </TabsList>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configurações Gerais</CardTitle>
                                    <CardDescription>
                                        Configure as preferências gerais do seu calendário.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="defaultView"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visualização Padrão</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Selecione a visualização padrão" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="month">Mês</SelectItem>
                                                        <SelectItem value="week">Semana</SelectItem>
                                                        <SelectItem value="day">Dia</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Escolha como o calendário será exibido ao abri-lo.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="defaultDuration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duração Padrão do Agendamento (minutos)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Defina a duração padrão para novos agendamentos em minutos.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="workDayStartTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Horário de Início do Dia</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="workDayEndTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Horário de Fim do Dia</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="allowOverlappingAppointments"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Permitir Agendamentos Sobrepostos</FormLabel>
                                                    <FormDescription>
                                                        Ative para permitir mais de um agendamento no mesmo horário.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configurações de Notificações</CardTitle>
                                    <CardDescription>
                                        Configure como e quando seus clientes serão notificados sobre os agendamentos.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="sendRemindersByWhatsapp"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Enviar Lembretes por WhatsApp</FormLabel>
                                                    <FormDescription>
                                                        Envia lembretes automáticos por WhatsApp para seus clientes.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("sendRemindersByWhatsapp") && (
                                        <FormField
                                            control={form.control}
                                            name="reminderTimeInHours"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tempo de Antecedência do Lembrete (horas)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Quanto tempo antes do agendamento o lembrete deve ser enviado.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
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
                    </form>
                </Form>
            </Tabs>
        </div>
    );
}
