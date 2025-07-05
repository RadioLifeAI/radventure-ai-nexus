
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

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatsData {
  totalTransactions: number;
  totalSpent: number;
  totalEarned: number;
  netBalance: number;
}

interface TransactionMetadata {
  package_name?: string;
  offer_name?: string;
  [key: string]: any;
}

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

  // Processar dados para estatísticas
  const stats = React.useMemo(() => {
    if (!transactions.length) return { 
      totalTransactions: 0, totalSpent: 0, totalEarned: 0, netBalance: 0 
    } as StatsData;

    const totalSpent = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalEarned = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalTransactions: transactions.length,
      totalSpent,
      totalEarned,
      netBalance: totalEarned - totalSpent
    } as StatsData;
  }, [transactions]);

  const getTransactionIcon = (txType: string) => {
    if (txType.includes('purchase') || txType.includes('help')) return Gift;
    if (txType.includes('case')) return Target;
    if (txType.includes('event')) return Crown;
    if (txType.includes('offer')) return Flame;
    return DollarSign;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getMetadata = (metadata: any): TransactionMetadata => {
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    return metadata || {};
  };

  

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8 text-cyan-400" />
          Histórico & Analytics
        </h2>
        <p className="text-gray-700 text-lg">
          Acompanhe suas transações e estatísticas de RadCoins
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-400/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalTransactions}
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">Transações Totais</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <ArrowUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              +{stats.totalEarned.toLocaleString()}
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">RadCoins Ganhos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-400/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <ArrowDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              -{stats.totalSpent.toLocaleString()}
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">RadCoins Gastos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.netBalance >= 0 ? '+' : ''}
              {stats.netBalance.toLocaleString()}
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm">Saldo Líquido</p>
          </CardContent>
        </Card>
      </div>


      {/* Lista de Transações Recentes */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
            <span className="truncate">Transações Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">Nenhuma transação encontrada</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Comece comprando pacotes de ajuda ou participando de eventos!
                </p>
              </div>
            ) : (
              transactions.slice(0, 10).map((tx) => {
                const Icon = getTransactionIcon(tx.tx_type);
                const isPositive = tx.amount > 0;
                const metadata = getMetadata(tx.metadata);
                
                return (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                        isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold text-xs sm:text-sm truncate">
                          {metadata.package_name || metadata.offer_name || 
                           tx.tx_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm sm:text-lg font-bold ${getTransactionColor(tx.amount)}`}>
                        {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
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
