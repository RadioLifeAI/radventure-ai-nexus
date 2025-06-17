
import React from "react";
import { Gift, Sparkles, Coins, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RewardManagementHeaderProps {
  totalRewards?: number;
  activeRewards?: number;
  distributedToday?: number;
}

export function RewardManagementHeader({ 
  totalRewards = 0, 
  activeRewards = 0, 
  distributedToday = 0 
}: RewardManagementHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <Gift className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Gestão de Recompensas
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-pink-100 text-lg">
              Configure recompensas e sistema de RadCoins da plataforma
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-pink-500/80 text-white px-3 py-1">
                <Gift className="h-4 w-4 mr-1" />
                {totalRewards} recompensas
              </Badge>
              <Badge className="bg-rose-500/80 text-white px-3 py-1">
                <Zap className="h-4 w-4 mr-1" />
                {activeRewards} ativas
              </Badge>
              <Badge className="bg-red-500/80 text-white px-3 py-1">
                <Coins className="h-4 w-4 mr-1" />
                {distributedToday} distribuídas hoje
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
