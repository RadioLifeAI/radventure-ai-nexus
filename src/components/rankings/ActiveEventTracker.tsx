
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Target, Users, Zap } from "lucide-react";
import { EventRankingData } from "@/hooks/useEventRankingsEnhanced";
import { useAuth } from "@/hooks/useAuth";

interface ActiveEventTrackerProps {
  rankings: EventRankingData[];
  loading: boolean;
}

export function ActiveEventTracker({ rankings, loading }: ActiveEventTrackerProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  // Agrupar rankings por evento
  const eventGroups = rankings.reduce((acc, ranking) => {
    const eventId = ranking.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: ranking.event,
        rankings: []
      };
    }
    acc[eventId].rankings.push(ranking);
    return acc;
  }, {} as Record<string, { event: any; rankings: EventRankingData[] }>);

  // Atualizar contadores de tempo
  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeLeft: Record<string, string> = {};
      
      Object.values(eventGroups).forEach(({ event }) => {
        const endTime = new Date(event.scheduled_end).getTime();
        const now = new Date().getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          newTimeLeft[event.id] = `${hours}h ${minutes}m`;
        } else {
          newTimeLeft[event.id] = "Finalizado";
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(interval);
  }, [eventGroups]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-200 rounded-t-lg" />
            <CardContent className="h-32 bg-gray-100" />
          </Card>
        ))}
      </div>
    );
  }

  if (Object.keys(eventGroups).length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum Evento Ativo
          </h3>
          <p className="text-gray-500 mb-4">
            Não há eventos em andamento no momento.
          </p>
          <Button variant="outline" size="sm">
            Ver Eventos Programados
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.values(eventGroups).map(({ event, rankings }) => {
        // Encontrar posição do usuário atual
        const userRanking = rankings.find(r => r.user_id === user?.id);
        const topRankings = rankings.slice(0, 10);
        
        return (
          <Card key={event.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-800">
                      {event.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <Zap className="h-3 w-3 mr-1" />
                        Ao Vivo
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {timeLeft[event.id] || "Calculando..."}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {rankings.length} participantes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {event.prize_radcoins.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">RadCoins</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Posição do usuário atual */}
              {userRanking && (
                <div className="mb-4 p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg border border-cyan-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-800">Sua Posição Atual:</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-500 text-white">
                        #{userRanking.rank}
                      </Badge>
                      <span className="text-cyan-700 font-semibold">
                        {userRanking.score} pontos
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Top Rankings */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Top 10 Atual
                </h4>
                
                <div className="grid gap-2">
                  {topRankings.map((ranking, index) => {
                    const isCurrentUser = ranking.user_id === user?.id;
                    const podiumColors = ['text-yellow-600', 'text-gray-500', 'text-orange-600'];
                    
                    return (
                      <div
                        key={ranking.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                          isCurrentUser 
                            ? 'bg-cyan-100 border border-cyan-300 shadow-sm' 
                            : 'bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${index < 3 ? podiumColors[index] : 'text-gray-600'}`}>
                            #{ranking.rank}
                          </span>
                          {ranking.user.avatar_url ? (
                            <img 
                              src={ranking.user.avatar_url} 
                              alt="Avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {ranking.user.full_name?.charAt(0) || ranking.user.username?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {ranking.user.full_name || ranking.user.username}
                              {isCurrentUser && <span className="text-cyan-600 ml-1">(Você)</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ranking.user.medical_specialty}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            {ranking.score.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">pontos</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Ações */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Entrar no Evento
                </Button>
                <Button variant="outline" size="sm">
                  Ver Ranking Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
