
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Star,
  Timer
} from "lucide-react";
import { useRadCoinStore } from "../hooks/useRadCoinStore";

interface SpecialOffersTabProps {
  currentBalance: number;
}

export function SpecialOffersTab({ currentBalance }: SpecialOffersTabProps) {
  const { specialOffers, purchaseSpecialOffer, isPurchasing } = useRadCoinStore();

  const handlePurchase = (offerId: string) => {
    purchaseSpecialOffer(offerId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Flame className="h-8 w-8 text-orange-400" />
          Ofertas Especiais
        </h2>
        <p className="text-orange-200 text-lg">
          Aproveite descontos imperdíveis por tempo limitado!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specialOffers.map((offer, index) => {
          const canAfford = currentBalance >= offer.sale_price;
          const savings = offer.original_price - offer.sale_price;

          return (
            <Card 
              key={offer.id}
              className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 border-2 border-yellow-400 shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Badge de Desconto */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-yellow-900 font-bold text-lg px-3 py-1 animate-pulse">
                  -{offer.discount_percentage}% OFF
                </Badge>
              </div>

              {/* Badge de Tempo Limitado */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-600 text-white font-bold animate-bounce">
                  <Timer className="h-3 w-3 mr-1" />
                  LIMITADO
                </Badge>
              </div>

              <CardHeader className="text-center pb-4 pt-16">
                <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm w-fit">
                  <Flame className="h-10 w-10 text-yellow-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {offer.name}
                </CardTitle>
                <p className="text-orange-100">{offer.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preços */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl text-orange-200 line-through">
                      {offer.original_price.toLocaleString()} RC
                    </span>
                    <Badge className="bg-green-500 text-white font-bold">
                      Economize {savings} RC
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <span className="text-4xl font-bold text-white">
                      {offer.sale_price.toLocaleString()}
                    </span>
                    <span className="text-yellow-200 text-xl">RadCoins</span>
                  </div>
                </div>

                {/* Contador de Tempo */}
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-300 font-bold">TEMPO RESTANTE</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {offer.timeLeft || 'Sem expiração'}
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-center">Benefícios Exclusivos:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">
                        {offer.benefits.elimination_aids} Ajudas de Eliminação
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">
                        {offer.benefits.skip_aids} Pulos de Questão
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="text-white font-medium">
                        {offer.benefits.ai_tutor_credits} Créditos Tutor IA
                      </span>
                    </div>
                    {offer.benefits.bonus_points_multiplier && offer.benefits.bonus_points_multiplier > 1 && (
                      <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-medium">
                          {offer.benefits.bonus_points_multiplier}x Multiplicador de Pontos
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Compra */}
                <Button
                  className={`w-full py-4 text-xl font-bold transition-all duration-300 ${
                    canAfford
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-2xl hover:shadow-3xl border-2 border-yellow-400'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={() => handlePurchase(offer.id)}
                  disabled={!canAfford || isPurchasing}
                >
                  {isPurchasing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : canAfford ? (
                    <>
                      <Flame className="h-5 w-5 mr-2" />
                      APROVEITAR AGORA
                    </>
                  ) : (
                    'Saldo Insuficiente'
                  )}
                </Button>

                {!canAfford && (
                  <p className="text-center text-yellow-300 text-sm font-bold">
                    Você precisa de {(offer.sale_price - currentBalance).toLocaleString()} RadCoins a mais
                  </p>
                )}

                {/* Informações da Oferta */}
                {(offer.is_limited || offer.max_redemptions) && (
                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-orange-200 text-sm">
                      {offer.is_limited && offer.max_redemptions && (
                        <>Restam apenas {offer.max_redemptions - (offer.current_redemptions || 0)} unidades!</>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem se não há ofertas */}
      {specialOffers.length === 0 && (
        <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-400/30">
          <CardContent className="p-8 text-center">
            <Flame className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Nenhuma Oferta Especial Ativa
            </h3>
            <p className="text-orange-200 mb-4">
              Fique de olho! Novas ofertas imperdíveis chegam em breve!
            </p>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 px-4 py-2">
              🔥 Em breve: ofertas exclusivas!
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
