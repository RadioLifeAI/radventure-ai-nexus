
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Zap, Award, Lock } from "lucide-react";

export function AchievementsList() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      // Simulando achievements até termos o sistema completo
      return [
        {
          id: '1',
          name: 'Primeiro Passo',
          description: 'Resolva seu primeiro caso médico',
          icon: 'trophy',
          rarity: 'common',
          unlocked: true,
          progress: 100,
          category: 'Iniciante'
        },
        {
          id: '2',
          name: 'Especialista em Pneumologia',
          description: 'Resolva 10 casos de pneumologia com 80% de acerto',
          icon: 'star',
          rarity: 'rare',
          unlocked: false,
          progress: 60,
          category: 'Especialidade'
        },
        {
          id: '3',
          name: 'Sequência Perfeita',
          description: 'Acerte 5 casos seguidos sem erro',
          icon: 'target',
          rarity: 'epic',
          unlocked: true,
          progress: 100,
          category: 'Performance'
        },
        {
          id: '4',
          name: 'Velocidade da Luz',
          description: 'Resolva um caso em menos de 30 segundos',
          icon: 'zap',
          rarity: 'legendary',
          unlocked: false,
          progress: 25,
          category: 'Velocidade'
        },
        {
          id: '5',
          name: 'Mestre dos Diagnósticos',
          description: 'Mantenha 90% de acerto em 50 casos',
          icon: 'award',
          rarity: 'legendary',
          unlocked: false,
          progress: 35,
          category: 'Maestria'
        }
      ];
    }
  });

  const getIcon = (iconName: string) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      target: Target,
      zap: Zap,
      award: Award
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Trophy;
    return <IconComponent className="h-6 w-6" />;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500';
  };

  const getRarityBorder = (rarity: string) => {
    const borders = {
      common: 'border-gray-400/30',
      rare: 'border-blue-400/30',
      epic: 'border-purple-400/30',
      legendary: 'border-yellow-400/30'
    };
    return borders[rarity as keyof typeof borders] || 'border-gray-400/30';
  };

  if (isLoading || !achievements) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-white/20 rounded-full mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const categories = [...new Set(achievements.map(a => a.category))];

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            {category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements
              .filter(achievement => achievement.category === category)
              .map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br from-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/20 to-${achievement.rarity === 'legendary' ? 'amber' : achievement.rarity === 'epic' ? 'violet' : achievement.rarity === 'rare' ? 'cyan' : 'slate'}-600/20 backdrop-blur-sm ${getRarityBorder(achievement.rarity)}`
                      : 'bg-white/5 backdrop-blur-sm border-white/10 opacity-75'
                  }`}
                >
                  {!achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked 
                          ? `${getRarityColor(achievement.rarity)} text-white`
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {getIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-sm font-bold ${
                          achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </CardTitle>
                        <Badge 
                          className={`mt-1 text-xs ${getRarityColor(achievement.rarity)} text-white`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className={`text-sm mb-3 ${
                      achievement.unlocked ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-gray-400">{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getRarityColor(achievement.rarity)}`}
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlocked && (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <Trophy className="h-4 w-4" />
                        Desbloqueado!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
