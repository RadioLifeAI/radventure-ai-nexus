import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventManagementTable } from "./components/EventManagementTable";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function EventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar eventos", description: error.message, variant: "destructive" });
      setEvents([]);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir evento", description: error.message, variant: "destructive" });
    } else {
      setEvents(events.filter(e => e.id !== id));
      toast({ title: "Evento excluído!" });
    }
  }

  async function handleUpdate(ev: any) {
    if (!ev?.id) return;
    setEvents(events => events.map(e => e.id === ev.id ? { ...e, ...ev } : e));
    toast({ title: "Evento atualizado", description: "As informações do evento foram salvas." });
  }

  return (
    <div className="p-4 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestão de Eventos</h1>
        <Button asChild>
          <a href="/admin/create-event">Criar novo evento</a>
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin mr-2" /> <span>Carregando eventos...</span>
        </div>
      ) : (
        <EventManagementTable events={events} onDelete={handleDelete} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
