
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Trophy, Target, Zap, Star, Calendar, TrendingUp, Award, Users, Clock, Brain } from "lucide-react";

export default function Estatisticas() {
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mock data para demonstração
  const performanceData = [
    { date: '01/12', points: 1200, rank: 15, accuracy: 78 },
    { date: '08/12', points: 1450, rank: 12, accuracy: 82 },
    { date: '15/12', points: 1680, rank: 8, accuracy: 85 },
    { date: '22/12', points: 1890, rank: 6, accuracy: 87 },
    { date: '29/12', points: 2100, rank: 4, accuracy: 89 },
    { date: '05/01', points: 2350, rank: 3, accuracy: 91 },
  ];

  const specialtyData = [
    { specialty: 'Neurorradiologia', cases: 45, accuracy: 87, avgTime: 4.2 },
    { specialty: 'Tórax', cases: 32, accuracy: 92, avgTime: 3.8 },
    { specialty: 'Abdome', cases: 28, accuracy: 85, avgTime: 5.1 },
    { specialty: 'Musculoesquelético', cases: 25, accuracy: 89, avgTime: 4.5 },
    { specialty: 'Cabeça e Pescoço', cases: 18, accuracy: 83, avgTime: 4.8 },
  ];

  const weeklyActivity = [
    { day: 'Seg', cases: 8, points: 120 },
    { day: 'Ter', cases: 12, points: 180 },
    { day: 'Qua', cases: 6, points: 90 },
    { day: 'Qui', cases: 15, points: 225 },
    { day: 'Sex', cases: 10, points: 150 },
    { day: 'Sáb', cases: 5, points: 75 },
    { day: 'Dom', cases: 3, points: 45 },
  ];

  const achievementProgress = [
    { name: 'Especialista em Neuro', current: 45, target: 50, percentage: 90 },
    { name: 'Sequência de Ouro', current: 15, target: 20, percentage: 75 },
    { name: 'Mestre do Tórax', current: 32, target: 40, percentage: 80 },
    { name: 'Velocista', current: 28, target: 30, percentage: 93 },
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchUserStats();
  }, []);

  async function fetchUserStats() {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
      
      // Mock stats - em produção, buscar do banco
      setUserStats({
        totalCases: 148,
        correctAnswers: 127,
        accuracy: 86,
        averageTime: 4.2,
        streak: 15,
        radcoinsEarned: 2450,
        rank: 4,
        weeklyGoal: 25,
        weeklyCompleted: 18,
      });
    }
    
    setLoading(false);
  }

  const getPlayerLevel = (points: number) => {
    if (points >= 5000) return { level: "Expert", color: "bg-purple-500", icon: Award };
    if (points >= 2000) return { level: "Especialista", color: "bg-blue-500", icon: Star };
    if (points >= 500) return { level: "Intermediário", color: "bg-green-500", icon: Target };
    return { level: "Iniciante", color: "bg-gray-500", icon: Zap };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-cyan-400 text-center animate-fade-in">
            Carregando estatísticas...
          </div>
        </main>
      </div>
    );
  }

  const playerLevel = getPlayerLevel(currentUser?.total_points || 0);
  const LevelIcon = playerLevel.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <Brain size={36} className="text-cyan-400" />
            <div>
              <h1 className="font-extrabold text-3xl">Suas Estatísticas</h1>
              <p className="text-cyan-100 text-lg">Acompanhe sua evolução e performance detalhada</p>
            </div>
          </div>

          {/* Profile Header */}
          {currentUser && (
            <Card className="mb-6 bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 border-2 border-cyan-200 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-4 border-cyan-300">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold text-xl">
                      {currentUser.full_name?.[0] || currentUser.username?.[0] || "J"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {currentUser.full_name || currentUser.username}
                      </h2>
                      <Badge className={`text-white ${playerLevel.color}`}>
                        <LevelIcon size={16} className="mr-1" />
                        {playerLevel.level}
                      </Badge>
                      <Badge variant="outline" className="text-cyan-700 border-cyan-300">
                        #{userStats?.rank || 'N/A'} no ranking
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-700">{currentUser.total_points || 0}</div>
                        <div className="text-sm text-gray-600">Pontos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">{userStats?.totalCases || 0}</div>
                        <div className="text-sm text-gray-600">Casos Resolvidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">{userStats?.accuracy || 0}%</div>
                        <div className="text-sm text-gray-600">Precisão</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700">{userStats?.streak || 0}</div>
                        <div className="text-sm text-gray-600">Sequência</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white/90 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 rounded-full">
                    <Target className="text-cyan-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Meta Semanal</h3>
                    <p className="text-sm text-gray-500">Casos para resolver</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold text-cyan-700">{userStats?.weeklyCompleted || 0}</span>
                    <span className="text-gray-500">/ {userStats?.weeklyGoal || 25}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((userStats?.weeklyCompleted || 0) / (userStats?.weeklyGoal || 25)) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Tempo Médio</h3>
                    <p className="text-sm text-gray-500">Por caso resolvido</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">{userStats?.averageTime || 0}min</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Trophy className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">RadCoins</h3>
                    <p className="text-sm text-gray-500">Total ganho</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-700">{userStats?.radcoinsEarned || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Star className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Melhor Sequência</h3>
                    <p className="text-sm text-gray-500">Acertos consecutivos</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-700">{userStats?.streak || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Performance Evolution */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-cyan-500" size={20} />
                  Evolução de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="points" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-purple-500" size={20} />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cases" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Specialty Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-blue-500" size={20} />
                  Performance por Especialidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialtyData.map((specialty, index) => (
                    <div key={specialty.specialty} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{specialty.specialty}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">{specialty.cases} casos</span>
                          <span className="text-green-600 font-semibold">{specialty.accuracy}%</span>
                          <span className="text-blue-600">{specialty.avgTime}min</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${specialty.accuracy}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Progress */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="text-yellow-500" size={20} />
                  Conquistas em Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievementProgress.map((achievement, index) => (
                    <div key={achievement.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{achievement.name}</span>
                        <span className="text-gray-500">{achievement.current}/{achievement.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${achievement.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">{achievement.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
