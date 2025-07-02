
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Buscar dados das assinaturas
  const { data: subscriptionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["subscription-stats"],
    queryFn: async () => {
      // Total de assinantes ativos
      const { data: activeSubscriptions, error: activeError } = await supabase
        .from("subscriptions")
        .select("id, plan_id, subscription_plans(display_name, price_monthly)")
        .eq("status", "active");

      if (activeError) throw activeError;

      // Total de planos
      const { data: plans, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true);

      if (plansError) throw plansError;

      // Receita mensal estimada
      const monthlyRevenue = activeSubscriptions?.reduce((sum, sub) => {
        return sum + (sub.subscription_plans?.price_monthly || 0);
      }, 0) || 0;

      return {
        activeSubscribers: activeSubscriptions?.length || 0,
        totalPlans: plans?.length || 0,
        monthlyRevenue,
        subscriptions: activeSubscriptions || [],
        plans: plans || []
      };
    }
  });

  // Buscar todas as assinaturas para a tabela
  const { data: allSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["all-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (
            display_name,
            price_monthly
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Função para ativar/desativar planos
  const togglePlanMutation = useMutation({
    mutationFn: async ({ planId, isActive }: { planId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      toast({
        title: "Plano atualizado",
        description: "Status do plano foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano.",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Ativo</Badge>;
      case 'canceled':
        return <Badge className="bg-red-600">Cancelado</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-600">Vencido</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Crown className="h-8 w-8 text-purple-600" />
            Gestão de Assinaturas RadSupport
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie planos educacionais e assinantes do sistema
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2">
          Sistema Educacional Ativo
        </Badge>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Assinantes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {subscriptionStats?.activeSubscribers || 0}
            </div>
            <p className="text-xs text-green-600">
              Usuários com planos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              R$ {subscriptionStats?.monthlyRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-600">
              Receita estimada mensal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Planos Ativos
            </CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {subscriptionStats?.totalPlans || 0}
            </div>
            <p className="text-xs text-purple-600">
              Planos RadSupport disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Taxa Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {subscriptionStats?.activeSubscribers > 0 ? '2.5%' : '0%'}
            </div>
            <p className="text-xs text-orange-600">
              Conversão para premium
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de gerenciamento */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="subscribers" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                Assinantes
              </TabsTrigger>
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Planos
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distribuição por planos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição por Planos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subscriptionStats?.plans.map((plan) => {
                        const subscribersCount = subscriptionStats.subscriptions.filter(
                          sub => sub.plan_id === plan.id
                        ).length;
                        
                        return (
                          <div key={plan.id} className="flex justify-between items-center py-2">
                            <span className="font-medium">{plan.display_name}</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {subscribersCount} assinantes
                            </Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Status da integração */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Planos Educacionais</span>
                        <Badge className="bg-green-100 text-green-800">✓ Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sistema de Selos</span>
                        <Badge className="bg-green-100 text-green-800">✓ Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Integração Stripe</span>
                        <Badge className="bg-yellow-100 text-yellow-800">🚧 Em breve</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Benefícios Automáticos</span>
                        <Badge className="bg-green-100 text-green-800">✓ Ativo</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subscribers">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Lista de Assinantes</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {allSubscriptions?.length || 0} total
                    </Badge>
                  </div>

                  {subscriptionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Data de Criação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSubscriptions?.map((subscription) => (
                          <TableRow key={subscription.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {subscription.profiles?.full_name || 'Nome não informado'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {subscription.profiles?.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {subscription.subscription_plans?.display_name || 'Plano não encontrado'}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(subscription.status || 'unknown')}
                            </TableCell>
                            <TableCell>
                              R$ {subscription.subscription_plans?.price_monthly?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell>
                              {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="plans">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Planos RadSupport</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Plano
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscriptionStats?.plans.map((plan) => (
                      <Card key={plan.id} className="relative">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            {plan.display_name}
                            <Badge className={plan.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {plan.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">
                              R$ {plan.price_monthly.toFixed(2)}/mês
                            </div>
                            <p className="text-sm text-gray-600">
                              {plan.description}
                            </p>
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => togglePlanMutation.mutate({ 
                                  planId: plan.id, 
                                  isActive: plan.is_active 
                                })}
                              >
                                {plan.is_active ? 'Desativar' : 'Ativar'}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
