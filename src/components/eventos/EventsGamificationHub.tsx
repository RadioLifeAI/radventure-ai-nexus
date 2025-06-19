
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Flame,
  Star,
  Award,
  Crown,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useAuth } from "@/hooks/useAuth";

export function EventsGamificationHub() {
  const { user } = useAuth();
  const { achievements, userProgress, getCompletedAchievements, getInProgressAchievements, loading: achievementsLoading } = useAchievements();
  const { globalRankings, userRank, loading: rankingsLoading } = useUserRankings();

  const completedAchievements = getCompletedAchievements();
  const inProgressAchievements = getInProgressAchievements();

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-100 text-gray-700",
      rare: "bg-blue-100 text-blue-700",
      epic: "bg-purple-100 text-purple-700",
      legendary: "bg-yellow-100 text-yellow-700"
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

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hub de Gamificação
            </h3>
            <p className="text-gray-600 mb-4">
              Faça login para acessar seu progresso, conquistas e rankings!
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Usuário */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Pontos Totais</p>
                <p className="text-2xl font-bold">{user.total_points?.toLocaleString() || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
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

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Sequência Atual</p>
                <p className="text-2xl font-bold">{user.current_streak || 0} dias</p>
              </div>
              <Flame className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Conquistas</p>
                <p className="text-2xl font-bold">{completedAchievements.length}/{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Sistema de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsLoading ? (
            <div className="text-center py-8">Carregando conquistas...</div>
          ) : (
            <div className="space-y-6">
              {/* Conquistas em Progresso */}
              {inProgressAchievements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Em Progresso</h4>
                  <div className="space-y-3">
                    {inProgressAchievements.slice(0, 3).map((progress) => (
                      <div key={progress.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {progress.achievement.icon_url ? (
                              <img 
                                src={progress.achievement.icon_url} 
                                alt="" 
                                className="w-8 h-8 rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                {getRarityIcon(progress.achievement.rarity)}
                              </div>
                            )}
                            <div>
                              <h5 className="font-medium">{progress.achievement.name}</h5>
                              <p className="text-sm text-gray-600">{progress.achievement.description}</p>
                            </div>
                          </div>
                          <Badge className={getRarityColor(progress.achievement.rarity)}>
                            {progress.achievement.rarity}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{progress.current_progress}/{progress.achievement.points_required}</span>
                          </div>
                          <Progress 
                            value={(progress.current_progress / progress.achievement.points_required) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conquistas Concluídas Recentes */}
              {completedAchievements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Conquistas Recentes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {completedAchievements.slice(0, 6).map((progress) => (
                      <div key={progress.id} className="border rounded-lg p-3 bg-green-50">
                        <div className="flex items-center gap-2 mb-2">
                          {progress.achievement.icon_url ? (
                            <img 
                              src={progress.achievement.icon_url} 
                              alt="" 
                              className="w-6 h-6 rounded"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center">
                              {getRarityIcon(progress.achievement.rarity)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h6 className="font-medium text-sm">{progress.achievement.name}</h6>
                            <p className="text-xs text-gray-600">
                              {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString('pt-BR') : ''}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Todas as Conquistas Disponíveis */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Todas as Conquistas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.slice(0, 8).map((achievement) => {
                    const userAchievement = userProgress.find(p => p.achievement_id === achievement.id);
                    const isCompleted = userAchievement?.is_completed || false;
                    const progress = userAchievement?.current_progress || 0;

                    return (
                      <div 
                        key={achievement.id} 
                        className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          {achievement.icon_url ? (
                            <img 
                              src={achievement.icon_url} 
                              alt="" 
                              className="w-10 h-10 rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              {getRarityIcon(achievement.rarity)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-medium">{achievement.name}</h6>
                              <Badge className={getRarityColor(achievement.rarity)}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            {!isCompleted && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progresso</span>
                                  <span>{progress}/{achievement.points_required}</span>
                                </div>
                                <Progress 
                                  value={(progress / achievement.points_required) * 100} 
                                  className="h-1"
                                />
                              </div>
                            )}
                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                <Trophy className="h-3 w-3 mr-1" />
                                Conquistada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Top Rankings Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankingsLoading ? (
            <div className="text-center py-8">Carregando rankings...</div>
          ) : (
            <div className="space-y-3">
              {globalRankings.slice(0, 10).map((ranking, index) => (
                <div 
                  key={ranking.id} 
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    ranking.id === user.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-center min-w-[40px]">
                    {index < 3 ? (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        <Crown className="h-4 w-4" />
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-600">#{ranking.rank}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    {ranking.avatar_url ? (
                      <img 
                        src={ranking.avatar_url} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {ranking.full_name?.charAt(0) || ranking.username?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{ranking.full_name || ranking.username}</div>
                      <div className="text-sm text-gray-600">{ranking.medical_specialty || 'Não informado'}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{ranking.total_points.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">pontos</div>
                  </div>
                  
                  {ranking.current_streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">{ranking.current_streak}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
