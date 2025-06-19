
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  Target,
  Clock,
  Star,
  Download,
  Share2,
  RefreshCw
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventAdvancedAnalyticsModal({ open, onClose, event }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");

  if (!event) return null;

  // Mock data para demonstração
  const participationData = [
    { hour: "14:00", participants: 12 },
    { hour: "14:30", participants: 25 },
    { hour: "15:00", participants: 45 },
    { hour: "15:30", participants: 38 },
    { hour: "16:00", participants: 42 },
    { hour: "16:30", participants: 35 },
    { hour: "17:00", participants: 28 }
  ];

  const performanceData = [
    { case: "Caso 1", accuracy: 85, avgTime: 45 },
    { case: "Caso 2", accuracy: 92, avgTime: 38 },
    { case: "Caso 3", accuracy: 78, avgTime: 52 },
    { case: "Caso 4", accuracy: 88, avgTime: 41 },
    { case: "Caso 5", accuracy: 95, avgTime: 35 }
  ];

  const demographicsData = [
    { name: "Residentes", value: 45, color: "#3B82F6" },
    { name: "Especialistas", value: 30, color: "#10B981" },
    { name: "Estudantes", value: 25, color: "#F59E0B" }
  ];

  const engagementData = [
    { metric: "Tempo Médio", value: "42 min", trend: "+8%" },
    { metric: "Taxa de Conclusão", value: "87%", trend: "+12%" },
    { metric: "Satisfação", value: "4.6/5", trend: "+0.3" },
    { metric: "Retorno", value: "73%", trend: "+15%" }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Analytics Avançado
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Análise detalhada: <span className="font-medium">{event.name}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Compartilhar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="participation">Participação</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="demographics">Demografia</TabsTrigger>
              <TabsTrigger value="detailed">Detalhado</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* KPIs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">148</div>
                    <div className="text-sm text-gray-600">Participantes</div>
                    <Badge className="mt-1 bg-green-100 text-green-700">+23%</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-gray-600">Taxa de Conclusão</div>
                    <Badge className="mt-1 bg-green-100 text-green-700">+12%</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">42m</div>
                    <div className="text-sm text-gray-600">Tempo Médio</div>
                    <Badge className="mt-1 bg-yellow-100 text-yellow-700">+8%</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">4.6</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                    <Badge className="mt-1 bg-purple-100 text-purple-700">+0.3</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Engajamento ao Longo do Tempo */}
              <Card>
                <CardHeader>
                  <CardTitle>Participação ao Longo do Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={participationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="participants" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participation" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Participação por Hora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={participationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="participants" stroke="#3B82F6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Engajamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {engagementData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{item.metric}</div>
                          <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {item.trend}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Caso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="case" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="accuracy" fill="#10B981" name="Precisão (%)" />
                      <Bar yAxisId="right" dataKey="avgTime" fill="#F59E0B" name="Tempo Médio (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={demographicsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {demographicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas Detalhadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {demographicsData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{item.value}</div>
                          <div className="text-sm text-gray-500">participantes</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Detalhado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Resumo Executivo</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• 148 participantes únicos</li>
                          <li>• 87% taxa de conclusão</li>
                          <li>• 4.6/5 satisfação média</li>
                          <li>• 42 min tempo médio</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Pontos Fortes</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Alta participação</li>
                          <li>• Boa retenção</li>
                          <li>• Casos bem balanceados</li>
                          <li>• Feedback positivo</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Oportunidades</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Reduzir tempo do Caso 3</li>
                          <li>• Melhorar clareza</li>
                          <li>• Adicionar hints</li>
                          <li>• Gamificar mais</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Recomendações para Próximos Eventos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <h5 className="font-medium mb-2">Melhorias Técnicas:</h5>
                          <ul className="space-y-1">
                            <li>• Otimizar casos com baixa precisão</li>
                            <li>• Adicionar mais dicas contextuais</li>
                            <li>• Implementar sistema de hints adaptativo</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Melhorias de Experiência:</h5>
                          <ul className="space-y-1">
                            <li>• Aumentar elementos de gamificação</li>
                            <li>• Adicionar ranking em tempo real</li>
                            <li>• Implementar sistema de badges</li>
                          </ul>
                        </div>
                      </div>
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Exportar PDF
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar Insights
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
