
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionManagementHeader } from "./subscription/SubscriptionManagementHeader";
import { SubscriptionStatsIntegrated } from "./subscription/SubscriptionStatsIntegrated";
import { PlansTableIntegrated } from "./subscription/PlansTableIntegrated";
import { PlanFormIntegrated } from "./subscription/PlanFormIntegrated";
import { toast } from "@/components/ui/use-toast";

export function SubscriptionManagementIntegrated() {
  const [isLoading, setIsLoading] = useState(false);

  // Buscar estatísticas reais de assinaturas
  const { data: subscriptionStats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('id, tier, status, created_at');
      
      if (error) throw error;
      
      const totalSubscriptions = subscriptions?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      
      // Calcular receita mensal (simulada baseada em tiers)
      const tierPrices = { Free: 0, Pro: 29.90, Plus: 59.90 };
      const monthlyRevenue = subscriptions?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (tierPrices[sub.tier as keyof typeof tierPrices] || 0);
        }
        return sum;
      }, 0) || 0;
      
      // Calcular taxa de churn (cancelamentos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const churnCount = subscriptions?.filter(s => 
        s.status === 'cancelled' && new Date(s.created_at) > thirtyDaysAgo
      ).length || 0;
      
      const churnRate = totalSubscriptions > 0 ? (churnCount / totalSubscriptions) * 100 : 0;
      
      return {
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        churnRate
      };
    },
    refetchInterval: 30000
  });

  // Buscar planos reais
  const { data: plans, refetch: refetchPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000
  });

  const handleEditPlan = (id: string) => {
    console.log('Editando plano:', id);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Edição de planos será implementada em breve",
    });
  };

  const handleDeletePlan = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Plano desativado",
        description: "O plano foi removido com sucesso",
      });
      
      refetchPlans();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao desativar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPlan = async (planData: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([{
          name: planData.name,
          display_name: planData.displayName,
          description: planData.description,
          price_monthly: planData.priceMonthly,
          price_yearly: planData.priceYearly || planData.priceMonthly * 10, // 10x monthly = yearly discount
          features: planData.features || {},
          limits: planData.limits || {},
          sort_order: plans?.length || 0
        }]);

      if (error) throw error;

      toast({
        title: "✅ Plano criado com sucesso",
        description: `O plano "${planData.displayName}" foi adicionado`,
      });
      
      refetchPlans();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPlan = () => {
    console.log('Cancelando edição de plano');
  };

  return (
    <div className="space-y-6">
      <SubscriptionManagementHeader 
        totalSubscriptions={subscriptionStats?.totalSubscriptions || 0}
        activeSubscriptions={subscriptionStats?.activeSubscriptions || 0}
        monthlyRevenue={subscriptionStats?.monthlyRevenue || 0}
      />
      
      <div className="grid gap-6">
        <SubscriptionStatsIntegrated stats={subscriptionStats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlansTableIntegrated 
            plans={plans || []}
            isLoading={isLoading}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
          />
          <PlanFormIntegrated 
            onSubmit={handleSubmitPlan}
            onCancel={handleCancelPlan}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
