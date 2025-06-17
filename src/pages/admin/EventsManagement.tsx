
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventManagementTable } from "./components/EventManagementTable";
import { EventsManagementHeader } from "@/components/admin/events/EventsManagementHeader";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function EventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const activeEvents = events.filter(e => e.status === 'ACTIVE' || e.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          {events.length} eventos • {activeEvents} ativos
        </div>
      </div>

      <EventsManagementHeader 
        totalEvents={events.length}
        activeEvents={activeEvents}
        onCreateNew={() => navigate('/admin/create-event')}
      />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin mr-2" /> 
            <span>Carregando eventos...</span>
          </div>
        ) : (
          <EventManagementTable events={events} onDelete={handleDelete} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
}
