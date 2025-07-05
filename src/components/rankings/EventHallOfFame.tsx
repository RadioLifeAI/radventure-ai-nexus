
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Star, Award, Medal, Flame } from "lucide-react";
import { EventFinalRankingData } from "@/hooks/useEventRankingsEnhanced";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventPodiumDisplay } from "./EventPodiumDisplay";

interface EventHallOfFameProps {
  hallOfFameData: EventFinalRankingData[];
  loading: boolean;
}

export function EventHallOfFame({ hallOfFameData, loading }: EventHallOfFameProps) {
  const [selectedCategory, setSelectedCategory] = useState("champions");

  console.log("🏆 EventHallOfFame - RENDER - Dados recebidos:", {
    dataLength: hallOfFameData?.length || 0, 
    loading, 
    data: hallOfFameData?.slice(0, 2) // Apenas os primeiros 2 para debug
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 bg-gray-200 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  // Análise dos dados para diferentes categorias
  const champions = hallOfFameData.filter(data => data.rank === 1);
  
  console.log("🏆 EventHallOfFame - Campeões filtrados (rank=1):", champions.length, champions);
  
  // Agrupar por usuário para encontrar múltiplos campeões
  const championsByUser = champions.reduce((acc, champion) => {
    const userId = champion.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: champion.user,
        victories: [],
        totalVictories: 0,
        totalRadCoins: 0
      };
    }
    acc[userId].victories.push(champion);
    acc[userId].totalVictories = acc[userId].victories.length;
    // USAR radcoins_awarded (valor real distribuído)
    acc[userId].totalRadCoins += champion.radcoins_awarded || 0;
    return acc;
  }, {} as Record<string, any>);

  const topChampions = Object.values(championsByUser)
    .sort((a: any, b: any) => b.totalVictories - a.totalVictories)
    .slice(0, 10);

  console.log("🏆 EventHallOfFame - PROCESSAMENTO FINAL:", {
    championsByUser: Object.keys(championsByUser).length,
    topChampions: topChampions.length,
    firstChampion: topChampions[0]
  });

  // Eventos mais recentes
  const recentEvents = hallOfFameData
    .sort((a, b) => new Date(b.event.scheduled_start).getTime() - new Date(a.event.scheduled_start).getTime())
    .slice(0, 10);

  // Maiores prêmios - CORRIGIDO: Usar radcoins_awarded (valor real ganho)
  const biggestPrizes = [...hallOfFameData]
    .sort((a, b) => (b.radcoins_awarded || 0) - (a.radcoins_awarded || 0))
    .slice(0, 10);

  console.log("🏆 EventHallOfFame - Maiores prêmios:", biggestPrizes.length, biggestPrizes);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "champions": return <Crown className="h-5 w-5" />;
      case "recent": return <Flame className="h-5 w-5" />;
      case "prizes": return <Medal className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const renderChampionCard = (champion: any, index: number) => {
    const podiumColors = [
      'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300',
      'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
      'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300'
    ];

    return (
      <Card key={champion.user.full_name + index} className={`${index < 3 ? podiumColors[index] : 'bg-white'} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {champion.user.avatar_url ? (
                  <img 
                    src={champion.user.avatar_url} 
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-md">
                    {champion.user.full_name?.charAt(0) || champion.user.username?.charAt(0) || '?'}
                  </div>
                )}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {champion.user.full_name || champion.user.username}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {champion.user.medical_specialty}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    {champion.totalVictories} vitória{champion.totalVictories !== 1 ? 's' : ''}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    {champion.totalRadCoins.toLocaleString()} RadCoins
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700">
                #{index + 1}
              </div>
              <Button size="sm" variant="outline" className="mt-2">
                Ver Perfil
              </Button>
            </div>
          </div>
          
          {/* Eventos recentes do campeão */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Últimas Vitórias:</p>
            <div className="space-y-1">
              {champion.victories.slice(0, 2).map((victory: any, vIndex: number) => (
                <div key={vIndex} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {victory.event.name}
                  </span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(victory.event.scheduled_start), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              ))}
              {champion.victories.length > 2 && (
                <p className="text-xs text-gray-500 italic">
                  +{champion.victories.length - 2} outras vitórias
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header do Hall da Fama */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Crown className="h-8 w-8" />
            Hall da Fama - Legends of RadVenture
          </CardTitle>
          <p className="text-purple-100">
            Os maiores campeões e performances históricas dos eventos RadVenture
          </p>
        </CardHeader>
      </Card>

      {/* Tabs de Categorias */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="champions" className="flex items-center gap-2">
            {getCategoryIcon("champions")}
            <span className="hidden sm:inline">Campeões</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            {getCategoryIcon("recent")}
            <span className="hidden sm:inline">Recentes</span>
          </TabsTrigger>
          <TabsTrigger value="prizes" className="flex items-center gap-2">
            {getCategoryIcon("prizes")}
            <span className="hidden sm:inline">Maiores Prêmios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="champions" className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Hall da Fama - Top Campeões
              <Crown className="h-8 w-8 text-yellow-500" />
            </h3>
            <p className="text-gray-600 text-lg">Os maiores campeões da história dos eventos RadVenture</p>
          </div>
          
          <EventPodiumDisplay topChampions={topChampions} />
          
          {/* Lista completa dos campeões (4º em diante) */}
          {topChampions.length > 3 && (
            <div className="mt-12">
              <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">Outros Campeões Históricos</h4>
              <div className="grid gap-4">
                {topChampions.slice(3).map((champion, index) => renderChampionCard(champion, index + 3))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🔥 Campeões Recentes</h3>
            <p className="text-gray-600">Últimos vencedores de eventos</p>
          </div>
          
          <div className="grid gap-3">
            {recentEvents.map((event, index) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.event.name}</h4>
                        <p className="text-sm text-gray-600">
                          Campeão: {event.user.full_name || event.user.username}
                        </p>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-xs">
                             Rank #{event.rank}
                           </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(event.event.scheduled_start), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                     <div className="text-right">
                       <div className="font-bold text-green-600">
                         {(event.radcoins_awarded || 0).toLocaleString()}
                       </div>
                       <div className="text-xs text-gray-500">RadCoins Ganhos</div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">💎 Maiores Prêmios</h3>
            <p className="text-gray-600">Eventos com os maiores prêmios em RadCoins</p>
          </div>
          
          <div className="grid gap-3">
            {biggestPrizes.map((event, index) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        index < 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.event.name}</h4>
                        <p className="text-sm text-gray-600">
                          Vencedor: {event.user.full_name || event.user.username}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(event.event.scheduled_start).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                     <div className="text-right">
                       <div className="text-2xl font-bold text-green-600">
                         {(event.radcoins_awarded || 0).toLocaleString()}
                       </div>
                        <div className="text-sm text-gray-500">RadCoins Ganhos</div>
                        <Badge className="mt-1 bg-yellow-100 text-yellow-700">
                          Rank #{event.rank}
                        </Badge>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
