
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Target, Zap, Crown } from "lucide-react";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
};

type Props = {
  achievement: Achievement;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
};

export function AchievementBadge({ achievement, isUnlocked = false, size = 'md', showTooltip = true }: Props) {
  const getIcon = (iconType: string) => {
    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    
    switch (iconType) {
      case 'trophy': return <Trophy size={iconSize} />;
      case 'star': return <Star size={iconSize} />;
      case 'award': return <Award size={iconSize} />;
      case 'target': return <Target size={iconSize} />;
      case 'crown': return <Crown size={iconSize} />;
      default: return <Zap size={iconSize} />;
    }
  };

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300';
      case 'epic': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-300';
      case 'rare': return 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-green-300';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300';
      default: return 'bg-gray-200 text-gray-600 border-gray-300';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="relative group">
      <Badge 
        className={`
          ${sizeClasses[size]} 
          ${isUnlocked ? getRarityColors(achievement.rarity) : 'bg-gray-200 text-gray-400 border-gray-300'} 
          border-2 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer
          ${isUnlocked ? 'animate-pulse' : 'opacity-60'}
        `}
      >
        <span className={isUnlocked ? 'text-white' : 'text-gray-400'}>
          {getIcon(achievement.icon_type)}
        </span>
        <span className="ml-1 font-semibold">{achievement.name}</span>
      </Badge>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-gray-300">{achievement.description}</div>
          {achievement.unlocked_at && (
            <div className="text-gray-400 text-xs mt-1">
              Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
