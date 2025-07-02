
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
  Diamond
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

  const handleSubscribe = (planId: string) => {
    console.log("Subscribing to plan:", planId);
    // TODO: Implementar lógica de assinatura
  };

  const getPlanIcon = (index: number) => {
    const icons = [Star, Crown, Diamond];
    const Icon = icons[index] || Crown;
    return <Icon className="h-8 w-8" />;
  };

  const getPlanColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-600",
      "from-purple-500 to-pink-600", 
      "from-yellow-500 to-orange-600"
    ];
    return colors[index] || colors[1];
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
          Assinaturas Premium
        </h2>
        <p className="text-purple-200 text-lg">
          Desbloqueie todo o potencial da plataforma com benefícios exclusivos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan, index) => {
          const features = plan.features || {};
          const limits = plan.limits || {};

          return (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden bg-gradient-to-br ${getPlanColor(index)} border-2 ${
                index === 1 ? 'border-yellow-400 shadow-2xl scale-105' : 'border-white/20'
              } hover:scale-105 transition-all duration-300`}
            >
              {index === 1 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold animate-pulse">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm w-fit">
                  {getPlanIcon(index)}
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
                  <h4 className="font-semibold text-white text-center">Recursos Inclusos:</h4>
                  <div className="space-y-2">
                    {features.unlimited_cases && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">Casos Ilimitados</span>
                      </div>
                    )}
                    {features.ai_tutor && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        <span className="text-white">IA Tutor Avançado</span>
                      </div>
                    )}
                    {features.priority_support && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <span className="text-white">Suporte Prioritário</span>
                      </div>
                    )}
                    {features.exclusive_content && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Crown className="h-5 w-5 text-yellow-400" />
                        <span className="text-white">Conteúdo Exclusivo</span>
                      </div>
                    )}
                    {limits.radcoins_monthly && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Zap className="h-5 w-5 text-orange-400" />
                        <span className="text-white">{limits.radcoins_monthly} RadCoins/mês</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Assinatura */}
                <Button
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleSubscribe(plan.id)}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Assinar {plan.display_name}
                </Button>

                {/* Garantia */}
                <div className="text-center text-xs text-blue-200">
                  ⚡ Cancele a qualquer momento<br />
                  🛡️ Garantia de 7 dias
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
              Planos Premium em Breve
            </h3>
            <p className="text-purple-200 mb-4">
              Estamos preparando planos exclusivos com benefícios incríveis para você!
            </p>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
              👑 Em desenvolvimento
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Comparação de Benefícios */}
      <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Por que escolher Premium?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-300">✨ Recursos Exclusivos</h4>
              <ul className="space-y-2 text-sm text-cyan-200">
                <li>• Acesso a casos premium exclusivos</li>
                <li>• IA Tutor com explicações detalhadas</li>
                <li>• Estatísticas avançadas de performance</li>
                <li>• Simulados personalizados</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-300">🎯 Vantagens Premium</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>• Suporte prioritário 24/7</li>
                <li>• Sem limites de uso</li>
                <li>• Acesso antecipado a novos recursos</li>
                <li>• Desconto em eventos exclusivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
