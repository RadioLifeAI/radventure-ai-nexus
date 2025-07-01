
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Coins, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus, 
  AlertCircle,
  RefreshCw,
  Award,
  Zap,
  Gift
} from "lucide-react";

export function EconomyTab() {
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distributionData, setDistributionData] = useState({
    amount: 0,
    type: 'admin_grant',
    target: 'all_users',
    reason: ''
  });

  const queryClient = useQueryClient();

  // Estatísticas da economia RadCoin
  const { data: economyStats } = useQuery({
    queryKey: ["economy-stats"],
    queryFn: async () => {
      const [
        totalBalanceResult,
        recentTransactionsResult,
        activeUsersResult,
        dailyDistributionResult
      ] = await Promise.all([
        supabase.from("profiles").select("radcoin_balance").then(res => 
          res.data?.reduce((sum, p) => sum + (p.radcoin_balance || 0), 0) || 0
        ),
        supabase.from("radcoin_transactions_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("profiles").select("id").eq("type", "USER").then(res => 
          res.data?.length || 0
        ),
        supabase.from("radcoin_transactions_log")
          .select("amount")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .then(res => 
            res.data?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
          )
      ]);

      return {
        totalCirculation: totalBalanceResult,
        recentTransactions: recentTransactionsResult.data || [],
        activeUsers: activeUsersResult,
        dailyDistribution: dailyDistributionResult
      };
    },
    refetchInterval: 30000
  });

  // Transações recentes detalhadas
  const { data: transactions = [] } = useQuery({
    queryKey: ["recent-transactions-detailed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_transactions_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Buscar dados dos usuários separadamente
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds);

      // Combinar dados
      return data.map(transaction => ({
        ...transaction,
        user_profile: users?.find(u => u.id === transaction.user_id)
      }));
    },
    refetchInterval: 15000
  });

  // Distribuição manual de RadCoins
  const distributeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.target === 'all_users') {
        // Buscar todos os usuários
        const { data: users } = await supabase
          .from("profiles")
          .select("id")
          .eq("type", "USER");

        if (!users) throw new Error("Não foi possível buscar usuários");

        // Distribuir para cada usuário
        for (const user of users) {
          const { error } = await supabase.rpc("award_radcoins", {
            p_user_id: user.id,
            p_amount: data.amount,
            p_transaction_type: data.type,
            p_metadata: { reason: data.reason, distributed_by: 'admin' }
          });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["economy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions-detailed"] });
      toast.success("RadCoins distribuídos com sucesso!");
      setShowDistributeModal(false);
      setDistributionData({ amount: 0, type: 'admin_grant', target: 'all_users', reason: '' });
    },
    onError: (error: any) => {
      toast.error(`Erro na distribuição: ${error.message}`);
    }
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'profile_completion': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'daily_login': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'admin_grant': return <Gift className="h-4 w-4 text-purple-500" />;
      case 'ai_chat_usage': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Circulação Total</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {economyStats?.totalCirculation?.toLocaleString() || 0} RC
                </p>
              </div>
              <Coins className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Distribuição Diária</p>
                <p className="text-2xl font-bold text-green-900">
                  {economyStats?.dailyDistribution?.toLocaleString() || 0} RC
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-900">
                  {economyStats?.activeUsers?.toLocaleString() || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Média por Usuário</p>
                <p className="text-2xl font-bold text-purple-900">
                  {economyStats?.activeUsers 
                    ? Math.round((economyStats?.totalCirculation || 0) / economyStats.activeUsers)
                    : 0} RC
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ferramentas de Administração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Ferramentas de Administração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowDistributeModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Distribuir RadCoins
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Relatório
              </Button>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Auditoria
              </Button>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Use as ferramentas com cuidado. Distribuições afetam toda a economia.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.tx_type)}
                    <div>
                      <div className="text-sm font-medium">
                        {transaction.user_profile?.full_name || transaction.user_profile?.username || 'Usuário'}
                      </div>
                      <div className="text-xs text-gray-600">{transaction.tx_type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} RC
                    </div>
                    <div className="text-xs text-gray-500">
                      Saldo: {transaction.balance_after} RC
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de transações detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 20).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {transaction.user_profile?.full_name || transaction.user_profile?.username || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getTransactionIcon(transaction.tx_type)}
                      {transaction.tx_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} RC
                    </span>
                  </TableCell>
                  <TableCell>{transaction.balance_after} RC</TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      {transaction.metadata && typeof transaction.metadata === 'object' && 'reason' in transaction.metadata
                        ? String(transaction.metadata.reason) 
                        : 'N/A'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Distribuição */}
      <Dialog open={showDistributeModal} onOpenChange={setShowDistributeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Distribuir RadCoins</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Quantidade</Label>
              <Input
                id="amount"
                type="number"
                value={distributionData.amount}
                onChange={(e) => setDistributionData({
                  ...distributionData,
                  amount: parseInt(e.target.value) || 0
                })}
                placeholder="Quantidade de RadCoins"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo de Transação</Label>
              <Select 
                value={distributionData.type} 
                onValueChange={(value) => setDistributionData({
                  ...distributionData,
                  type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_grant">Prêmio Manual</SelectItem>
                  <SelectItem value="event_reward">Evento Bônus</SelectItem>
                  <SelectItem value="subscription_purchase">Compensação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={distributionData.reason}
                onChange={(e) => setDistributionData({
                  ...distributionData,
                  reason: e.target.value
                })}
                placeholder="Motivo da distribuição"
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Esta ação distribuirá {distributionData.amount} RadCoins para TODOS os usuários ({economyStats?.activeUsers || 0} usuários).
                Total: {(distributionData.amount * (economyStats?.activeUsers || 0)).toLocaleString()} RC
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDistributeModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => distributeMutation.mutate(distributionData)}
                disabled={distributeMutation.isPending || distributionData.amount <= 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {distributeMutation.isPending ? 'Distribuindo...' : 'Distribuir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
