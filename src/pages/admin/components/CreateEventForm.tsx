
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { AdminFormLayoutGamified } from "@/components/admin/layouts/AdminFormLayoutGamified";
import { EventForm } from "./EventForm";
import { Calendar, Sparkles, Trophy } from "lucide-react";

export function CreateEventForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (eventData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✨ Evento criado com sucesso!",
        description: `O evento "${eventData.title}" foi registrado na plataforma.`,
      });

      navigate("/admin/events");
    } catch (error: any) {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "❌ Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header gamificado */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Criar Novo Evento
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </h1>
              <p className="text-blue-100">Configure um evento gamificado para a comunidade médica</p>
            </div>
            <div className="ml-auto">
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Formulário com layout gamificado */}
        <AdminFormLayoutGamified
          title="Configuração do Evento"
          description="Preencha os detalhes para criar um evento envolvente e educativo"
          icon={Calendar}
          category="events"
          badge="Novo Evento"
          progress={75}
        >
          <EventForm mode="create" onSubmit={handleSubmit} loading={isLoading} />
        </AdminFormLayoutGamified>
      </div>
    </div>
  );
}
