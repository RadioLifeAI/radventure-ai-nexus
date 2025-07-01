
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target
} from "lucide-react";

export function AdvancedAnalyticsTab() {
  // Analytics de distribuição RadCoin
  const { data: distributionAnalytics } = useQuery({
    queryKey: ["distribution-analytics"],
    queryFn: async () => {
      const [
        transactionsByTypeResult,
        dailyDistributionResult,
        topUsersResult,
        economyHealthResult
      ] = await Promise.all([
        // Transações por tipo
        supabase
          .from("radcoin_transactions_log")
          .select("tx_type, amount")
          .then(res => {
            const byType = res.data?.reduce((acc: any, t) => {
              acc[t.tx_type] = (acc[t.tx_type] || 0) + Math.abs(t.amount);
              return acc;
            }, {}) || {};
            return byType;
          }),
        
        // Distribuição dos últimos 7 dias
        supabase
          .from("radcoin_transactions_log")
          .select("created_at, amount")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .then(res => {
            const daily = res.data?.reduce((acc: any, t) => {
              const date = new Date(t.created_at).toLocaleDateString('pt-BR');
              acc[date] = (acc[date] || 0) + Math.abs(t.amount);
              return acc;
            }, {}) || {};
            return daily;
          }),
        
        // Top usuários por RadCoins
        supabase
          .from("profiles")
          .select("full_name, username, radcoin_balance")
          .eq("type", "USER")
          .order("radcoin_balance", { ascending: false })
          .limit(10),
        
        // Saúde da economia
        supabase
          .from("profiles")
          .select("radcoin_balance")
          .eq("type", "USER")
          .then(res => {
            const balances = res.data?.map(p => p.radcoin_balance || 0) || [];
            const total = balances.reduce((sum, b) => sum + b, 0);
            const avg = balances.length ? total / balances.length : 0;
            const median = balances.length ? balances.sort()[Math.floor(balances.length / 2)] : 0;
            
            return {
              totalCirculation: total,
              averageBalance: avg,
              medianBalance: median,
              activeWallets: balances.filter(b => b > 0).length,
              totalUsers: balances.length
            };
          })
      ]);

      return {
        transactionsByType: transactionsByTypeResult,
        dailyDistribution: dailyDistributionResult,
        topUsers: topUsersResult.data || [],
        economyHealth: economyHealthResult
      };
    },
    refetchInterval: 60000
  });

  // Analytics de recompensas
  const { data: rewardAnalytics } = useQuery({
    queryKey: ["reward-analytics"],
    queryFn: async () => {
      const [
        achievementsResult,
        levelUpsResult,
        dailyLoginsResult
      ] = await Promise.all([
        // Conquistas desbloqueadas
        supabase
          .from("user_achievements_progress")
          .select("*, achievement_system(name, rarity)")
          .eq("is_completed", true),
        
        // Level ups recentes
        supabase
          .from("radcoin_transactions_log")
          .select("created_at, amount, metadata")
          .eq("tx_type", "admin_grant")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Logins diários
        supabase
          .from("radcoin_transactions_log")
          .select("created_at, amount")
          .eq("tx_type", "daily_login")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        achievements: achievementsResult.data || [],
        levelUps: levelUpsResult.data || [],
        dailyLogins: dailyLoginsResult.data || []
      };
    },
    refetchInterval: 60000
  });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'admin_grant': return 'bg-yellow-500';
      case 'daily_login': return 'bg-blue-500';
      case 'ai_chat_usage': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'admin_grant': return 'Prêmio Manual';
      case 'daily_login': return 'Login Diário';
      case 'ai_chat_usage': return 'Uso de IA';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Avançados</h2>
          <p className="text-gray-600">Análise detalhada da economia e sistema de recompensas</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
          <Activity className="h-4 w-4 mr-1" />
          Dados em Tempo Real
        </Badge>
      </div>

      {/* Saúde da Economia */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Saúde da Economia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {distributionAnalytics?.economyHealth?.totalCirculation?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">RC Circulando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(distributionAnalytics?.economyHealth?.averageBalance || 0)}
              </div>
              <div className="text-sm text-gray-600">RC Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {distributionAnalytics?.economyHealth?.medianBalance || 0}
              </div>
              <div className="text-sm text-gray-600">RC Mediano</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {distributionAnalytics?.economyHealth?.activeWallets || 0}
              </div>
              <div className="text-sm text-gray-600">Carteiras Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {(() => {
                  const activeWallets = Number(distributionAnalytics?.economyHealth?.activeWallets || 0);
                  const totalUsers = Number(distributionAnalytics?.economyHealth?.totalUsers || 0);
                  return totalUsers > 0 ? Math.round((activeWallets / totalUsers) * 100) : 0;
                })()}%
              </div>
              <div className="text-sm text-gray-600">Taxa Ativação</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Tipo de Transação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Distribuição por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(distributionAnalytics?.transactionsByType || {}).map(([type, amount]) => {
                const total = Object.values(distributionAnalytics?.transactionsByType || {}).reduce((sum: number, val) => sum + Number(val), 0);
                const percentage = total ? Math.round((Number(amount) / total) * 100) : 0;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getTransactionTypeColor(type)}`} />
                      <span className="font-medium">{getTransactionTypeLabel(type)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{Number(amount).toLocaleString()} RC</div>
                      <div className="text-sm text-gray-600">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Top Usuários por RadCoins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distributionAnalytics?.topUsers?.slice(0, 8).map((user, index) => (
                <div key={user.full_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.full_name || user.username || 'Usuário Anônimo'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">
                      {user.radcoin_balance?.toLocaleString() || 0} RC
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Distribuição dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(distributionAnalytics?.dailyDistribution || {}).map(([date, amount]) => (
              <div key={date} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">{date}</div>
                <div className="font-bold text-blue-600">{Number(amount).toLocaleString()}</div>
                <div className="text-xs text-gray-500">RC</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics de Recompensas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {rewardAnalytics?.achievements?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Desbloqueadas (total)</div>
              
              <div className="mt-4 space-y-2">
                {['legendary', 'epic', 'rare', 'uncommon', 'common'].map(rarity => {
                  const count = rewardAnalytics?.achievements?.filter(a => 
                    a.achievement_system?.rarity === rarity
                  ).length || 0;
                  
                  return (
                    <div key={rarity} className="flex justify-between text-sm">
                      <span className="capitalize">{rarity}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Prêmios Manuais (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {rewardAnalytics?.levelUps?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Prêmios concedidos</div>
              
              <div className="text-lg font-semibold text-gray-800">
                {rewardAnalytics?.levelUps?.reduce((sum, l) => sum + l.amount, 0) || 0} RC
              </div>
              <div className="text-sm text-gray-600">Total distribuído</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              Logins Diários (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {rewardAnalytics?.dailyLogins?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Logins premiados</div>
              
              <div className="text-lg font-semibold text-gray-800">
                {rewardAnalytics?.dailyLogins?.reduce((sum, l) => sum + l.amount, 0) || 0} RC
              </div>
              <div className="text-sm text-gray-600">Total distribuído</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">✨ Pontos Fortes</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Sistema de recompensas bem distribuído</li>
                <li>• Alta taxa de engajamento com conquistas</li>
                <li>• Economia balanceada e controlada</li>
                <li>• Usuários ativos recebendo recompensas</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-pink-800">🎯 Oportunidades</h4>
              <ul className="space-y-2 text-sm text-pink-700">
                <li>• Implementar eventos sazonais</li>
                <li>• Criar recompensas por referência</li>
                <li>• Adicionar multiplicadores por tempo</li>
                <li>• Desenvolver programa de fidelidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
