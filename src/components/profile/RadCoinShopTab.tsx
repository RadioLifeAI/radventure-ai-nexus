
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Coins, 
  ShoppingBag, 
  TrendingUp, 
  Gift,
  Crown,
  Flame,
  Clock,
  Target,
  Brain,
  Zap
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RadCoinShopTab() {
  const { user } = useAuth();

  const { data: recentPurchases = [], isLoading } = useQuery({
    queryKey: ['recent-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('radcoin_transactions_log')
        .select('*')
        .eq('user_id', user.id)
        .in('tx_type', ['help_package_purchase', 'special_offer_purchase', 'subscription_purchase'])
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: userBenefits } = useQuery({
    queryKey: ['user-benefits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_benefits')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: helpAids } = useQuery({
    queryKey: ['user-help-aids', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_help_aids')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getTransactionIcon = (txType: string) => {
    if (txType.includes('package')) return Gift;
    if (txType.includes('offer')) return Flame;
    if (txType.includes('subscription')) return Crown;
    return ShoppingBag;
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Coins className="h-6 w-6 text-yellow-500" />
          Loja & Benefícios RadCoin
        </h2>
        <p className="text-gray-600">
          Gerencie suas compras e benefícios da loja RadCoin
        </p>
      </div>

      {/* Benefícios Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-700">
              {helpAids?.elimination_aids || 0}
            </h3>
            <p className="text-green-600 text-sm">Ajudas de Eliminação</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-700">
              {helpAids?.skip_aids || 0}
            </h3>
            <p className="text-blue-600 text-sm">Pulos de Questão</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-purple-700">
              {helpAids?.ai_tutor_credits || 0}
            </h3>
            <p className="text-purple-600 text-sm">Créditos Tutor IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Benefícios Premium */}
      {userBenefits?.has_premium_features && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Crown className="h-5 w-5" />
              Benefícios Premium Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">
                  Multiplicador {userBenefits.bonus_points_multiplier}x pontos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">
                  Acesso a ofertas exclusivas
                </span>
              </div>
            </div>
            {userBenefits.custom_title && (
              <div className="mt-3">
                <Badge className="bg-orange-500 text-white">
                  Título: {userBenefits.custom_title}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Compras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Histórico de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPurchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma compra realizada ainda</p>
                <p className="text-sm text-gray-400 mt-2">
                  Visite a Loja RadCoin para adquirir pacotes de ajuda!
                </p>
              </div>
            ) : (
              recentPurchases.map((purchase) => {
                const Icon = getTransactionIcon(purchase.tx_type);
                
                return (
                  <div 
                    key={purchase.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {purchase.metadata?.package_name || 
                           purchase.metadata?.offer_name || 
                           purchase.tx_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {format(new Date(purchase.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {purchase.amount.toLocaleString()} RadCoins
                      </div>
                      {purchase.metadata?.discount && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {purchase.metadata.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dicas de Economia */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-700 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dicas para Economizar RadCoins
          </h3>
          <p className="text-cyan-600 mb-4">
            Aproveite ofertas especiais e ganhe mais RadCoins!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-700">Ofertas Especiais</h4>
              <p className="text-gray-600">Fique de olho nas promoções semanais</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <Gift className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-700">Conquistas</h4>
              <p className="text-gray-600">Complete desafios para ganhar RadCoins grátis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
