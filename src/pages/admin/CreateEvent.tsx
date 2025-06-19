
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AIIntegratedEventForm } from "./components/AIIntegratedEventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  Brain,
  Users,
  TrendingUp
} from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
            <Brain className="h-3 w-3 mr-1" />
            IA Avançada
          </Badge>
          <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
            <Users className="h-3 w-3 mr-1" />
            Colaboração Real-time
          </Badge>
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Analytics Avançado
          </Badge>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Sistema de Criação de Eventos com IA
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Utilize nossa inteligência artificial avançada, colaboração em tempo real e analytics de performance 
          para criar eventos médicos otimizados e de alto engajamento
        </p>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Sistema Completo de IA e Colaboração
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">🤖 IA Inteligente</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Sugestões contextuais</li>
                <li>• Otimização automática</li>
                <li>• Agendamento inteligente</li>
                <li>• Análise de performance</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">👥 Colaboração</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Edição em tempo real</li>
                <li>• Sistema de comentários</li>
                <li>• Controle de versões</li>
                <li>• Workflow de aprovação</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">📊 Analytics</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Métricas em tempo real</li>
                <li>• Dashboard executivo</li>
                <li>• Relatórios automáticos</li>
                <li>• Insights preditivos</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AIIntegratedEventForm
            mode="create"
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/events")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
