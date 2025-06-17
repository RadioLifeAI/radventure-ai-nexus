
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, Trophy, TrendingUp, TrendingDown } from "lucide-react";

export function RealTimeKPICards() {
  const { data: userMetrics } = useQuery({
    queryKey: ['real-user-metrics'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, type, created_at, total_points, radcoin_balance, academic_stage');
      
      if (error) throw error;
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const totalUsers = profiles?.length || 0;
      const activeUsersMonth = profiles?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0;
      const activeUsersWeek = profiles?.filter(u => new Date(u.created_at) > sevenDaysAgo).length || 0;
      const totalPoints = profiles?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0;
      const totalRadcoins = profiles?.reduce((sum, u) => sum + (u.radcoin_balance || 0), 0) || 0;
      
      const studentCount = profiles?.filter(u => u.academic_stage === 'Student').length || 0;
      const residentCount = profiles?.filter(u => u.academic_stage === 'Resident').length || 0;
      const specialistCount = profiles?.filter(u => u.academic_stage === 'Specialist').length || 0;
      
      return {
        totalUsers,
        activeUsersMonth,
        activeUsersWeek,
        totalPoints,
        totalRadcoins,
        studentCount,
        residentCount,
        specialistCount
      };
    },
    refetchInterval: 30000
  });

  const { data: caseMetrics } = useQuery({
    queryKey: ['real-case-metrics'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('id, specialty, difficulty_level, created_at, points');
      
      if (error) throw error;
      
      const { data: history, error: historyError } = await supabase
        .from('user_case_history')
        .select('case_id, answered_at, is_correct');
        
      if (historyError) throw historyError;
      
      const totalCases = cases?.length || 0;
      const totalAttempts = history?.length || 0;
      const correctAnswers = history?.filter(h => h.is_correct).length || 0;
      const accuracyRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const attemptsToday = history?.filter(h => h.answered_at.startsWith(todayStr)).length || 0;
      
      return {
        totalCases,
        totalAttempts,
        accuracyRate,
        attemptsToday
      };
    },
    refetchInterval: 30000
  });

  const { data: eventMetrics } = useQuery({
    queryKey: ['real-event-metrics'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, status, prize_radcoins, scheduled_start, created_at');
      
      if (error) throw error;
      
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id, user_id');
        
      if (regError) throw regError;
      
      const totalEvents = events?.length || 0;
      const activeEvents = events?.filter(e => e.status === 'ACTIVE').length || 0;
      const scheduledEvents = events?.filter(e => e.status === 'SCHEDULED').length || 0;
      const totalPrizes = events?.reduce((sum, e) => sum + (e.prize_radcoins || 0), 0) || 0;
      const totalRegistrations = registrations?.length || 0;
      
      return {
        totalEvents,
        activeEvents,
        scheduledEvents,
        totalPrizes,
        totalRegistrations
      };
    },
    refetchInterval: 30000
  });

  const { data: achievementMetrics } = useQuery({
    queryKey: ['real-achievement-metrics'],
    queryFn: async () => {
      const { data: achievements, error } = await supabase
        .from('user_achievements')
        .select('id, user_id, achievement_id, unlocked_at');
      
      if (error) throw error;
      
      const { data: system, error: systemError } = await supabase
        .from('achievement_system')
        .select('id, rarity');
        
      if (systemError) throw systemError;
      
      const totalUnlocked = achievements?.length || 0;
      const uniqueUsers = new Set(achievements?.map(a => a.user_id)).size || 0;
      const legendaryCount = achievements?.filter(a => {
        const achievement = system?.find(s => s.id === a.achievement_id);
        return achievement?.rarity === 'legendary';
      }).length || 0;
      
      return {
        totalUnlocked,
        uniqueUsers,
        legendaryCount
      };
    },
    refetchInterval: 30000
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Usuários */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{formatNumber(userMetrics?.totalUsers || 0)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Ativos (30d): {userMetrics?.activeUsersMonth || 0}
            </Badge>
            {getGrowthIcon(userMetrics?.activeUsersWeek || 0, userMetrics?.activeUsersMonth || 0)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Estudantes: {userMetrics?.studentCount || 0} | Residentes: {userMetrics?.residentCount || 0}
          </div>
        </CardContent>
      </Card>

      {/* Casos */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Casos Médicos</CardTitle>
          <FileText className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{formatNumber(caseMetrics?.totalCases || 0)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Taxa de Acerto: {caseMetrics?.accuracyRate?.toFixed(1) || 0}%
            </Badge>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Tentativas hoje: {caseMetrics?.attemptsToday || 0}
          </div>
        </CardContent>
      </Card>

      {/* Eventos */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Eventos</CardTitle>
          <Calendar className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{formatNumber(eventMetrics?.totalEvents || 0)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Ativos: {eventMetrics?.activeEvents || 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Agendados: {eventMetrics?.scheduledEvents || 0}
            </Badge>
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Inscrições: {eventMetrics?.totalRegistrations || 0}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Conquistas</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">{formatNumber(achievementMetrics?.totalUnlocked || 0)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Usuários: {achievementMetrics?.uniqueUsers || 0}
            </Badge>
            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Lendárias: {achievementMetrics?.legendaryCount || 0}
            </Badge>
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            RadCoins em circulação: {formatNumber(userMetrics?.totalRadcoins || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
