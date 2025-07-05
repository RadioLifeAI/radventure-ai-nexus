
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Award, Trophy, Target } from "lucide-react";
import { EventFinalRankingData } from "@/hooks/useEventRankingsEnhanced";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventHistoryAnalyticsProps {
  historicalData: EventFinalRankingData[];
  loading: boolean;
}

export function EventHistoryAnalytics({ historicalData, loading }: EventHistoryAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-200 rounded-t-lg" />
            <CardContent className="h-40 bg-gray-100" />
          </Card>
        ))}
      </div>
    );
  }

  // Análise dos dados históricos
  const totalEvents = historicalData.length;
  const victoriesCount = historicalData.filter(event => event.rank === 1).length;
  const podiumCount = historicalData.filter(event => event.rank <= 3).length;
  const averageRank = totalEvents > 0 
    ? Math.round(historicalData.reduce((sum, event) => sum + event.rank, 0) / totalEvents)
    : 0;

      // Agrupar por status do evento
      const completedEvents = historicalData.filter(event => event.event?.status === 'FINISHED');
      const recentEvents = historicalData.slice(0, 5);

  // Estatísticas por mês (últimos 6 meses)
  const monthlyStats = React.useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        year: date.getFullYear(),
        events: 0,
        avgRank: 0
      };
    }).reverse();

    historicalData.forEach(event => {
      const eventDate = new Date(event.event?.scheduled_start || new Date());
      const monthIndex = months.findIndex(m => 
        eventDate.getMonth() === new Date(`${m.month} 1, ${m.year}`).getMonth() &&
        eventDate.getFullYear() === m.year
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].events++;
        months[monthIndex].avgRank += event.rank;
      }
    });

    return months.map(m => ({
      ...m,
      avgRank: m.events > 0 ? Math.round(m.avgRank / m.events) : 0
    }));
  }, [historicalData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINISHED': return 'bg-green-100 text-green-700 border-green-200';
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank <= 3) return 'text-orange-600 bg-orange-50';
    if (rank <= 10) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-700">{totalEvents}</div>
            <div className="text-sm text-blue-600">Eventos Participados</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{victoriesCount}</div>
            <div className="text-sm text-yellow-600">Vitórias</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700">{podiumCount}</div>
            <div className="text-sm text-green-600">Pódios (Top 3)</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-700">#{averageRank}</div>
            <div className="text-sm text-purple-600">Posição Média</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance dos Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700 w-16">
                    {stat.month}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {stat.events} eventos
                    </span>
                    {stat.events > 0 && (
                      <Badge variant="outline" className={getRankColor(stat.avgRank)}>
                        Média: #{stat.avgRank}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(stat.events * 20, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Eventos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento encontrado no histórico.</p>
                <p className="text-sm mt-2">Participe de eventos para ver seu histórico aqui!</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getRankColor(event.rank)}`}>
                      #{event.rank}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{event.event?.name || 'Evento'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <Badge className={getStatusColor(event.event?.status || 'UNKNOWN')}>
                           {event.event?.status === 'FINISHED' ? 'Finalizado' : 
                            event.event?.status === 'ACTIVE' ? 'Ativo' : 'Agendado'}
                        </Badge>
                         <span className="text-sm text-gray-500">
                           {formatDistanceToNow(new Date(event.event?.scheduled_start || new Date()), { 
                             addSuffix: true, 
                             locale: ptBR 
                           })}
                         </span>
                      </div>
                    </div>
                  </div>
                   <div className="text-right">
                     <div className="font-semibold text-gray-800">
                       {event.radcoins_awarded?.toLocaleString() || 0} RadCoins
                     </div>
                     <div className="text-sm text-gray-500">
                       {event.event?.prize_radcoins?.toLocaleString() || 0} Total do Evento
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
