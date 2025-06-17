
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award } from "lucide-react";

interface Prize {
  position: number;
  prize: number;
}

interface EventFormPrizeDistributionProps {
  prizeDistribution: Prize[];
  onPrizeChange: (index: number, value: number) => void;
}

export function EventFormPrizeDistribution({ prizeDistribution, onPrizeChange }: EventFormPrizeDistributionProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3: return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default: return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    }
  };

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Trophy className="h-5 w-5 text-amber-500" />
          Distribuição de Prêmios
          <Badge className="bg-amber-500 text-white">Top 10</Badge>
        </CardTitle>
        <p className="text-sm text-amber-600">Configure a premiação para cada posição no ranking</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {prizeDistribution.map((p, i) => (
            <div key={i} className={`p-4 rounded-lg border-2 ${i < 3 ? 'border-amber-300 shadow-lg' : 'border-gray-200'}`}>
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getPositionColor(p.position)}`}>
                  {getPositionIcon(p.position)}
                </div>
                <span className="text-sm font-bold text-gray-700">{p.position}º lugar</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={p.prize}
                  min={0}
                  onChange={e => onPrizeChange(i, Number(e.target.value))}
                />
                <span className="text-xs text-gray-500">RadCoins</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <strong>Total distribuído:</strong> {prizeDistribution.reduce((sum, p) => sum + p.prize, 0)} RadCoins
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
