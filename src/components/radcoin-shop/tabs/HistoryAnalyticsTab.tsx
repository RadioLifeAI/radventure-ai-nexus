
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Target,
  Gift,
  Crown,
  Flame,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HistoryAnalyticsTab() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['radcoin-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('radcoin_transactions_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Processar dados para gráficos
  const processedData = React.useMemo(() => {
    if (!transactions.length) return { chartData: [], pieData: [], stats: {} };

    // Dados para gráfico de linha (últimos 30 dias)
    const chartData = transactions
      .slice(0, 30)
      .reverse()
      .map(tx => ({
        date: format(new Date(tx.created_at), 'dd/MM', { locale: ptBR }),
        amount: Math.abs(tx.amount),
        balance: tx.balance_after,
        type: tx.tx_type
      }));

    // Dados para gráfico de pizza (tipos de transação)
    const typeCount: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const type = tx.tx_type.replace('_', ' ').toUpperCase();
      typeCount[type] = (typeCount[type] || 0) + Math.abs(tx.amount);
    });

    const pieData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value
    }));

    // Estatísticas gerais
    const totalSpent = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalEarned = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const stats = {
      totalTransactions: transactions.length,
      totalSpent,
      totalEarned,
      netBalance: totalEarned - totalSpent
    };

    return { chartData, pieData, stats };
  }, [transactions]);

  const getTransactionIcon = (txType: string) => {
    if (txType.includes('purchase')) return Gift;
    if (txType.includes('case')) return Target;
    if (txType.includes('event')) return Crown;
    if (txType.includes('offer')) return Flame;
    return DollarSign;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-400' : 'text-red-400';
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8 text-cyan-400" />
          Histórico & Analytics
        </h2>
        <p className="text-blue-200 text-lg">
          Acompanhe suas transações e estatísticas de RadCoins
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-400/30">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">
              {processedData.stats.totalTransactions || 0}
            </h3>
            <p className="text-blue-200">Transações Totais</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30">
          <CardContent className="p-4 text-center">
            <ArrowUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">
              +{(processedData.stats.totalEarned || 0).toLocaleString()}
            </h3>
            <p className="text-green-200">RadCoins Ganhos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-400/30">
          <CardContent className="p-4 text-center">
            <ArrowDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">
              -{(processedData.stats.totalSpent || 0).toLocaleString()}
            </h3>
            <p className="text-red-200">RadCoins Gastos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-white">
              {(processedData.stats.netBalance || 0) >= 0 ? '+' : ''}
              {(processedData.stats.netBalance || 0).toLocaleString()}
            </h3>
            <p className="text-purple-200">Saldo Líquido</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Linha - Histórico de Saldo */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" />
              Histórico de Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Tipos de Transação */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processedData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações Recentes */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma transação encontrada</p>
                <p className="text-sm text-gray-500 mt-2">
                  Comece comprando pacotes de ajuda ou participando de eventos!
                </p>
              </div>
            ) : (
              transactions.slice(0, 10).map((tx) => {
                const Icon = getTransactionIcon(tx.tx_type);
                const isPositive = tx.amount > 0;
                
                return (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          {tx.metadata?.package_name || tx.metadata?.offer_name || 
                           tx.tx_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(tx.amount)}`}>
                        {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        Saldo: {tx.balance_after.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
