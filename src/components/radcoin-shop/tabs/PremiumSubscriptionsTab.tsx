
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Award, Check, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PremiumSubscriptionsTabProps {
  currentBalance: number;
}

export function PremiumSubscriptionsTab({ currentBalance }: PremiumSubscriptionsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar planos de assinatura ativos
  const { data: subscriptionPlans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Buscar assinatura atual do usuário
  const { data: userSubscription } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleSubscribe = async (planId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🚧 Em breve!",
      description: `A assinatura ${planName} estará disponível em breve! Aguarde a integração com Stripe.`,
      variant: "default"
    });
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Bronze')) return Award;
    if (planName.includes('Prata')) return Star;
    if (planName.includes('Ouro')) return Crown;
    return Crown;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('Bronze')) return "from-orange-500 to-amber-600";
    if (planName.includes('Prata')) return "from-gray-400 to-slate-500";
    if (planName.includes('Ouro')) return "from-yellow-400 to-yellow-500";
    return "from-purple-500 to-indigo-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (!subscriptionPlans || subscriptionPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Planos em Preparação
        </h3>
        <p className="text-gray-500">
          Os planos educacionais RadSupport estarão disponíveis em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-yellow-400" />
          Planos RadSupport Educacionais
        </h2>
        <p className="text-blue-200">
          Apoie o projeto educacional e ganhe benefícios exclusivos para acelerar seus estudos!
        </p>
        {userSubscription && (
          <Badge className="mt-3 bg-green-600 text-white px-4 py-2">
            ✓ Plano Ativo: {userSubscription.subscription_plans?.display_name}
          </Badge>
        )}
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const Icon = getPlanIcon(plan.display_name);
          const colorClass = getPlanColor(plan.display_name);
          const features = (plan.features as Record<string, any>) || {};
          const limits = (plan.limits as Record<string, any>) || {};
          const isCurrentPlan = userSubscription?.plan_id === plan.id;
          const isPopular = plan.display_name.includes('Prata');

          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 border-2 ${
                isCurrentPlan 
                  ? 'border-green-500 bg-green-50' 
                  : isPopular 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-bold">
                  MAIS POPULAR
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-800">
                  {plan.display_name}
                </CardTitle>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {plan.price_monthly.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">por mês</div>
                  {plan.price_yearly > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      ou R$ {plan.price_yearly.toFixed(2)}/ano (economize 17%)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-6">
                  {plan.description}
                </p>

                {/* Benefícios principais */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>{limits.radcoins_monthly || 0} RadCoins</strong> mensais
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Selo <strong>{features.colaborator_badge}</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>{features.elimination_aids || 0}</strong> eliminações por caso
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>{features.skip_aids || 0}</strong> pulos por sessão
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>{features.ai_tutor_credits || 0}</strong> créditos IA Tutor/dia
                    </span>
                  </div>
                  
                  {features.xp_multiplier > 1 && (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        <strong>+{((features.xp_multiplier - 1) * 100).toFixed(0)}%</strong> bônus XP
                      </span>
                    </div>
                  )}
                  
                  {features.priority_support && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Suporte prioritário</span>
                    </div>
                  )}
                  
                  {features.early_access && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Acesso antecipado</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleSubscribe(plan.id, plan.display_name)}
                  disabled={isCurrentPlan}
                  className={`w-full ${
                    isCurrentPlan 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : `bg-gradient-to-r ${colorClass} hover:opacity-90`
                  } text-white font-bold py-3 transition-all duration-300`}
                >
                  {isCurrentPlan ? '✓ Plano Ativo' : `Assinar ${plan.display_name}`}
                </Button>
                
                {!isCurrentPlan && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    * Integração Stripe em breve
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="bg-blue-900/30 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold text-white mb-3">
          💡 Por que apoiar o RadVenture?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200 text-sm">
          <div>
            <strong>🎓 Educação Médica:</strong> Apoie o desenvolvimento de uma plataforma educacional de qualidade para estudantes de medicina.
          </div>
          <div>
            <strong>🚀 Inovação:</strong> Contribua para o futuro da educação médica com tecnologia de ponta.
          </div>
          <div>
            <strong>🤝 Comunidade:</strong> Faça parte de uma comunidade engajada de futuros profissionais da saúde.
          </div>
          <div>
            <strong>📈 Crescimento:</strong> Acelere seus estudos com ferramentas exclusivas e conteúdo premium.
          </div>
        </div>
      </div>
    </div>
  );
}
