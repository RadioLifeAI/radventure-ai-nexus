
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando Estatísticas...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Estatísticas Avançadas
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Real Data
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <StatsOverviewCards stats={stats} />
          <WeeklyActivityChart stats={stats} />
          <SpecialtyPerformance stats={stats} />
          <RecentAchievements stats={stats} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
