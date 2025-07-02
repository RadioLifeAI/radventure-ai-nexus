
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Zap, 
  Target, 
  Brain, 
  Star,
  Flame,
  Crown
} from "lucide-react";
import { useRadCoinStore } from "../hooks/useRadCoinStore";

interface HelpPackagesTabProps {
  currentBalance: number;
}

export function HelpPackagesTab({ currentBalance }: HelpPackagesTabProps) {
  const { products, purchaseProduct, isPurchasing } = useRadCoinStore();

  const handlePurchase = (productId: string) => {
    purchaseProduct(productId);
  };

  const getPackageIcon = (index: number) => {
    const icons = [Gift, Zap, Crown];
    const Icon = icons[index] || Gift;
    return <Icon className="h-8 w-8" />;
  };

  const getPackageColor = (index: number) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-purple-500 to-pink-600", 
      "from-yellow-500 to-orange-600"
    ];
    return colors[index] || colors[0];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Gift className="h-8 w-8 text-purple-400" />
          Pacotes de Ajuda
        </h2>
        <p className="text-blue-200 text-lg">
          Potencialize seu aprendizado com nossos pacotes especiais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((pkg, index) => {
          const canAfford = currentBalance >= pkg.price;
          const discountedPrice = pkg.discount_percentage 
            ? Math.floor(pkg.price * (1 - pkg.discount_percentage / 100))
            : pkg.price;

          return (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden bg-gradient-to-br ${getPackageColor(index)} border-2 ${
                pkg.is_popular ? 'border-yellow-400 shadow-2xl scale-105' : 'border-white/20'
              } hover:scale-105 transition-all duration-300`}
            >
              {pkg.is_popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold animate-pulse">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAR
                  </Badge>
                </div>
              )}

              {pkg.discount_percentage > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white font-bold">
                    <Flame className="h-3 w-3 mr-1" />
                    -{pkg.discount_percentage}%
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm w-fit">
                  {getPackageIcon(index)}
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {pkg.name}
                </CardTitle>
                <p className="text-blue-100">{pkg.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preço */}
                <div className="text-center">
                  {pkg.discount_percentage > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl text-gray-300 line-through">
                          {pkg.price.toLocaleString()}
                        </span>
                        <Badge className="bg-red-500 text-white">
                          -{pkg.discount_percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span className="text-3xl font-bold text-white">
                          {discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-yellow-200">RadCoins</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="text-3xl font-bold text-white">
                        {pkg.price.toLocaleString()}
                      </span>
                      <span className="text-yellow-200">RadCoins</span>
                    </div>
                  )}
                </div>

                {/* Benefícios */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-center">O que você recebe:</h4>
                  <div className="space-y-2">
                    {pkg.benefits.elimination_aids && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Target className="h-5 w-5 text-green-400" />
                        <span className="text-white">
                          {pkg.benefits.elimination_aids} Ajudas de Eliminação
                        </span>
                      </div>
                    )}
                    {pkg.benefits.skip_aids && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Zap className="h-5 w-5 text-blue-400" />
                        <span className="text-white">
                          {pkg.benefits.skip_aids} Pulos de Questão
                        </span>
                      </div>
                    )}
                    {pkg.benefits.ai_tutor_credits && (
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Brain className="h-5 w-5 text-purple-400" />
                        <span className="text-white">
                          {pkg.benefits.ai_tutor_credits} Créditos Tutor IA
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Compra */}
                <Button
                  className={`w-full py-3 text-lg font-bold transition-all duration-300 ${
                    canAfford
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!canAfford || isPurchasing}
                >
                  {isPurchasing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : canAfford ? (
                    'Comprar Agora'
                  ) : (
                    'Saldo Insuficiente'
                  )}
                </Button>

                {!canAfford && (
                  <p className="text-center text-red-300 text-sm">
                    Você precisa de {(discountedPrice - currentBalance).toLocaleString()} RadCoins a mais
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dica de como ganhar RadCoins */}
      <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-400/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            Como ganhar mais RadCoins?
          </h3>
          <p className="text-blue-200 mb-4">
            Resolva casos médicos, participe de eventos e complete desafios para ganhar RadCoins gratuitamente!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
              ✓ Casos corretos: +1-5 RadCoins
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              ✓ Eventos: +10-50 RadCoins
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
              ✓ Conquistas: +5-100 RadCoins
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
