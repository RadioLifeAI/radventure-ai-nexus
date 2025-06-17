
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EventForm } from "./EventForm";
import { Calendar, Sparkles, Trophy, Zap } from "lucide-react";

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
        description: `O evento "${eventData.name}" foi registrado na plataforma.`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header gamificado melhorado */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                <Calendar className="h-8 w-8 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                  Criar Novo Evento
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-lg">Configure um evento gamificado para a comunidade médica</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Zap className="h-4 w-4 text-green-300" />
                    <span className="text-sm font-medium">Sistema Ativo</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Trophy className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-medium">Modo Criação</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Trophy className="h-16 w-16 text-yellow-300/50" />
            </div>
          </div>
        </div>

        {/* Formulário principal */}
        <EventForm 
          mode="create" 
          onSubmit={handleSubmit} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
}
