
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Crown,
  Zap,
  Target,
  Users,
  Sword,
  Shield,
  Star,
  Gift,
  Flame,
  Medal,
  Award
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  reward: number;
  unlocked: boolean;
}

interface Tournament {
  id: string;
  name: string;
  specialty: string;
  participants: number;
  maxParticipants: number;
  prize: number;
  startDate: string;
  status: 'upcoming' | 'active' | 'finished';
}

export function EventsGamificationHub() {
  const [activeTab, setActiveTab] = useState("achievements");

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Radiologia Master",
      description: "Complete 50 casos de radiologia com 90% de precisão",
      icon: Award,
      rarity: "epic",
      progress: 35,
      maxProgress: 50,
      reward: 500,
      unlocked: false
    },
    {
      id: "2",
      name: "Streak Champion",
      description: "Mantenha uma sequência de 15 dias consecutivos",
      icon: Flame,
      rarity: "rare",
      progress: 12,
      maxProgress: 15,
      reward: 300,
      unlocked: false
    },
    {
      id: "3",
      name: "Speed Demon",
      description: "Complete um evento em menos de 5 minutos",
      icon: Zap,
      rarity: "common",
      progress: 1,
      maxProgress: 1,
      reward: 100,
      unlocked: true
    },
    {
      id: "4",
      name: "Tournament Winner",
      description: "Vença um torneio oficial",
      icon: Crown,
      rarity: "legendary",
      progress: 0,
      maxProgress: 1,
      reward: 1000,
      unlocked: false
    }
  ];

  const tournaments: Tournament[] = [
    {
      id: "1",
      name: "Copa Neurologia 2024",
      specialty: "Neurologia",
      participants: 45,
      maxParticipants: 64,
      prize: 2000,
      startDate: "2024-06-25T19:00:00",
      status: "upcoming"
    },
    {
      id: "2",
      name: "Desafio Cardio Elite",
      specialty: "Cardiologia",
      participants: 32,
      maxParticipants: 32,
      prize: 1500,
      startDate: "2024-06-20T14:00:00",
      status: "active"
    },
    {
      id: "3",
      name: "Liga Radiologia Pro",
      specialty: "Radiologia",
      participants: 28,
      maxParticipants: 50,
      prize: 3000,
      startDate: "2024-07-01T20:00:00",
      status: "upcoming"
    }
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-100 text-gray-700 border-gray-300",
      rare: "bg-blue-100 text-blue-700 border-blue-300",
      epic: "bg-purple-100 text-purple-700 border-purple-300",
      legendary: "bg-yellow-100 text-yellow-700 border-yellow-300"
    };
    return colors[rarity as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      finished: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Trophy className="h-6 w-6" />
            Hub de Gamificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Medal className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-sm text-gray-600">Total de Pontos</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-600">Conquistas</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Dias de Streak</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-gray-600">Precisão Média</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
              <TabsTrigger value="tournaments">Torneios</TabsTrigger>
              <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`relative overflow-hidden ${
                    achievement.unlocked ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-white'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <achievement.icon className={`h-6 w-6 ${
                            achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-yellow-600 font-medium">
                              +{achievement.reward} RC
                            </span>
                            {achievement.unlocked && (
                              <Badge className="bg-green-100 text-green-700">
                                <Star className="h-3 w-3 mr-1" />
                                Conquistado!
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tournaments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status === 'upcoming' ? 'Em Breve' :
                           tournament.status === 'active' ? 'Ao Vivo' : 'Finalizado'}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Trophy className="h-4 w-4" />
                          <span className="font-medium">{tournament.prize} RC</span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{tournament.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">Especialidade: {tournament.specialty}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {tournament.participants}/{tournament.maxParticipants} participantes
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={(tournament.participants / tournament.maxParticipants) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          Início: {new Date(tournament.startDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full mt-4"
                        variant={tournament.status === 'active' ? 'default' : 'outline'}
                        disabled={tournament.status === 'finished'}
                      >
                        {tournament.status === 'upcoming' ? 'Inscrever-se' :
                         tournament.status === 'active' ? 'Participar Agora' : 'Finalizado'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <div className="space-y-3">
                {[
                  { position: 1, name: "Dr. Silva", specialty: "Neurologia", points: 2847, badge: "👑" },
                  { position: 2, name: "Dra. Costa", specialty: "Cardiologia", points: 2634, badge: "🥈" },
                  { position: 3, name: "Dr. Santos", specialty: "Radiologia", points: 2521, badge: "🥉" },
                  { position: 4, name: "Dra. Lima", specialty: "Dermatologia", points: 2398, badge: "🏅" },
                  { position: 5, name: "Dr. Oliveira", specialty: "Neurologia", points: 2287, badge: "🏅" }
                ].map((player) => (
                  <Card key={player.position} className={`${
                    player.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-white'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{player.badge}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{player.name}</h3>
                            <p className="text-sm text-gray-600">{player.specialty}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{player.points}</p>
                          <p className="text-sm text-gray-500">pontos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
