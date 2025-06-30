
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Award, TrendingUp, Star, Target, Zap, Coins } from "lucide-react";
import { PersonalEventStats as PersonalStats } from "@/hooks/useEventRankingsEnhanced";

interface PersonalEventStatsProps {
  stats: PersonalStats | null;
  loading: boolean;
}

export function PersonalEventStats({ stats, loading }: PersonalEventStatsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 bg-gray-200 h-24" />
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6 bg-gray-100 h-48" />
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Sem Dados de Eventos
          </h3>
          <p className="text-gray-500 mb-6">
            Você ainda não participou de nenhum evento.
            <br />
            Participe para ver suas estatísticas aqui!
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            Explorar Eventos
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calcular taxa de sucesso
  const successRate = stats.totalParticipations > 0 
    ? Math.round((stats.topThreeCount / stats.totalParticipations) * 100)
    : 0;

  // Determinar nível baseado em participações e performance
  const getPlayerLevel = () => {
    if (stats.winCount >= 10) return { name: "Lenda", color: "from-purple-500 to-pink-500", icon: "👑" };
    if (stats.winCount >= 5) return { name: "Mestre", color: "from-orange-500 to-red-500", icon: "🔥" };
    if (stats.topThreeCount >= 10) return { name: "Expert", color: "from-blue-500 to-cyan-500", icon: "⭐" };
    if (stats.totalParticipations >= 10) return { name: "Veterano", color: "from-green-500 to-emerald-500", icon: "🎯" };
    if (stats.totalParticipations >= 3) return { name: "Competidor", color: "from-yellow-500 to-orange-500", icon: "⚡" };
    return { name: "Iniciante", color: "from-gray-500 to-gray-600", icon: "🌟" };
  };

  const playerLevel = getPlayerLevel();

  return (
    <div className="space-y-6">
      {/* Header com Nível do Player */}
      <Card className={`bg-gradient-to-r ${playerLevel.color} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{playerLevel.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">Nível {playerLevel.name}</h2>
                <p className="text-white/80">
                  {stats.totalParticipations} eventos • {stats.winCount} vitórias
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {stats.totalRadCoinsEarned.toLocaleString()}
              </div>
              <div className="text-white/80">RadCoins Ganhos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{stats.winCount}</div>
            <div className="text-sm text-yellow-600">Vitórias</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-700">{stats.topThreeCount}</div>
            <div className="text-sm text-orange-600">Pódios</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-700">#{stats.bestRank}</div>
            <div className="text-sm text-blue-600">Melhor Posição</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700">{successRate}%</div>
            <div className="text-sm text-green-600">Taxa de Pódio</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Resumo de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Participações</span>
                <Badge variant="outline">{stats.totalParticipations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posição Média</span>
                <Badge variant="outline">#{stats.averageRank}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de Vitória</span>
                <Badge className="bg-yellow-100 text-yellow-700">
                  {stats.totalParticipations > 0 
                    ? Math.round((stats.winCount / stats.totalParticipations) * 100)
                    : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">RadCoins por Evento</span>
                <Badge className="bg-green-100 text-green-700">
                  {stats.totalParticipations > 0 
                    ? Math.round(stats.totalRadCoinsEarned / stats.totalParticipations)
                    : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Próximos Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Objetivo baseado no nível atual */}
              {stats.winCount < 5 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-800">Próxima conquista</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Ganhe {5 - stats.winCount} evento(s) para se tornar Mestre
                  </p>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.winCount / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {stats.topThreeCount < 10 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Meta de Pódios</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Chegue ao pódio mais {10 - stats.topThreeCount} vez(es)
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.topThreeCount / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Meta RadCoins</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {(Math.ceil(stats.totalRadCoinsEarned / 1000) * 1000).toLocaleString()}
                </div>
                <p className="text-sm text-green-600">Próxima meta de RadCoins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos Recentes */}
      {stats.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      event.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      event.rank <= 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      #{event.rank}
                    </div>
                    <div>
                      <div className="font-medium">{event.event.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.event.scheduled_start).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{event.score} pts</div>
                    <div className="text-sm text-gray-500">
                      {event.event.prize_radcoins.toLocaleString()} RadCoins
                    </div>
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
