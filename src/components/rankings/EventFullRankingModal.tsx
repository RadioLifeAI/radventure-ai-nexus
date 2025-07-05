import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";
import { EventRankingData } from "@/hooks/useEventRankingsEnhanced";
import { useAuth } from "@/hooks/useAuth";

interface EventFullRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: EventRankingData[];
  eventName: string;
}

export function EventFullRankingModal({ isOpen, onClose, rankings, eventName }: EventFullRankingModalProps) {
  const { user } = useAuth();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300";
      case 2: return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300";
      case 3: return "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300";
      default: return "bg-white hover:bg-gray-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-blue-500" />
            Ranking Completo - {eventName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-2">
          {rankings.map((ranking, index) => {
            const isCurrentUser = ranking.user_id === user?.id;
            
            return (
              <div
                key={ranking.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrentUser 
                    ? 'bg-cyan-100 border-cyan-300 shadow-sm ring-2 ring-cyan-300' 
                    : getRankColors(ranking.rank)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(ranking.rank)}
                      <span className={`font-bold text-lg ${
                        ranking.rank <= 3 ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        #{ranking.rank}
                      </span>
                    </div>
                    
                    {ranking.user.avatar_url ? (
                      <img 
                        src={ranking.user.avatar_url} 
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                        {ranking.user.full_name?.charAt(0) || ranking.user.username?.charAt(0) || '?'}
                      </div>
                    )}
                    
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {ranking.user.full_name || ranking.user.username}
                        {isCurrentUser && (
                          <Badge className="bg-cyan-500 text-white text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ranking.user.medical_specialty}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      {ranking.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">pontos</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          {rankings.length} participantes total
        </div>
      </DialogContent>
    </Dialog>
  );
}