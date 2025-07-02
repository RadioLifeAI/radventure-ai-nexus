
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Sparkles,
  CheckCircle,
  Diamond,
  Award,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PremiumSubscriptionsTabProps {
  currentBalance: number;
}

export function PremiumSubscriptionsTab({ currentBalance }: PremiumSubscriptionsTabProps) {
  const { data: subscriptionPlans = [], isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const handleSubscribe = (planId: string, planName: string) => {
    console.log("Subscribing to plan:", planId, planName);
    // TODO: Implementar lógica de assinatura via Stripe
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('5') || planName.toLowerCase().includes('bronze')) return Award;
    if (planName.includes('10') || planName.toLowerCase().includes('prata')) return Star;
    if (planName.includes('15') || planName.toLowerCase().includes('ouro')) return Crown;
    return Diamond;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('5') || planName.toLowerCase().includes('bronze')) 
      return "from-orange-600 to-amber-700";
    if (planName.includes('10') || planName.toLowerCase().includes('prata')) 
      return "from-gray-500 to-slate-600";
    if (planName.includes('15') || planName.toLowerCase().includes('ouro')) 
      return "from-yellow-500 to-yellow-600";
    return "from-purple-500 to-pink-600";
  };

  const getPlanBadge = (planName: string) => {
    if (planName.includes('5') || planName.toLowerCase().includes('bronze')) 
      return { text: "BRONZE", color: "bg-orange-500 text-orange-900", icon: Award };
    if (planName.includes('10') || planName.toLowerCase().includes('prata')) 
      return { text: "POPULAR", color: "bg-blue-500 text-blue-900", icon: Star };
    if (planName.includes('15') || planName.toLowerCase().includes('ouro')) 
      return { text: "OURO", color: "bg-yellow-500 text-yellow-900", icon: Crown };
    return { text: "PREMIUM", color: "bg-purple-500 text-purple-900", icon: Diamond };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Crown className="h-8 w-8 text-yellow-400" />
          Assinaturas Educacionais
        </h2>
        <p className="text-purple-200 text-lg">
          Apoie o projeto educacional e ganhe benefícios exclusivos!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan, index) => {
          const features = (plan.features as Record<string, any>) || {};
          const limits = (plan.limits as Record<string, any>) || {};
          const Icon = getPlanIcon(plan.name);
          const badge = getPlanBadge(plan.name);
          const BadgeIcon = badge.icon;

          return (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden bg-gradient-to-br ${getPlanColor(plan.name)} border-2 ${
                plan.name.includes('10') ? 'border-blue-400 shadow-2xl scale-105' : 'border-white/20'
              } hover:scale-105 transition-all duration-300`}
            >
              {/* Badge do Plano */}
              <div className="absolute top-4 right-4">
                <Badge className={`${badge.color} font-bold animate-pulse`}>
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  {badge.text}
                </Badge>
              </div>

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm w-fit">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {plan.display_name || plan.name}
                </CardTitle>
                <p className="text-blue-100">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preço */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">
                      R$ {plan.price_monthly}
                    </span>
                    <span className="text-blue-200">/mês</span>
                  </div>
                  {plan.price_yearly > 0 && (
                    <div className="text-sm text-green-300">
                      ou R$ {plan.price_yearly}/ano (economize 20%)
                    </div>
                  )}
                </div>

                {/* Recursos Inclusos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-center">Benefícios Inclusos:</h4>
                  <div className="space-y-2">
                    {limits.radcoins_monthly && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Zap className="h-5 w-5 text-orange-400" />
                        <span className="text-white font-medium">{limits.radcoins_monthly} RadCoins/mês</span>
                      </div>
                    )}
                    
                    {features.colaborator_badge && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                          Selo: {features.colaborator_badge}
                        </Badge>
                      </div>
                    )}

                    {features.elimination_aids && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <span className="text-white">+{features.elimination_aids} Eliminações extras</span>
                      </div>
                    )}

                    {features.skip_aids && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <span className="text-white">+{features.skip_aids} Pulos extras</span>
                      </div>
                    )}

                    {features.ai_tutor_credits && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        <span className="text-white">+{features.ai_tutor_credits} Créditos IA Tutor</span>
                      </div>
                    )}

                    {features.xp_multiplier && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-white">+{((features.xp_multiplier - 1) * 100).toFixed(0)}% Bônus XP</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white text-sm">Suporte ao projeto educacional</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Assinatura */}
                <Button
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Assinar {plan.display_name}
                </Button>

                {/* Garantia */}
                <div className="text-center text-xs text-blue-200">
                  ⚡ Via Stripe • Cancele a qualquer momento<br />
                  🛡️ Contribua com a educação médica
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem se não há planos */}
      {subscriptionPlans.length === 0 && (
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
          <CardContent className="p-8 text-center">
            <Crown className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Planos Educacionais em Breve
            </h3>
            <p className="text-purple-200 mb-4">
              Estamos preparando planos de apoio ao projeto educacional com benefícios incríveis!
            </p>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
              🎓 Sistema educacional em desenvolvimento
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Sobre o Projeto Educacional */}
      <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            🎓 Por que apoiar nosso projeto educacional?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-300">💡 Missão Educacional</h4>
              <ul className="space-y-2 text-sm text-green-200">
                <li>• Democratizar o ensino de radiologia</li>
                <li>• Casos clínicos reais e educativos</li>
                <li>• IA para personalizar o aprendizado</li>
                <li>• Plataforma 100% brasileira</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-300">🏆 Seu Apoio Faz a Diferença</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>• Selo de colaborador no seu perfil</li>
                <li>• Benefícios exclusivos na plataforma</li>
                <li>• Ajuda a manter o projeto gratuito para estudantes</li>
                <li>• Contribui para a educação médica no Brasil</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
