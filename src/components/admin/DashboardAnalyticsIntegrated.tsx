
import React, { useState } from "react";
import { Sparkles, Crown, Database } from "lucide-react";
import { RealTimeKPICards } from "./analytics/RealTimeKPICards";
import { RealTimeCharts } from "./analytics/RealTimeCharts";
import { AnalyticsTabsIntegrated } from "./analytics/AnalyticsTabsIntegrated";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function DashboardAnalyticsIntegrated() {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Buscar estatísticas reais para as abas
  const { data: userStats } = useQuery({
    queryKey: ['analytics-user-stats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, created_at, total_points, radcoin_balance');
      
      if (error) throw error;
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalUsers = profiles?.length || 0;
      const newUsersThisMonth = profiles?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0;
      const totalRadcoins = profiles?.reduce((sum, u) => sum + (u.radcoin_balance || 0), 0) || 0;
      
      return {
        totalUsers,
        newUsersThisMonth,
        totalRadcoins
      };
    },
    refetchInterval: 30000
  });

  const { data: caseStats } = useQuery({
    queryKey: ['analytics-case-stats'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('id, created_at');
      
      if (error) throw error;
      
      const { data: history, error: historyError } = await supabase
        .from('user_case_history')
        .select('case_id, is_correct');
        
      if (historyError) throw historyError;
      
      const totalCases = cases?.length || 0;
      const activeCases = totalCases; // Todos os casos são considerados ativos
      const completedCases = history?.filter(h => h.is_correct).length || 0;
      
      return {
        totalCases,
        activeCases,
        completedCases
      };
    },
    refetchInterval: 30000
  });

  const { data: eventStats } = useQuery({
    queryKey: ['analytics-event-stats'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, status, created_at');
      
      if (error) throw error;
      
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id, registered_at');
        
      if (regError) throw regError;
      
      const totalEvents = events?.length || 0;
      const activeEvents = events?.filter(e => e.status === 'ACTIVE').length || 0;
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const participantsThisMonth = registrations?.filter(r => new Date(r.registered_at) > thirtyDaysAgo).length || 0;
      
      return {
        totalEvents,
        activeEvents,
        participantsThisMonth
      };
    },
    refetchInterval: 30000
  });

  return (
    <div className="space-y-6">
      {/* Header Gamificado Atualizado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Analytics Dashboard Integrado
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-blue-100 mt-2">Dados em tempo real da plataforma médica - 100% dados reais do Supabase</p>
            <div className="flex items-center gap-2 mt-3">
              <Database className="h-4 w-4 text-green-300" />
              <span className="text-sm font-medium">Conectado ao banco de dados</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">🏆 Analytics Pro</div>
            <div className="text-blue-200">Dados Reais Integrados</div>
          </div>
        </div>
      </div>

      {/* KPIs Cards com dados reais */}
      <RealTimeKPICards />

      {/* Tabs integradas com análises detalhadas */}
      <AnalyticsTabsIntegrated 
        userStats={userStats}
        caseStats={caseStats}
        eventStats={eventStats}
      />
    </div>
  );
}
