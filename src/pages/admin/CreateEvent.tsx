
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./components/EventForm";
import { EventFormAISection } from "./components/EventFormAISection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Edit,
  Brain,
  Calendar,
  Target
} from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({});
  const [currentFilters, setCurrentFilters] = useState({});

  async function handleSubmit(values: any) {
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert([
        {
          ...values,
          status: "SCHEDULED"
        }
      ]);

      if (error) throw error;

      toast({
        title: "✅ Evento criado com sucesso!",
        description: `"${values.name}" foi criado e está pronto para ser executado.`,
        className: "bg-green-50 border-green-200"
      });

      navigate("/admin/events");
    } catch (error: any) {
      toast({
        title: "❌ Erro ao criar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleApplySuggestion = (suggestion: any) => {
    setEventData(prev => ({ ...prev, ...suggestion }));
  };

  const handleAutoFill = (data: any) => {
    setEventData(prev => ({ ...prev, ...data }));
  };

  const handleApplyTemplate = (template: any) => {
    setEventData(prev => ({ ...prev, ...template }));
    setCurrentFilters(template.caseFilters || {});
  };

  const handleApplyOptimization = (optimization: any) => {
    setEventData(prev => ({ ...prev, ...optimization }));
  };

  const handleSelectSchedule = (date: Date, time: string) => {
    const scheduledStart = new Date(date);
    const [hours, minutes] = time.split(':');
    scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + (eventData.durationMinutes || 30));

    setEventData(prev => ({
      ...prev,
      scheduled_start: scheduledStart.toISOString().slice(0, 16),
      scheduled_end: scheduledEnd.toISOString().slice(0, 16)
    }));

    toast({
      title: "📅 Horário selecionado!",
      description: `Evento agendado para ${date.toLocaleDateString('pt-BR')} às ${time}`,
      className: "bg-blue-50 border-blue-200"
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <Badge className="bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Criar Novo Evento
        </h1>
        <p className="text-gray-600">
          Use nossa inteligência artificial para criar eventos otimizados e de alto engajamento
        </p>
      </div>

      <Tabs defaultValue="ai-assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistente de IA
          </TabsTrigger>
          <TabsTrigger value="manual-form" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Formulário Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant" className="space-y-6">
          <EventFormAISection
            onApplySuggestion={handleApplySuggestion}
            onAutoFill={handleAutoFill}
            onApplyTemplate={handleApplyTemplate}
            onApplyOptimization={handleApplyOptimization}
            onSelectSchedule={handleSelectSchedule}
            onConfigureAutomation={() => {}}
            currentFilters={currentFilters}
            eventData={eventData}
          />

          {/* Formulário com dados preenchidos pela IA */}
          {Object.keys(eventData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Dados Preenchidos pela IA
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Revise e ajuste os dados antes de criar o evento
                </p>
              </CardHeader>
              <CardContent>
                <EventForm
                  mode="create"
                  initialValues={eventData}
                  loading={loading}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate("/admin/events")}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual-form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Formulário Manual de Criação
              </CardTitle>
              <p className="text-sm text-gray-600">
                Preencha manualmente todos os campos do evento
              </p>
            </CardHeader>
            <CardContent>
              <EventForm
                mode="create"
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/admin/events")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
