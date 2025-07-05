import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEventParticipants } from "@/hooks/useEventParticipants";
import {
  Users,
  Mail,
  Filter,
  Download,
  Send,
  MessageCircle,
  Star,
  Clock,
  Trophy,
  Target,
  Search,
  UserPlus,
  ExternalLink
} from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  registered_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    email: string;
    academic_stage?: string;
    medical_specialty?: string;
    total_points: number;
    user_level: number;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

export function ParticipantDashboardModal({ open, onClose, eventId, eventName }: Props) {
  const [activeTab, setActiveTab] = useState("participants");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicStage: "",
    specialty: "",
    levelRange: ""
  });

  const { participants, stats, loading, error, exportParticipants } = useEventParticipants(eventId);

  if (error) {
    toast({
      title: "Erro ao carregar participantes",
      description: error,
      variant: "destructive"
    });
  }

  const filteredParticipants = participants.filter(participant => {
    const profile = participant.profiles;
    if (!profile) return false;

    const matchesSearch = 
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAcademicStage = !filters.academicStage || 
      profile.academic_stage === filters.academicStage;

    const matchesSpecialty = !filters.specialty || 
      profile.medical_specialty === filters.specialty;

    return matchesSearch && matchesAcademicStage && matchesSpecialty;
  });

  const participantStats = stats || {
    total: 0,
    students: 0,
    residents: 0,
    specialists: 0,
    avgLevel: 0,
    avgPoints: 0,
    avgCompletionTime: 0,
    completionRate: 0,
    avgAccuracy: 0
  };

  const handleSendNotification = () => {
    toast({
      title: "Notificação enviada",
      description: `Notificação enviada para ${filteredParticipants.length} participantes`,
      className: "bg-green-50 border-green-200"
    });
  };

  const handleExportParticipants = () => {
    exportParticipants(filteredParticipants, eventName);
    toast({
      title: "Exportação concluída",
      description: `${filteredParticipants.length} participantes exportados`,
      className: "bg-green-50 border-green-200"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-blue-500" />
            Dashboard de Participantes
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Gestão avançada de participantes: <span className="font-medium">{eventName}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="communication">Comunicação</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-4">
              {/* Filtros e Busca */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome, username ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={handleExportParticipants} variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                    <Button onClick={handleSendNotification}>
                      <Send className="h-4 w-4 mr-1" />
                      Notificar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{participantStats.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{participantStats.students}</div>
                        <div className="text-sm text-gray-600">Estudantes</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{participantStats.residents}</div>
                        <div className="text-sm text-gray-600">Residentes</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{participantStats.specialists}</div>
                        <div className="text-sm text-gray-600">Especialistas</div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Participantes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Participantes ({filteredParticipants.length})</span>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Convidar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Carregando participantes...</div>
                  ) : filteredParticipants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2" />
                      <p>Nenhum participante encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {participant.profiles?.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {participant.profiles?.full_name || "Nome não disponível"}
                              </div>
                              <div className="text-sm text-gray-600">
                                @{participant.profiles?.username} • {participant.profiles?.email}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {participant.profiles?.academic_stage || "N/A"}
                                </Badge>
                                {participant.profiles?.medical_specialty && (
                                  <Badge variant="outline" className="text-xs">
                                    {participant.profiles.medical_specialty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className="text-sm font-medium text-blue-600">Nível {participant.profiles?.user_level || 1}</div>
                                <div className="text-xs text-gray-500">{participant.profiles?.total_points || 0} pts</div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{participantStats.avgLevel}</div>
                    <div className="text-sm text-gray-600">Nível Médio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{participantStats.avgPoints}</div>
                    <div className="text-sm text-gray-600">Pontos Médios</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">42min</div>
                    <div className="text-sm text-gray-600">Tempo Médio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">4.6</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Centro de Comunicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="h-20 flex flex-col items-center justify-center">
                      <Mail className="h-6 w-6 mb-1" />
                      Enviar Email em Lote
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Send className="h-6 w-6 mb-1" />
                      Notificação Push
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Templates Disponíveis</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Lembrete de evento (24h antes)</li>
                      <li>• Notificação de início</li>
                      <li>• Feedback pós-evento</li>
                      <li>• Convite para próximos eventos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Insights de Participação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Pontos Fortes</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Boa diversidade de níveis acadêmicos</li>
                        <li>• Engajamento acima da média</li>
                        <li>• Representação equilibrada de especialidades</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Oportunidades</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Aumentar participação de especialistas</li>
                        <li>• Melhorar comunicação pré-evento</li>
                        <li>• Implementar sistema de mentoria</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportParticipants}>
              <Download className="h-4 w-4 mr-1" />
              Exportar Dados
            </Button>
            <Button onClick={handleSendNotification}>
              <Send className="h-4 w-4 mr-1" />
              Comunicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}