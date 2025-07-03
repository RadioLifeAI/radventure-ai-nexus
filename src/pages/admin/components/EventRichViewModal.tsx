
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Target,
  Edit,
  Copy,
  BarChart3,
  MessageCircle,
  Play,
  Share2,
  Download,
  Zap
} from "lucide-react";
import { ParticipantDashboardModal } from "@/components/admin/events/ParticipantDashboardModal";

interface Event {
  id: string;
  name: string;
  description?: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
  banner_url?: string;
  case_filters?: any;
  prize_distribution?: Array<{ position: number; prize: number }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onAnalytics: (eventId: string) => void;
  onStart?: (eventId: string) => void;
}

export function EventRichViewModal({
  open,
  onClose,
  event,
  onEdit,
  onDuplicate,
  onAnalytics,
  onStart
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showParticipantDashboard, setShowParticipantDashboard] = useState(false);

  if (!event) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      ACTIVE: "bg-green-100 text-green-700 animate-pulse",
      FINISHED: "bg-purple-100 text-purple-700",
      CANCELLED: "bg-red-100 text-red-700"
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      DRAFT: "Rascunho",
      SCHEDULED: "Agendado",
      ACTIVE: "Ativo",
      FINISHED: "Finalizado",
      CANCELLED: "Cancelado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventActive = event.status === "ACTIVE";
  const canStart = event.status === "SCHEDULED" && new Date(event.scheduled_start) <= new Date();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                {event.name}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
                {isEventActive && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    AO VIVO
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  ID: {event.id.slice(0, 8)}
                </span>
              </div>
            </div>
            {event.banner_url && (
              <div className="ml-4">
                <img
                  src={event.banner_url}
                  alt={event.name}
                  className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="prizes">Prêmios</TabsTrigger>
              <TabsTrigger value="live" disabled={!isEventActive}>
                Live {isEventActive && <Zap className="ml-1 h-3 w-3" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-600">Início</div>
                    <div className="text-sm text-gray-800">{formatDate(event.scheduled_start)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-600">Participantes</div>
                    <div className="text-lg font-bold text-green-600">
                      {event.max_participants || "Ilimitado"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-600">Prêmio Total</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {event.prize_radcoins} RC
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-600">Casos</div>
                    <div className="text-lg font-bold text-purple-600">
                      {event.number_of_cases}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {event.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descrição do Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Técnicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Início</label>
                      <div className="text-gray-800">{formatDate(event.scheduled_start)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Término</label>
                      <div className="text-gray-800">{formatDate(event.scheduled_end)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Casos</label>
                      <div className="text-gray-800">{event.number_of_cases}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Limite de Participantes</label>
                      <div className="text-gray-800">{event.max_participants || "Sem limite"}</div>
                    </div>
                  </div>

                  {event.case_filters && Object.keys(event.case_filters).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Filtros de Casos</label>
                      <div className="mt-2 space-y-2">
                        {Object.entries(event.case_filters).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Badge variant="secondary">{key}</Badge>
                            <span className="text-sm text-gray-600">
                              {Array.isArray(value) ? value.join(", ") : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Participantes do Evento</span>
                    <Button size="sm" onClick={() => setShowParticipantDashboard(true)}>
                      <Users className="h-4 w-4 mr-1" />
                      Dashboard Avançado
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Dashboard de Participantes Disponível
                      </h3>
                      <p className="text-blue-600 mb-4">
                        Acesse ferramentas avançadas para gerenciar participantes, enviar comunicações e analisar dados demográficos.
                      </p>
                      <Button onClick={() => setShowParticipantDashboard(true)}>
                        <Users className="h-4 w-4 mr-1" />
                        Abrir Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prizes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Prêmios</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.prize_distribution && event.prize_distribution.length > 0 ? (
                    <div className="space-y-2">
                      {event.prize_distribution.map((prize, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                              {prize.position}
                            </div>
                            <span className="font-medium">
                              {prize.position === 1 ? "1º Lugar" :
                               prize.position === 2 ? "2º Lugar" :
                               prize.position === 3 ? "3º Lugar" :
                               `${prize.position}º Lugar`}
                            </span>
                          </div>
                          <div className="font-bold text-yellow-600">
                            {prize.prize} RadCoins
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-2" />
                      <p>Distribuição de prêmios não configurada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    Evento ao Vivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>Dashboard ao vivo será implementado em breve</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {canStart && onStart && (
              <Button onClick={() => onStart(event.id)} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-1" />
                Iniciar Evento
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onAnalytics(event.id)}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button variant="outline" onClick={() => onDuplicate(event.id)}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicar
            </Button>
            <Button onClick={() => onEdit(event.id)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Participant Dashboard Modal */}
      {event && (
        <ParticipantDashboardModal
          open={showParticipantDashboard}
          onClose={() => setShowParticipantDashboard(false)}
          eventId={event.id}
          eventName={event.name}
        />
      )}
    </Dialog>
  );
}
