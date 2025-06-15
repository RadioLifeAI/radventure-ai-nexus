
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  tx_type: string;
  created_at: string;
  metadata?: any;
};

type Props = {
  balance: number;
  recentTransactions?: Transaction[];
  onViewHistory?: () => void;
};

export function RadCoinWallet({ balance, recentTransactions = [], onViewHistory }: Props) {
  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <TrendingUp size={16} className="text-green-500" />;
    return <TrendingDown size={16} className="text-red-500" />;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'EVENT_REWARD': return 'Prêmio Evento';
      case 'CASE_COMPLETION': return 'Caso Resolvido';
      case 'ACHIEVEMENT': return 'Conquista';
      case 'PURCHASE': return 'Compra';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 shadow-lg animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Wallet size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">RadCoin Wallet</h3>
              <p className="text-sm text-gray-500">Seu saldo atual</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-extrabold text-yellow-600">{balance}</div>
            <div className="text-sm text-gray-500">RadCoins</div>
          </div>
        </div>

        {recentTransactions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Transações Recentes</h4>
              {onViewHistory && (
                <button 
                  onClick={onViewHistory}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline"
                >
                  Ver histórico completo →
                </button>
              )}
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.tx_type, transaction.amount)}
                    <div>
                      <div className="font-medium text-sm text-gray-800">
                        {formatTransactionType(transaction.tx_type)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} RC
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
