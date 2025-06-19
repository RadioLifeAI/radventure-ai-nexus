
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Flame,
  Crown,
  Award,
  Users,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Medal,
  Gem,
  Brain,
  Clock
} from "lucide-react";

interface Props {
  userProgress: any;
}

export function GamificationHub({ userProgress }: Props) {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const achievements = [
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Manteve 30 dias consecutivos de estudo",
      icon: Flame,
      progress: 85,
      maxProgress: 100,
      rarity: "legendary",
      unlocked: false,
      reward: "100 RadCoins + Título especial"
    },
    {
      id: "neuro-expert",
      title: "Especialista Neuro",
      description: "Acertou 100 casos de neurorradiologia",
      icon: Brain,
      progress: 100,
      maxProgress: 100,
      rarity: "epic",
      unlocked: true,
      reward: "50 RadCoins + Badge Dourada"
    },
    {
      id: "speed-demon",
      title: "Speed Demon",
      description: "Resolveu 10 casos em menos de 5 minutos cada",
      icon: Zap,
      progress: 60,
      maxProgress: 100,
      rarity: "rare",
      unlocked: false,
      reward: "30 RadCoins + Boost de velocidade"
    },
    {
      id: "perfectionist",
      title: "Perfeccionista",
      description: "Conseguiu 100% de acerto em 20 casos seguidos",
      icon: Target,
      progress: 40,
      maxProgress: 100,
      rarity: "epic",
      unlocked: false,
      reward: "75 RadCoins + Título Perfeccionista"
    }
  ];

  const weeklyChallenge = {
    title: "Desafio da Semana: Radiologia de Emergência",
    description: "Complete 25 casos de emergência com 90%+ de acerto",
    progress: 16,
    maxProgress: 25,
    timeLeft: "3 dias, 14 horas",
    reward: "150 RadCoins + Badge Emergência",
    participants: 1247
  };

  const leaderboard = [
    { rank: 1, name: "Dr. Silva", points: 2850, badge: "👑" },
    { rank: 2, name: "Dra. Santos", points: 2720, badge: "🥈" },
    { rank: 3, name: "Dr. Oliveira", points: 2590, badge: "🥉" },
    { rank: 4, name: "Você", points: userProgress?.totalPoints || 2340, badge: "" },
    { rank: 5, name: "Dr. Costa", points: 2280, badge: "" }
  ];

  const specialtyTournaments = [
    {
      specialty: "Neurorradiologia",
      participants: 89,
      timeLeft: "2 dias",
      prize: "300 RadCoins",
      status: "active"
    },
    {
      specialty: "Radiologia Torácica", 
      participants: 156,
      timeLeft: "5 dias",
      prize: "250 RadCoins",
      status: "registering"
    },
    {
      specialty: "Radiologia Abdominal",
      participants: 203,
      timeLeft: "1 semana",
      prize: "400 RadCoins",
      status: "upcoming"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-purple-500 to-pink-500";
      case "epic": return "from-blue-500 to-purple-500";
      case "rare": return "from-green-500 to-blue-500";
      case "common": return "from-gray-500 to-gray-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-purple-400";
      case "epic": return "border-blue-400";
      case "rare": return "border-green-400";
      case "common": return "border-gray-400";
      default: return "border-gray-400";
    }
  };

  // Simulated current streak data
  const currentStreak = Math.floor(Math.random() * 20) + 5;

  return (
    <div className="space-y-6">
      {/* Progress Rings Animados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Nível Atual", value: Math.floor((userProgress?.totalPoints || 0) / 100) + 1, max: 50, color: "text-purple-400" },
          { label: "Streak", value: currentStreak, max: 30, color: "text-orange-400" },
          { label: "Conquistas", value: achievements.filter(a => a.unlocked).length, max: achievements.length, color: "text-yellow-400" },
          { label: "Rank Semanal", value: 4, max: 10, color: "text-green-400" }
        ].map((ring, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-4">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${(ring.value / ring.max) * 175.929} 175.929`}
                    className={ring.color}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{ring.value}</span>
                </div>
              </div>
              <p className="text-white text-sm font-medium">{ring.label}</p>
              <p className="text-gray-300 text-xs">de {ring.max}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema de Conquistas */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Conquistas e Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 ${getRarityBorder(achievement.rarity)} ${
                  achievement.unlocked ? 'bg-gradient-to-r ' + getRarityColor(achievement.rarity) + ' bg-opacity-20' : 'bg-white/5'
                } cursor-pointer hover:bg-white/10 transition-all`}
                onClick={() => setSelectedAchievement(achievement.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <achievement.icon className={`h-6 w-6 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <div>
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-300'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && <Crown className="h-5 w-5 text-yellow-400" />}
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-2 bg-white/20 mb-2" 
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-300">
                    {achievement.reward}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leaderboard e Competições */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Medal className="h-5 w-5 text-gold-400" />
              Ranking e Competições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Leaderboard Semanal</h4>
              {leaderboard.map((player, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  player.name === "Você" ? 'bg-cyan-600/30 border border-cyan-400' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold w-6">#{player.rank}</span>
                    <span className="text-lg">{player.badge}</span>
                    <span className={`${player.name === "Você" ? 'text-cyan-300 font-bold' : 'text-white'}`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-medium">{player.points} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desafio Semanal */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-blue-300/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            {weeklyChallenge.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <p className="text-blue-200 mb-4">{weeklyChallenge.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-300">Progresso</span>
                  <span className="text-white">{weeklyChallenge.progress}/{weeklyChallenge.maxProgress}</span>
                </div>
                <Progress value={(weeklyChallenge.progress / weeklyChallenge.maxProgress) * 100} className="h-3 bg-white/20" />
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300">{weeklyChallenge.participants} participantes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300">{weeklyChallenge.timeLeft}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-center mb-4">
                <Gem className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-300 font-medium">{weeklyChallenge.reward}</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Continuar Desafio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Torneios por Especialidade */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Torneios por Especialidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {specialtyTournaments.map((tournament, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="text-white font-medium mb-2">{tournament.specialty}</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Participantes</span>
                    <span className="text-white">{tournament.participants}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Tempo restante</span>
                    <span className="text-white">{tournament.timeLeft}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Prêmio</span>
                    <span className="text-yellow-400">{tournament.prize}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className={`w-full ${
                    tournament.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                    tournament.status === 'registering' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-gray-600 hover:bg-gray-700'
                  }`}
                  disabled={tournament.status === 'upcoming'}
                >
                  {tournament.status === 'active' ? 'Participar' :
                   tournament.status === 'registering' ? 'Inscrever-se' :
                   'Em breve'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
