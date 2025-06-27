
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, 
  Star, 
  Zap, 
  Brain, 
  Target, 
  Gift,
  Infinity,
  Shield
} from "lucide-react";

interface PremiumSubscriptionsTabProps {
  currentBalance: number;
}

export function PremiumSubscriptionsTab({ currentBalance }: PremiumSubscriptionsTabProps) {
  const { data: subscriptionPlans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
        
      if (error) throw error;
      return data;
    }
  });

  const handleSubscribe = (plan: any) => {
    // Implementar lógica de assinatura híbrida (dinheiro + RadCoins)
    console.log('Assinar plano:', plan);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return Crown;
    if (planName.toLowerCase().includes('pro')) return Star;
    return Gift;
  };

  const getPlanColor = (index: number) => {
    const colors = [
      "from-green-500 to-emerald-600",
      "from-blue-500 to-purple-600", 
      "from-purple-500 to-pink-600"
    ];
    return colors[index] || colors[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
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
        <p className="text-blue-200 text-lg">
          Desbloqueie o máximo potencial da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name);
          const isPopular = plan.name.toLowerCase().includes('pro');
          
          // Calcular desconto em RadCoins (exemplo: 20% do valor mensal)
          const radcoinDiscount = Math.floor(plan.price_monthly * 0.2 * 100); // Convertendo para RadCoins

          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden bg-gradient-to-br ${getPlanColor(index)} border-2 ${
                isPopular ? 'border-yellow-400 shadow-2xl scale-105' : 'border-white/20'
              } hover:scale-105 transition-all duration-300`}
            >
              {isPopular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold animate-pulse">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm w-fit">
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {plan.display_name}
                </CardTitle>
                <p className="text-blue-100">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preços */}
                <div className="space-y-3">
                  <div className="text-center bg-white/10 rounded-lg p-4">
                    <h4 className="text-sm text-blue-200 mb-2">Pagamento Tradicional</h4>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-bold text-white">
                        R$ {plan.price_monthly.toFixed(2)}
                      </span>
                      <span className="text-blue-200">/mês</span>
                    </div>
                    {plan.price_yearly > 0 && (
                      <div className="text-sm text-green-300 mt-1">
                        ou R$ {plan.price_yearly.toFixed(2)}/ano
                      </div>
                    )}
                  </div>

                  <div className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
                    <h4 className="text-sm text-yellow-200 mb-2">Opção RadCoin (Desconto)</h4>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="text-2xl font-bold text-white">
                        {radcoinDiscount.toLocaleString()}
                      </span>
                      <span className="text-yellow-200">RadCoins</span>
                    </div>
                    <div className="text-sm text-green-300 mt-1">
                      Economize 20% pagando com RadCoins
                    </div>
                  </div>
                </div>

                {/* Recursos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-center">Recursos inclusos:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <Infinity className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Casos ilimitados</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="text-white">IA Tutor avançada</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-white">Análises detalhadas</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <Shield className="h-5 w-5 text-cyan-400" />
                      <span className="text-white">Suporte prioritário</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Assinatura */}
                <div className="space-y-2">
                  <Button
                    className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => handleSubscribe({ ...plan, paymentMethod: 'traditional' })}
                  >
                    Assinar por R$ {plan.price_monthly.toFixed(2)}/mês
                  </Button>

                  <Button
                    className={`w-full py-3 text-lg font-bold transition-all duration-300 ${
                      currentBalance >= radcoinDiscount
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => handleSubscribe({ ...plan, paymentMethod: 'radcoin' })}
                    disabled={currentBalance < radcoinDiscount}
                  >
                    {currentBalance >= radcoinDiscount ? (
                      <>Assinar com RadCoins (20% OFF)</>
                    ) : (
                      `Precisa de ${(radcoinDiscount - currentBalance).toLocaleString()} RadCoins`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Vantagens das Assinaturas Premium
          </h3>
          <p className="text-purple-200 mb-4">
            Transforme sua experiência de aprendizado com recursos exclusivos e suporte diferenciado
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Aprendizado Acelerado</h4>
              <p className="text-purple-200">IA personalizada e cases ilimitados</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Análises Profundas</h4>
              <p className="text-purple-200">Relatórios detalhados do seu progresso</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Suporte VIP</h4>
              <p className="text-purple-200">Atendimento prioritário 24/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
