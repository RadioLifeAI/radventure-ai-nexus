
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown } from 'lucide-react';

interface XPProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  title?: string;
  compact?: boolean;
}

export function XPProgressBar({ 
  level, 
  currentXP, 
  nextLevelXP, 
  progress, 
  title,
  compact = false 
}: XPProgressBarProps) {
  const xpToNext = nextLevelXP - currentXP;
  const currentProgress = Math.max(0, Math.min(100, progress));

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-3 py-1">
          <Crown className="h-3 w-3 mr-1" />
          Nv. {level}
        </Badge>
        <div className="flex-1">
          <Progress 
            value={currentProgress} 
            className="h-2 bg-white/20"
          />
        </div>
        <span className="text-xs text-white/80 font-medium">
          {currentXP}/{nextLevelXP} XP
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-3 py-1">
            <Crown className="h-4 w-4 mr-1" />
            Nível {level}
          </Badge>
          {title && (
            <Badge className="bg-gradient-to-r from-gold-500 to-yellow-600 text-white font-medium px-3 py-1">
              {title}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>{currentXP.toLocaleString()} XP</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={currentProgress} 
          className="h-3 bg-white/20"
          style={{
            background: 'linear-gradient(90deg, rgba(139, 69, 255, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)'
          }}
        />
        <div className="flex justify-between text-xs text-white/70">
          <span>Progresso: {currentProgress.toFixed(1)}%</span>
          {level < 10 && (
            <span>Faltam {xpToNext.toLocaleString()} XP para o nível {level + 1}</span>
          )}
          {level >= 10 && (
            <span>Nível Máximo Alcançado! 🏆</span>
          )}
        </div>
      </div>
    </div>
  );
}
