
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Crown, TrendingUp, Users } from "lucide-react";
import type { SubscriptionPlan } from "@/types/admin";
import { SubscriptionStats } from "./subscription/SubscriptionStats";
import { PlanForm } from "./subscription/PlanForm";
import { PlansTable } from "./subscription/PlansTable";

export function SubscriptionManagement() {
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
    enabled: false
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
      const monthlyRevenue = 0;
      const churnRate = 0;
      
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

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

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
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PlansTable 
                plans={plans}
                isLoading={isLoading}
                onEditPlan={handleEditPlan}
                onDeletePlan={(planId) => deletePlanMutation.mutate(planId)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <SubscriptionStats stats={subscriptionStats} />

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
              onCancel={() => setIsEditModalOpen(false)}
              isLoading={planMutation.isPending}
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
          
          <PlanForm 
            onSubmit={(data) => planMutation.mutate(data)}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={planMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
