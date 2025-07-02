
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Users, TrendingUp, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface RewardSystemMetrics {
  totalRadCoinsInCirculation: number;
  dailyLoginBonusesAwarded: number;
  subscriptionRewardsActive: number;
  averageUserBalance: number;
}

export function RewardSystemStatus() {
  const [metrics, setMetrics] = useState<RewardSystemMetrics>({
    totalRadCoinsInCirculation: 0,
    dailyLoginBonusesAwarded: 0,
    subscriptionRewardsActive: 0,
    averageUserBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      // Buscar métricas do sistema de recompensas
      const { data: circulation } = await supabase
        .from('profiles')
        .select('radcoin_balance');

      const { data: loginBonuses } = await supabase
        .from('radcoin_transactions_log')
        .select('id')
        .eq('tx_type', 'daily_login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'active');

      const totalCirculation = circulation?.reduce((sum, user) => sum + (user.radcoin_balance || 0), 0) || 0;
      const avgBalance = circulation?.length ? Math.round(totalCirculation / circulation.length) : 0;

      setMetrics({
        totalRadCoinsInCirculation: totalCirculation,
        dailyLoginBonusesAwarded: loginBonuses?.length || 0,
        subscriptionRewardsActive: subscriptions?.length || 0,
        averageUserBalance: avgBalance
      });

    } catch (error) {
      console.error('Erro ao buscar métricas de recompensas:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAllRewards = async () => {
    setLoading(true);
    try {
      // Processar recargas diárias de ajudas
      const { data: refillResult } = await supabase.rpc('refill_daily_help_aids');
      
      toast({
        title: 'Sistema de Recompensas Atualizado',
        description: `${refillResult || 0} usuários tiveram suas ajudas recarregadas`,
      });
      
      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao processar recompensas:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar recompensas automáticas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RadCoins em Circulação</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.totalRadCoinsInCirculation.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Total na economia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bônus de Login (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.dailyLoginBonusesAwarded}
            </div>
            <p className="text-xs text-gray-600">usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.subscriptionRewardsActive}
            </div>
            <p className="text-xs text-gray-600">com benefícios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Médio</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.averageUserBalance}
            </div>
            <p className="text-xs text-gray-600">RadCoins por usuário</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Controles do Sistema de Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Bônus de Login Diário</h3>
                <p className="text-sm text-gray-600">5 RadCoins + bônus de streak</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Recargas de Ajudas</h3>
                <p className="text-sm text-gray-600">Eliminação, Pular, IA Tutor</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Benefícios de Assinatura</h3>
                <p className="text-sm text-gray-600">RadCoins mensais e ajudas extras</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>

            <div className="pt-4">
              <Button 
                onClick={processAllRewards}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Processar Recompensas Agora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
