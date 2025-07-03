import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EventForm } from "./components/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/Loader";
import {
  Edit,
  Calendar,
  Users,
  Trophy,
  Clock
} from "lucide-react";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  async function fetchEventData() {
    try {
      setFetchLoading(true);
      
      // Buscar dados do evento
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventError) throw eventError;

      setEvent(eventData);

      // Buscar participantes registrados
      const { data: participantsData, error: participantsError } = await supabase
        .from("event_registrations")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            username,
            email
          )
        `)
        .eq("event_id", id);

      if (participantsError) {
        console.error("Erro ao buscar participantes:", participantsError);
      } else {
        setParticipants(participantsData || []);
      }

    } catch (error: any) {
      console.error("Erro ao buscar evento:", error);
      toast({
        title: "❌ Erro ao carregar evento",
        description: error.message,
        variant: "destructive"
      });
      navigate("/admin/events");
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleUpdate(values: any) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update(values)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Evento atualizado com sucesso!",
        description: `"${values.name}" foi salvo com todas as modificações.`,
        className: "bg-green-50 border-green-200"
      });

      navigate("/admin/events");
    } catch (error: any) {
      toast({
        title: "❌ Erro ao atualizar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      ACTIVE: "bg-green-100 text-green-700",
      FINISHED: "bg-purple-100 text-purple-700",
      CANCELLED: "bg-red-100 text-red-700"
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (fetchLoading) {
    return <Loader />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Evento não encontrado</h2>
        <p className="text-gray-600">O evento solicitado não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          Editando evento: {event.name}
        </div>
      </div>

      {/* Header do evento */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-bold text-blue-800">
                  Editar Evento
                </CardTitle>
                <p className="text-sm text-blue-600 mt-1">
                  {event.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.scheduled_start)}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {event.id.slice(0, 8)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Métricas rápidas */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Participantes</div>
              <div className="text-sm font-semibold text-gray-800">
                {participants.length}/{event.max_participants || "∞"}
              </div>
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Prêmio Total</div>
              <div className="text-sm font-semibold text-gray-800">
                {event.prize_radcoins} RC
              </div>
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <Clock className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Duração</div>
              <div className="text-sm font-semibold text-gray-800">
                {event.duration_minutes || 30}min
              </div>
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Casos</div>
              <div className="text-sm font-semibold text-gray-800">
                {event.number_of_cases}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de edição */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Evento</CardTitle>
          <p className="text-sm text-gray-600">
            Modifique os campos necessários e salve as alterações
          </p>
        </CardHeader>
        <CardContent>
          <EventForm
            mode="edit"
            initialValues={event}
            loading={loading}
            onSubmit={handleUpdate}
            onCancel={() => navigate("/admin/events")}
          />
        </CardContent>
      </Card>

      {/* Lista de participantes */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes Registrados ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">
                      {participant.profiles?.full_name || participant.profiles?.username || "Nome não disponível"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {participant.profiles?.email}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Registrado em {formatDate(participant.registered_at)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}