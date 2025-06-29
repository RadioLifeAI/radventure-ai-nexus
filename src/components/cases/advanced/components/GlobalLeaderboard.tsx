
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Flame } from "lucide-react";

interface Player {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  total_points: number;
  current_streak: number;
  medical_specialty?: string;
}

interface Props {
  players: Player[];
}

export function GlobalLeaderboard({ players }: Props) {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          Top Jogadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.slice(0, 10).map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30' 
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {index === 0 && <Crown className="h-5 w-5 text-yellow-400" />}
                {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                <span className="font-bold text-white w-6 text-center">
                  #{index + 1}
                </span>
              </div>
              
              <img 
                src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-white/20"
              />
              
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {player.full_name || player.username}
                </div>
                {player.medical_specialty && (
                  <div className="text-xs text-gray-300">
                    {player.medical_specialty}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-white">
                  {player.total_points.toLocaleString()} pts
                </div>
                {player.current_streak > 0 && (
                  <div className="text-xs text-orange-400 flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {player.current_streak}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
