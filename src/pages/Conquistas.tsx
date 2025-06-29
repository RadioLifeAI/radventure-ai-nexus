
import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Crown,
  Star,
  Award,
  Target,
  Flame,
  Zap,
  TrendingUp,
  Filter,
  Search,
  Gift,
  Coins
} from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Conquistas() {
  const { user } = useAuth();
  const { achievements, userProgress, getCompletedAchievements, getInProgressAchievements, loading: achievementsLoading } = useAchievements();
  const { globalRankings, userRank, loading: rankingsLoading } = useUserRankings();
  
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("profiles")
        .select("total_points, current_streak, radcoin_balance")
        .eq("id", user.id)
        .single();
      
      setUserProfile(data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const completedAchievements = getCompletedAchievements();
  const inProgressAchievements = getInProgressAchievements();

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-100 text-gray-700 border-gray-300",
      rare: "bg-blue-100 text-blue-700 border-blue-300",
      epic: "bg-purple-100 text-purple-700 border-purple-300",
      legendary: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-400"
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: Star,
      rare: Award,
      epic: Crown,
      legendary: Trophy
    };
    const IconComponent = icons[rarity as keyof typeof icons] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  // Filtrar conquistas
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === "all" || achievement.rarity === filterRarity;
    
    let matchesStatus = true;
    if (filterStatus === "completed") {
      matchesStatus = userProgress.some(p => p.achievement_id === achievement.id && p.is_completed);
    } else if (filterStatus === "in_progress") {
      matchesStatus = userProgress.some(p => p.achievement_id === achievement.id && !p.is_completed && p.current_progress > 0);
    } else if (filterStatus === "not_started") {
      matchesStatus = !userProgress.some(p => p.achievement_id === achievement.id);
    }
    
    return matchesSearch && matchesRarity && matchesStatus;
  });

  const calculateTotalRadCoins = () => {
    return completedAchievements.reduce((total, progress) => {
      return total + (progress.achievement.rewards?.radcoins || 0);
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <main className="flex-1 flex flex-col px-4 md:px-16 pt-6 pb-10">
          <div className="mb-6">
            <BackToDashboard variant="back" />
          </div>
          
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sistema de Conquistas
              </h2>
              <p className="text-gray-600 mb-6">
                Faça login para acessar suas conquistas, progresso e recompensas em RadCoins!
              </p>
              <Button onClick={() => window.location.href = '/login'} size="lg">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-4 md:px-16 pt-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackToDashboard variant="back" />
            <div>
              <h1 className="font-extrabold text-3xl md:text-4xl text-white mb-2 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Sistema de Conquistas
              </h1>
              <p className="text-cyan-100 text-lg">
                Desbloqueie conquistas épicas e ganhe RadCoins! 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Pontos Totais</p>
                  <p className="text-2xl font-bold">{userProfile?.total_points?.toLocaleString() || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">RadCoins Ganhos</p>
                  <p className="text-2xl font-bold">{calculateTotalRadCoins()}</p>
                </div>
                <Coins className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Ranking Global</p>
                  <p className="text-2xl font-bold">#{userRank || '---'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Sequência Atual</p>
                  <p className="text-2xl font-bold">{userProfile?.current_streak || 0} dias</p>
                </div>
                <Flame className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-cyan-300" />
                <Input
                  placeholder="Buscar conquistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="common">Comum</SelectItem>
                    <SelectItem value="rare">Rara</SelectItem>
                    <SelectItem value="epic">Épica</SelectItem>
                    <SelectItem value="legendary">Lendária</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="not_started">Não Iniciadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conquistas */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20 text-white">
              Todas ({filteredAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white/20 text-white">
              Concluídas ({completedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-white/20 text-white">
              Em Progresso ({inProgressAchievements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {achievementsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-cyan-200">Carregando conquistas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => {
                  const userAchievement = userProgress.find(p => p.achievement_id === achievement.id);
                  const isCompleted = userAchievement?.is_completed || false;
                  const progress = userAchievement?.current_progress || 0;
                  const radCoinsReward = achievement.rewards?.radcoins || 0;

                  return (
                    <Card 
                      key={achievement.id} 
                      className={`border-2 transition-all duration-300 hover:scale-105 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
                          : 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          {achievement.icon_url ? (
                            <img 
                              src={achievement.icon_url} 
                              alt="" 
                              className="w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isCompleted ? 'bg-green-400' : 'bg-gray-600'
                            }`}>
                              {getRarityIcon(achievement.rarity)}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-white">{achievement.name}</h3>
                              <Badge className={getRarityColor(achievement.rarity)}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-cyan-200 mb-3">{achievement.description}</p>
                            
                            {radCoinsReward > 0 && (
                              <div className="flex items-center gap-1 mb-3">
                                <Coins className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-400">
                                  {radCoinsReward} RadCoins
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isCompleted && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-cyan-200">Progresso</span>
                              <span className="text-white">{progress}/{achievement.points_required}</span>
                            </div>
                            <Progress 
                              value={(progress / achievement.points_required) * 100} 
                              className="h-2 bg-white/20"
                            />
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-lg">
                            <Trophy className="h-5 w-5 text-green-400" />
                            <span className="font-medium text-green-400">Conquistada!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAchievements.map((progress) => (
                <Card key={progress.id} className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {progress.achievement.icon_url ? (
                        <img 
                          src={progress.achievement.icon_url} 
                          alt="" 
                          className="w-12 h-12 rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                          {getRarityIcon(progress.achievement.rarity)}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{progress.achievement.name}</h3>
                          <Badge className={getRarityColor(progress.achievement.rarity)}>
                            {progress.achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-cyan-200 mb-2">{progress.achievement.description}</p>
                        <p className="text-xs text-green-400">
                          Conquistada em {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString('pt-BR') : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-400" />
                      <span className="font-medium text-green-400">Conquistada!</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAchievements.map((progress) => (
                <Card key={progress.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {progress.achievement.icon_url ? (
                        <img 
                          src={progress.achievement.icon_url} 
                          alt="" 
                          className="w-12 h-12 rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                          {getRarityIcon(progress.achievement.rarity)}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{progress.achievement.name}</h3>
                          <Badge className={getRarityColor(progress.achievement.rarity)}>
                            {progress.achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-cyan-200 mb-3">{progress.achievement.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-200">Progresso</span>
                        <span className="text-white">{progress.current_progress}/{progress.achievement.points_required}</span>
                      </div>
                      <Progress 
                        value={(progress.current_progress / progress.achievement.points_required) * 100} 
                        className="h-2 bg-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
