
import React from "react";
import { Trophy, Medal, Award, Star } from "lucide-react";

type PrizeDistribution = {
  position: number;
  prize: number;
  percentage?: number;
};

type Props = {
  prizeDistribution: PrizeDistribution[];
  totalPrize: number;
};

export function PrizeDistributionDisplay({ prizeDistribution, totalPrize }: Props) {
  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy size={24} className="text-yellow-500" />;
      case 2: return <Medal size={24} className="text-gray-400" />;
      case 3: return <Award size={24} className="text-amber-600" />;
      default: return <Star size={20} className="text-cyan-400" />;
    }
  };

  const getPrizeColors = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-amber-500 to-amber-700";
      default: return "from-cyan-400 to-cyan-600";
    }
  };

  return (
    <div className="w-full bg-white/90 rounded-xl p-6 border border-gray-200 shadow-lg mb-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-500" size={20} />
        Distribuição de Prêmios
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prizeDistribution.map((prize) => (
          <div
            key={prize.position}
            className={`bg-gradient-to-br ${getPrizeColors(prize.position)} p-4 rounded-lg text-white text-center shadow-lg hover:scale-105 transition-all duration-200`}
          >
            <div className="flex justify-center mb-2">
              {getPrizeIcon(prize.position)}
            </div>
            
            <div className="font-bold text-lg">
              {prize.position}º Lugar
            </div>
            
            <div className="text-2xl font-extrabold">
              {prize.prize} RC
            </div>
            
            {prize.percentage && (
              <div className="text-sm opacity-90">
                {prize.percentage}% do total
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-gray-600">
          <span className="font-semibold">Total de Prêmios:</span>
          <span className="text-xl font-bold text-yellow-600">{totalPrize} RadCoins</span>
        </div>
      </div>
    </div>
  );
}
