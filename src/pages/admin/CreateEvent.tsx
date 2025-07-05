
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./components/EventForm";
import { EventCreationWizard } from "./components/EventCreationWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEventCaseSelection } from "@/hooks/useEventCaseSelection";
import {
  Sparkles,
  Edit,
  Wand2,
  Calendar,
  Target
} from "lucide-react";

interface EventData {
  name?: string;
  description?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  prize_radcoins?: number;
  number_of_cases?: number;
  duration_minutes?: number;
  durationMinutes?: number;
  max_participants?: number;
  banner_url?: string;
  auto_start?: boolean;
  prize_distribution?: any[];
  case_filters?: any;
  [key: string]: any;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { selectAndSaveCases } = useEventCaseSelection();

  async function handleSubmit(values: any) {
    setLoading(true);
    try {
      console.log('🎯 Criando evento com sistema de casos pré-selecionados:', values);

      const { data: createdEvent, error } = await supabase
        .from("events")
        .insert([{
          ...values,
          status: "SCHEDULED"
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Evento criado:', createdEvent.id);

      // 🎯 NOVA LÓGICA: Selecionar e salvar casos específicos para garantir consistência
      if (values.case_filters && Object.keys(values.case_filters).length > 0) {
        console.log('🔄 Selecionando casos específicos para o evento...');
        
        await selectAndSaveCases(
          createdEvent.id,
          values.case_filters,
          values.number_of_cases || 10
        );

        console.log('✅ Casos específicos salvos - todos os usuários verão os mesmos casos');
      } else {
        console.warn('⚠️ Evento criado sem filtros - casos serão dinâmicos');
      }

      toast({
        title: "✅ Evento criado com sucesso!",
        description: `"${values.name}" foi criado e está pronto para ser executado.`,
        className: "bg-green-50 border-green-200"
      });

      navigate("/admin/events");
    } catch (error: any) {
      console.error('❌ Erro ao criar evento:', error);
      toast({
        title: "❌ Erro ao criar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }


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

      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Assistente Wizard
          </TabsTrigger>
          <TabsTrigger value="manual-form" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Formulário Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          <EventCreationWizard
            mode="create"
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/events")}
          />
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
