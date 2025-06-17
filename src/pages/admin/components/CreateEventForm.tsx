
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./EventForm";

export function CreateEventForm({ onCreated }: { onCreated?: () => void }) {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  async function handleCreate(values: any) {
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert(values);
      
      if (error) throw error;
      
      toast({ 
        title: "Evento criado com sucesso!", 
        description: "O evento foi salvo e está disponível para gerenciamento."
      });
      
      if (onCreated) {
        onCreated();
      } else {
        // Navegar para gestão de eventos
        navigate('/admin/events');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({ 
        title: "Erro ao criar evento!", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate('/admin/events');
  }

  return (
    <EventForm 
      mode="create" 
      loading={loading} 
      onSubmit={handleCreate}
      onCancel={handleCancel}
    />
  );
}
