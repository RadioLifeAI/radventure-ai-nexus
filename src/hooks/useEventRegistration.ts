import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createNotification } from "@/utils/notifications";

export function useEventRegistration() {
  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const checkRegistration = useCallback(async (eventId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error: any) {
      console.error("Erro ao verificar inscrição:", error);
      return false;
    }
  }, []);

  const registerForEvent = useCallback(async (eventId: string, userId: string) => {
    setLoading(true);
    try {
      // Verificar se já está inscrito
      const isRegistered = await checkRegistration(eventId, userId);
      if (isRegistered) {
        toast({
          title: "Já inscrito!",
          description: "Você já está inscrito neste evento.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar vagas disponíveis
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("max_participants, name")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      if (event.max_participants) {
        const { count, error: countError } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact" })
          .eq("event_id", eventId);

        if (countError) throw countError;

        if (count && count >= event.max_participants) {
          toast({
            title: "Evento lotado!",
            description: "Este evento já atingiu o número máximo de participantes.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Fazer inscrição
      const { error } = await supabase
        .from("event_registrations")
        .insert([{
          event_id: eventId,
          user_id: userId
        }]);

      if (error) throw error;

      setRegisteredEvents(prev => [...prev, eventId]);
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no evento com sucesso.",
        className: "bg-green-50 border-green-200"
      });

      // NOVA NOTIFICAÇÃO - Inscrição em Evento
      await createNotification({
        userId: userId,
        type: 'new_event',
        title: '✅ Inscrição Confirmada!',
        message: `Você foi inscrito no evento "${event.name}" com sucesso!`,
        priority: 'high',
        actionUrl: `/app/evento/${eventId}`,
        actionLabel: 'Ver Evento',
        metadata: {
          event_id: eventId,
          event_name: event.name
        }
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao inscrever no evento:", error);
      toast({
        title: "Erro na inscrição",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkRegistration]);

  const unregisterFromEvent = useCallback(async (eventId: string, userId: string) => {
    setLoading(true);
    try {
      // Buscar nome do evento antes de cancelar
      const { data: event } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .single();

      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (error) throw error;

      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
      toast({
        title: "Inscrição cancelada",
        description: "Sua inscrição foi cancelada com sucesso."
      });

      // NOVA NOTIFICAÇÃO - Cancelamento de Inscrição
      await createNotification({
        userId: userId,
        type: 'reminder',
        title: '❌ Inscrição Cancelada',
        message: `Sua inscrição no evento "${event?.name || 'Evento'}" foi cancelada.`,
        priority: 'medium',
        actionUrl: '/app/eventos',
        actionLabel: 'Ver Outros Eventos',
        metadata: {
          event_id: eventId,
          event_name: event?.name || 'Evento'
        }
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao cancelar inscrição:", error);
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    registeredEvents,
    checkRegistration,
    registerForEvent,
    unregisterFromEvent
  };
}
