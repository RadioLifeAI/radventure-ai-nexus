import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Play,
  UserCheck,
  ArrowLeft,
  MapPin,
  Target,
  Award
} from "lucide-react";

interface EventDetails {
  id: string;
  name: string;
  description?: string;
  banner_url?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
  event_type?: string;
  prize_distribution?: any;
}

export default function EventoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, registerForEvent, unregisterFromEvent, checkRegistration } = useEventRegistration();
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (event && user) {
      checkUserRegistration();
      fetchParticipantCount();
    }
  }, [event, user]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Garantir que prize_distribution seja um array
      const eventWithValidDistribution = {
        ...data,
        prize_distribution: Array.isArray(data.prize_distribution) ? data.prize_distribution : []
      };
      
      setEvent(eventWithValidDistribution);
    } catch (error: any) {
      console.error("Erro ao buscar evento:", error);
      toast({
        title: "Erro ao carregar evento",
        description: "Não foi possível carregar os detalhes do evento.",
        variant: "destructive"
      });
      navigate("/eventos");
    } finally {
      setLoadingEvent(false);
    }
  };

  const checkUserRegistration = async () => {
    if (!event || !user) return;
    const registered = await checkRegistration(event.id, user.id);
    setIsRegistered(registered);
  };

  const fetchParticipantCount = async () => {
    if (!event) return;
    try {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact" })
        .eq("event_id", event.id);

      if (error) throw error;
      setParticipantCount(count || 0);
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
    }
  };

  const handleRegistration = async () => {
    if (!event || !user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se inscrever em eventos.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    const success = isRegistered 
      ? await unregisterFromEvent(event.id, user.id)
      : await registerForEvent(event.id, user.id);

    if (success) {
      setIsRegistered(!isRegistered);
      setParticipantCount(prev => isRegistered ? prev - 1 : prev + 1);
    }
  };

  const handleEnterEvent = () => {
    if (!event) return;
    
    if (event.status !== "ACTIVE") {
      toast({
        title: "Evento não disponível",
        description: "Este evento ainda não está ativo.",
        variant: "destructive"
      });
      return;
    }

    if (!isRegistered) {
      toast({
        title: "Inscrição necessária",
        description: "Você precisa se inscrever no evento primeiro.",
        variant: "destructive"
      });
      return;
    }

    // Navegar para área de resolução de casos do evento
    navigate(`/evento/${event.id}/arena`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-700",
      ACTIVE: "bg-green-100 text-green-700",
      FINISHED: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      SCHEDULED: "Agendado",
      ACTIVE: "Ao Vivo",
      FINISHED: "Finalizado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-cyan-400 text-lg">Carregando evento...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Evento não encontrado</h2>
            <Button onClick={() => navigate("/eventos")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Eventos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="flex-1 px-4 md:px-16 pt-6 pb-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/eventos")}
            className="text-cyan-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Eventos
          </Button>
        </div>

        {/* Banner do Evento */}
        <div className="relative mb-8">
          {event.banner_url ? (
            <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl relative overflow-hidden">
              <img
                src={event.banner_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"></div>
          )}
          
          <div className="absolute top-4 right-4">
            <Badge className={getStatusColor(event.status)}>
              {getStatusLabel(event.status)}
            </Badge>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Evento */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">{event.name}</h1>
              {event.description && (
                <p className="text-cyan-100 text-lg leading-relaxed">{event.description}</p>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-cyan-200">Início</p>
                  <p className="font-bold text-white">
                    {new Date(event.scheduled_start).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-cyan-200">Participantes</p>
                  <p className="font-bold text-white">
                    {participantCount}{event.max_participants ? `/${event.max_participants}` : ''}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-cyan-200">Prêmio</p>
                  <p className="font-bold text-white">{event.prize_radcoins} RC</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-cyan-200">Casos</p>
                  <p className="font-bold text-white">{event.number_of_cases || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição de Prêmios */}
            {event.prize_distribution && Array.isArray(event.prize_distribution) && event.prize_distribution.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Distribuição de Prêmios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.prize_distribution.slice(0, 5).map((prize: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-cyan-100">
                          {prize.position}º Lugar
                        </span>
                        <span className="font-bold text-yellow-400">
                          {prize.prize} RC
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar de Ações */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Status de Inscrição */}
                  <div className="text-center">
                    {isRegistered ? (
                      <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                        <UserCheck className="h-5 w-5" />
                        <span className="font-medium">Você está inscrito!</span>
                      </div>
                    ) : (
                      <div className="text-cyan-200 mb-4">
                        <Users className="h-5 w-5 mx-auto mb-2" />
                        <span>Inscreva-se para participar</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-3">
                    {event.status === "ACTIVE" && isRegistered && (
                      <Button
                        onClick={handleEnterEvent}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Entrar no Evento
                      </Button>
                    )}

                    <Button
                      onClick={handleRegistration}
                      disabled={loading}
                      variant={isRegistered ? "destructive" : "default"}
                      className={`w-full ${
                        !isRegistered 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" 
                          : ""
                      }`}
                    >
                      {loading ? (
                        "Processando..."
                      ) : isRegistered ? (
                        "Cancelar Inscrição"
                      ) : (
                        "Inscrever-se"
                      )}
                    </Button>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="pt-4 border-t border-white/20 space-y-2 text-sm">
                    <div className="flex justify-between text-cyan-200">
                      <span>Tipo:</span>
                      <span className="text-white capitalize">{event.event_type || 'Quiz'}</span>
                    </div>
                    <div className="flex justify-between text-cyan-200">
                      <span>Início:</span>
                      <span className="text-white">
                        {new Date(event.scheduled_start).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-cyan-200">
                      <span>Fim:</span>
                      <span className="text-white">
                        {new Date(event.scheduled_end).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
