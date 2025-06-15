import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./EventForm";

export function CreateEventForm({ onCreated }: { onCreated?: () => void }) {
  const [loading, setLoading] = React.useState(false);

  async function handleCreate(values: any) {
    setLoading(true);
    const { error } = await supabase.from("events").insert(values);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar evento!", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Evento criado com sucesso!" });
      if (onCreated) onCreated();
    }
  }

  return <EventForm mode="create" loading={loading} onSubmit={handleCreate} />;
}
