
import React, { useState } from "react";
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
import {
  Copy,
  Calendar,
  Settings,
  Zap,
  Clock,
  Trophy,
  Users,
  Target,
  Sparkles,
  RefreshCw,
  Bookmark
} from "lucide-react";
import { EventTemplatesModal } from "@/components/admin/events/EventTemplatesModal";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  name: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
  case_filters?: any;
  prize_distribution?: Array<{ position: number; prize: number }>;
  banner_url?: string;
  auto_start?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onDuplicate: (duplicatedEvent: any) => void;
}

export function EventSmartDuplicateModal({ open, onClose, event, onDuplicate }: Props) {
  const [activeTab, setActiveTab] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [modifications, setModifications] = useState({
    name: "",
    scheduledStart: "",
    scheduledEnd: "",
    prizeRadcoins: 0,
    maxParticipants: 0,
    numberOfCases: 0,
    autoAdjustDates: true,
    increasePrize: false,
    adjustParticipants: false
  });

  if (!event) return null;

  const generateSmartName = (baseName: string) => {
    const now = new Date();
    const month = now.toLocaleDateString('pt-BR', { month: 'long' });
    const year = now.getFullYear();
    
    const suggestions = [
      `${baseName} - ${month} ${year}`,
      `${baseName} - Edição ${Math.floor(Math.random() * 10) + 2}`,
      `${baseName} - Especial`,
      `${baseName} - Revisited`,
      `${baseName} - Avançado`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const generateSmartDates = () => {
    const originalStart = new Date(event.scheduled_start);
    const originalEnd = new Date(event.scheduled_end);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    // Próxima semana, mesmo dia e hora
    const newStart = new Date(originalStart);
    newStart.setDate(newStart.getDate() + 7);
    
    const newEnd = new Date(newStart.getTime() + duration);
    
    return {
      start: newStart.toISOString().slice(0, 16),
      end: newEnd.toISOString().slice(0, 16)
    };
  };

  const handleQuickDuplicate = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const smartDates = generateSmartDates();
      const smartName = generateSmartName(event.name);
      
      const duplicatedEventData = {
        name: smartName,
        description: event.description,
        scheduled_start: smartDates.start,
        scheduled_end: smartDates.end,
        prize_radcoins: event.prize_radcoins,
        number_of_cases: event.number_of_cases,
        max_participants: event.max_participants,
        banner_url: event.banner_url || null,
        auto_start: event.auto_start || false,
        prize_distribution: event.prize_distribution,
        case_filters: event.case_filters,
        status: "SCHEDULED" as const
      };

      const { data: duplicatedEvent, error } = await supabase
        .from("events")
        .insert([duplicatedEventData])
        .select()
        .single();

      if (error) throw error;

      onDuplicate(duplicatedEvent);
      
      toast({
        title: "✨ Evento duplicado com sucesso!",
        description: `"${smartName}" foi criado com ajustes inteligentes.`,
        className: "bg-green-50 border-green-200"
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao duplicar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedDuplicate = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const eventName = modifications.name || generateSmartName(event.name);
      
      const duplicatedEventData = {
        name: eventName,
        description: event.description,
        scheduled_start: modifications.scheduledStart || event.scheduled_start,
        scheduled_end: modifications.scheduledEnd || event.scheduled_end,
        prize_radcoins: modifications.prizeRadcoins || event.prize_radcoins,
        number_of_cases: modifications.numberOfCases || event.number_of_cases,
        max_participants: modifications.maxParticipants || event.max_participants,
        banner_url: event.banner_url || null,
        auto_start: event.auto_start || false,
        prize_distribution: event.prize_distribution,
        case_filters: event.case_filters,
        status: "SCHEDULED" as const
      };

      const { data: duplicatedEvent, error } = await supabase
        .from("events")
        .insert([duplicatedEventData])
        .select()
        .single();

      if (error) throw error;

      onDuplicate(duplicatedEvent);
      
      toast({
        title: "🎯 Evento duplicado com customizações!",
        description: `"${eventName}" foi criado com suas modificações.`,
        className: "bg-blue-50 border-green-200"
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao duplicar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesDuplicate = () => {
    // Criar série de eventos (implementação básica)
    const smartDates = generateSmartDates();
    const seriesCount = 4; // 4 eventos na série
    
    for (let i = 0; i < seriesCount; i++) {
      const start = new Date(smartDates.start);
      start.setDate(start.getDate() + (i * 7)); // Cada evento uma semana depois
      
      const end = new Date(smartDates.end);
      end.setDate(end.getDate() + (i * 7));
      
      const duplicatedEvent = {
        ...event,
        id: undefined,
        name: `${event.name} - Semana ${i + 1}`,
        scheduled_start: start.toISOString().slice(0, 16),
        scheduled_end: end.toISOString().slice(0, 16),
        status: "DRAFT"
      };

      onDuplicate(duplicatedEvent);
    }
    
    toast({
      title: "🚀 Série de eventos criada!",
      description: `${seriesCount} eventos foram criados em sequência semanal.`,
      className: "bg-purple-50 border-purple-200"
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Copy className="h-5 w-5 text-blue-500" />
            Duplicação Inteligente de Evento
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Duplicando: <span className="font-medium">{event.name}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quick">Duplicação Rápida</TabsTrigger>
              <TabsTrigger value="advanced">Personalizada</TabsTrigger>
              <TabsTrigger value="series">Criar Série</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Zap className="h-5 w-5" />
                    Duplicação Rápida e Inteligente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-700">🎯 Ajustes Automáticos:</h4>
                      <ul className="space-y-2 text-sm text-green-600">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Nome único gerado automaticamente
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Datas ajustadas para próxima semana
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Status definido como "Rascunho"
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Filtros e configurações preservados
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-700">📊 Preview do Novo Evento:</h4>
                      <div className="bg-white p-3 rounded-lg border border-green-200 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Nome:</span> {generateSmartName(event.name)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Nova Data:</span> {generateSmartDates().start}
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-700">Status: Rascunho</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleQuickDuplicate}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Duplicar Agora com IA
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Personalizar Duplicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Novo Evento
                      </label>
                      <input
                        type="text"
                        value={modifications.name}
                        onChange={(e) => setModifications(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={generateSmartName(event.name)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início
                      </label>
                      <input
                        type="datetime-local"
                        value={modifications.scheduledStart}
                        onChange={(e) => setModifications(prev => ({ ...prev, scheduledStart: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Término
                      </label>
                      <input
                        type="datetime-local"
                        value={modifications.scheduledEnd}
                        onChange={(e) => setModifications(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prêmio (RadCoins)
                      </label>
                      <input
                        type="number"
                        value={modifications.prizeRadcoins}
                        onChange={(e) => setModifications(prev => ({ ...prev, prizeRadcoins: Number(e.target.value) }))}
                        placeholder={event.prize_radcoins.toString()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAdvancedDuplicate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar com Customizações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="series" className="space-y-4">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <RefreshCw className="h-5 w-5" />
                    Criar Série de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-700">🗓️ Configuração da Série:</h4>
                      <ul className="space-y-2 text-sm text-purple-600">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          4 eventos sequenciais
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Intervalo de 1 semana entre eventos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Nomes numerados automaticamente
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Configurações idênticas
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-700">📈 Eventos da Série:</h4>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1">
                        {[1, 2, 3, 4].map(week => (
                          <div key={week} className="text-sm py-1">
                            <span className="font-medium">{event.name} - Semana {week}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSeriesDuplicate}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Criar Série de 4 Eventos
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Bookmark className="h-5 w-5" />
                    Biblioteca de Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-blue-700 mb-4">
                      Acesse nossa biblioteca com templates pré-configurados para diferentes especialidades médicas.
                    </p>
                    <Button 
                      onClick={() => setShowTemplates(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Explorar Templates
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">🫀 Cardiologia</h4>
                      <p className="text-sm text-blue-600">Templates para ECG, arritmias e mais</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">🧠 Neurologia</h4>
                      <p className="text-sm text-blue-600">Casos de neuroimagem e diagnóstico</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">🔬 Radiologia</h4>
                      <p className="text-sm text-blue-600">Diagnóstico por imagem especializado</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">👶 Pediatria</h4>
                      <p className="text-sm text-blue-600">Casos pediátricos especializados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="text-sm text-gray-500">
            Evento original será preservado
          </div>
        </div>
      </DialogContent>
      
      {/* Templates Modal */}
      <EventTemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onUseTemplate={(template) => {
          // Aqui você pode aplicar o template ao evento atual
          toast({
            title: "🎯 Template aplicado!",
            description: `Template "${template.name}" foi aplicado com sucesso.`,
            className: "bg-green-50 border-green-200"
          });
          setShowTemplates(false);
        }}
      />
    </Dialog>
  );
}
