
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';
import { StatsOverviewCards } from './components/StatsOverviewCards';
import { WeeklyActivityChart } from '../cases/advanced/components/WeeklyActivityChart';
import { SpecialtyPerformance } from '../cases/advanced/components/SpecialtyPerformance';
import { RecentAchievements } from '../cases/advanced/components/RecentAchievements';

interface AdvancedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedStatsModal({ isOpen, onClose }: AdvancedStatsModalProps) {
  const { stats, isLoading } = useRealUserStats();

  if (isLoading || !stats) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Carregando Estatísticas...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-white">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
            Estatísticas Avançadas
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              Real Data
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <StatsOverviewCards stats={stats} />
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <WeeklyActivityChart stats={stats} />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <SpecialtyPerformance stats={stats} />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <RecentAchievements stats={stats} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
