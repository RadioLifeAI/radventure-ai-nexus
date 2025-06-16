
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, CreditCard, Edit, Trash2, Plus, 
  TrendingUp, Users, Crown, Star
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { SubscriptionPlan } from "@/types/admin";

export function SubscriptionManagement() {
  const { hasPermission } = useAdminPermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Query para buscar planos de assinatura
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    enabled: hasPermission('SUBSCRIPTIONS', 'READ')
  });

  // Query para estatísticas de assinaturas
  const { data: subscriptionStats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status, current_period_end');
      
      if (error) {
        console.error('Error fetching subscription stats:', error);
        return {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          churnRate: 0
        };
      }
      
      const totalSubscriptions = data.length;
      const activeSubscriptions = data.filter(sub => sub.status === 'active').length;
      const monthlyRevenue = 0; // Calcular baseado nos planos
      const churnRate = 0; // Calcular baseado nos cancelamentos
      
      return {
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        churnRate
      };
    }
  });

  // Mutation para criar/atualizar plano
  const planMutation = useMutation({
    mutationFn: async (planData: Partial<SubscriptionPlan>) => {
      if (planData.id) {
        const { data, error } = await supabase
          .from('subscription_plans')
          .update({
            name: planData.name,
            display_name: planData.display_name,
            description: planData.description,
            price_monthly: planData.price_monthly,
            price_yearly: planData.price_yearly,
            features: planData.features,
            limits: planData.limits,
            is_active: planData.is_active,
            sort_order: planData.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', planData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('subscription_plans')
          .insert({
            name: planData.name!,
            display_name: planData.display_name!,
            description: planData.description,
            price_monthly: planData.price_monthly!,
            price_yearly: planData.price_yearly!,
            features: planData.features || {},
            limits: planData.limits || {},
            is_active: planData.is_active ?? true,
            sort_order: planData.sort_order || 0
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({
        title: "Plano salvo",
        description: "O plano de assinatura foi salvo com sucesso.",
      });
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      console.error('Error saving plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  if (!hasPermission('SUBSCRIPTIONS', 'READ')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para gerenciar assinaturas.</p>
        </div>
      </div>
    );
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const PlanForm = ({ plan, onSubmit }: { plan?: SubscriptionPlan, onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      
      const planData = {
        ...plan,
        name: formData.get('name') as string,
        display_name: formData.get('display_name') as string,
        description: formData.get('description') as string,
        price_monthly: parseFloat(formData.get('price_monthly') as string),
        price_yearly: parseFloat(formData.get('price_yearly') as string),
        sort_order: parseInt(formData.get('sort_order') as string),
        is_active: formData.get('is_active') === 'on',
        features: {},
        limits: {}
      };
      
      onSubmit(planData);
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              name="name"
              defaultValue={plan?.name || ''}
              required
            />
          </div>
          <div>
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={plan?.display_name || ''}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={plan?.description || ''}
            rows={3}
            placeholder="Descrição do plano..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
            <Input
              id="price_monthly"
              name="price_monthly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={plan?.price_monthly || 0}
            />
          </div>
          <div>
            <Label htmlFor="price_yearly">Preço Anual (R$)</Label>
            <Input
              id="price_yearly"
              name="price_yearly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={plan?.price_yearly || 0}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sort_order">Ordem de Exibição</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              defaultValue={plan?.sort_order || 0}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={plan?.is_active ?? true}
            />
            <Label htmlFor="is_active">Plano Ativo</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => {
          setIsEditModalOpen(false);
          setIsCreateModalOpen(false);
        }}>
          Cancelar
        </Button>
        <Button type="submit" disabled={planMutation.isPending}>
          {planMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="text-yellow-300" />
              Gestão de Assinaturas
              <DollarSign className="text-green-300" />
            </h1>
            <p className="text-emerald-100 mt-2">Gerencie planos, preços e receita</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{subscriptionStats?.activeSubscriptions || 0}</div>
            <div className="text-emerald-200">Assinaturas Ativas</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Planos de Assinatura</CardTitle>
                  <CardDescription>Gerencie os planos disponíveis na plataforma</CardDescription>
                </div>
                {hasPermission('SUBSCRIPTIONS', 'CREATE') && (
                  <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Plano
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Mensal</TableHead>
                    <TableHead>Anual</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando planos...
                      </TableCell>
                    </TableRow>
                  ) : plans?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhum plano encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans?.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.display_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                        <TableCell>R$ {plan.price_monthly.toFixed(2)}</TableCell>
                        <TableCell>R$ {plan.price_yearly.toFixed(2)}</TableCell>
                        <TableCell>{plan.sort_order}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('SUBSCRIPTIONS', 'UPDATE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPlan(plan)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission('SUBSCRIPTIONS', 'DELETE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePlanMutation.mutate(plan.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{subscriptionStats?.totalSubscriptions || 0}</div>
                <p className="text-xs text-gray-600">Todas as assinaturas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <Star className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{subscriptionStats?.activeSubscriptions || 0}</div>
                <p className="text-xs text-gray-600">Atualmente ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {(subscriptionStats?.monthlyRevenue || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">Receita recorrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {(subscriptionStats?.churnRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">Cancelamentos mensais</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gráficos de Receita</CardTitle>
              <CardDescription>
                Análise detalhada da performance das assinaturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Analytics Avançados</h3>
                <p>Gráficos de receita e métricas de crescimento serão exibidos aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Gerencie assinaturas individuais e perfis de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Gestão de Clientes</h3>
                <p>Interface de gerenciamento de clientes será implementada aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Faça alterações no plano de assinatura.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <PlanForm 
              plan={selectedPlan} 
              onSubmit={(data) => planMutation.mutate(data)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Plano</DialogTitle>
            <DialogDescription>
              Crie um novo plano de assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <PlanForm onSubmit={(data) => planMutation.mutate(data)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
