
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Clock, 
  Star, 
  Zap, 
  Target, 
  Brain,
  Gift,
  TrendingUp
} from "lucide-react";
import { useRadCoinShop } from "../hooks/useRadCoinShop";

interface SpecialOffersTabProps {
  currentBalance: number;
}

export function SpecialOffersTab({ currentBalance }: SpecialOffersTabProps) {
  const { specialOffers, purchaseSpecialOffer, isPurchasing } = useRadCoinShop();
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  // Simular contagem regressiva
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      
      specialOffers.forEach(offer => {
        // Simular tempo restante (em produção, seria calculado com base em dados reais)
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const seconds = Math.floor(Math.random() * 60);
        newTimeLeft[offer.id] = `${hours}h ${minutes}m ${seconds}s`;
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [specialOffers]);

  const handlePurchase = (offer: any) => {
    purchaseSpecialOffer(offer);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Flame className="h-8 w-8 text-orange-400 animate-pulse" />
          Ofertas Especiais
        </h2>
        <p className="text-blue-200 text-lg">
          Aproveite descontos incríveis por tempo limitado!
        </p>
      </div>

      {/* Flash Sales */}
      <div className="space-y-4">
        {specialOffers.map((offer, index) => {
          const canAfford = currentBalance >= offer.salePrice;
          const savings = offer.originalPrice - offer.salePrice;

          return (
            <Card 
              key={offer.id}
              className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 border-2 border-yellow-400 shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              {/* Badge de Oferta Limitada */}
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-red-500 text-white font-bold animate-bounce">
                  <Flame className="h-3 w-3 mr-1" />
                  OFERTA LIMITADA
                </Badge>
              </div>

              {/* Desconto */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white text-red-600 font-bold text-2xl px-4 py-2 rounded-full shadow-lg">
                  -{offer.discount}%
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  {/* Informações da Oferta */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {offer.name}
                      </h3>
                      <p className="text-yellow-100 text-lg">
                        {offer.description}
                      </p>
                    </div>

                    {/* Contador */}
                    <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-300" />
                        <span className="text-yellow-300 font-semibold">Tempo Restante:</span>
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">
                        {timeLeft[offer.id] || offer.timeLeft}
                      </div>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-white mb-4">Você recebe:</h4>
                    <div className="space-y-2">
                      {offer.benefits.elimination_aids && (
                        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                          <Target className="h-5 w-5 text-green-300" />
                          <span className="text-white font-semibold">
                            {offer.benefits.elimination_aids} Ajudas de Eliminação
                          </span>
                        </div>
                      )}
                      {offer.benefits.skip_aids && (
                        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                          <Zap className="h-5 w-5 text-blue-300" />
                          <span className="text-white font-semibold">
                            {offer.benefits.skip_aids} Pulos de Questão
                          </span>
                        </div>
                      )}
                      {offer.benefits.ai_tutor_credits && (
                        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                          <Brain className="h-5 w-5 text-purple-300" />
                          <span className="text-white font-semibold">
                            {offer.benefits.ai_tutor_credits} Créditos Tutor IA
                          </span>
                        </div>
                      )}
                      {offer.benefits.bonus_points_multiplier && (
                        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                          <TrendingUp className="h-5 w-5 text-yellow-300" />
                          <span className="text-white font-semibold">
                            Multiplicador {offer.benefits.bonus_points_multiplier}x pontos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preço e Compra */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="space-y-2">
                        {/* Preço Original */}
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl text-gray-300 line-through">
                            {offer.originalPrice.toLocaleString()}
                          </span>
                          <div className="w-3 h-3 bg-gray-300 rounded-full opacity-50"></div>
                        </div>
                        
                        {/* Preço de Oferta */}
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-4xl font-bold text-white">
                            {offer.salePrice.toLocaleString()}
                          </span>
                          <span className="text-yellow-200 text-xl">RadCoins</span>
                        </div>
                        
                        {/* Economia */}
                        <div className="bg-green-500/20 rounded-lg p-2 border border-green-400/30">
                          <span className="text-green-300 font-bold">
                            💰 Você economiza {savings.toLocaleString()} RadCoins!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Compra */}
                    <Button
                      className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
                        canAfford
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl animate-pulse'
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                      onClick={() => handlePurchase(offer)}
                      disabled={!canAfford || isPurchasing}
                    >
                      {isPurchasing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processando...
                        </div>
                      ) : canAfford ? (
                        <>
                          <Flame className="h-5 w-5 mr-2" />
                          APROVEITAR OFERTA
                        </>
                      ) : (
                        'Saldo Insuficiente'
                      )}
                    </Button>

                    {!canAfford && (
                      <p className="text-center text-red-300 text-sm">
                        Você precisa de mais {(offer.salePrice - currentBalance).toLocaleString()} RadCoins
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximas Ofertas */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 animate-spin" />
            Próximas Ofertas Especiais
          </h3>
          <p className="text-purple-200 mb-4">
            Fique de olho! Novas ofertas incríveis chegando em breve
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <Gift className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Black Friday</h4>
              <p className="text-purple-200">Até 70% de desconto em todos os pacotes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Mega Sale</h4>
              <p className="text-purple-200">Ofertas especiais todo domingo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
