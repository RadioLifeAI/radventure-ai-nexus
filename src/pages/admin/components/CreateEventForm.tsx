
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EventForm } from "./EventForm";

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
        <EventForm 
          mode="create" 
          onSubmit={handleSubmit} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
}
