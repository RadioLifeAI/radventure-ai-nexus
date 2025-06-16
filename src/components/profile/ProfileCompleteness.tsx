
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Camera, MapPin, GraduationCap, Trophy, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletenessProps {
  onEditProfile: () => void;
}

interface CompletionReward {
  percentage: number;
  radcoins: number;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

export function ProfileCompleteness({ onEditProfile }: ProfileCompletenessProps) {
  const { profile, refreshProfile } = useAuth();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState<CompletionReward | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);

  const completionRewards: CompletionReward[] = [
    {
      percentage: 25,
      radcoins: 50,
      description: "Perfil Básico Completo",
      icon: <User className="text-blue-400" size={24} />,
      unlocked: false
    },
    {
      percentage: 50,
      radcoins: 100,
      description: "Foto e Bio Adicionadas",
      icon: <Camera className="text-green-400" size={24} />,
      unlocked: false
    },
    {
      percentage: 75,
      radcoins: 150,
      description: "Localização e Instituição",
      icon: <MapPin className="text-yellow-400" size={24} />,
      unlocked: false
    },
    {
      percentage: 100,
      radcoins: 500,
      description: "Perfil Master Completo",
      icon: <Trophy className="text-purple-400" size={24} />,
      unlocked: false
    }
  ];

  const calculateCompleteness = () => {
    if (!profile) return 0;

    const fields = [
      profile.full_name,
      profile.email,
      profile.academic_stage,
      profile.medical_specialty,
      profile.bio,
      profile.avatar_url,
      profile.city,
      profile.state,
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  useEffect(() => {
    const percentage = calculateCompleteness();
    setCompletionPercentage(percentage);

    const availableRewards = completionRewards.filter(
      reward => percentage >= reward.percentage && !claimedRewards.includes(reward.percentage)
    );

    if (availableRewards.length > 0) {
      const nextReward = availableRewards[0];
      setCurrentReward(nextReward);
      setShowRewardModal(true);
    }
  }, [profile, claimedRewards]);

  const claimReward = async (reward: CompletionReward) => {
    if (!profile) return;

    try {
      const newBalance = (profile.radcoin_balance || 0) + reward.radcoins;
      
      // Update RadCoins balance
      const { error } = await supabase
        .from('profiles')
        .update({ 
          radcoin_balance: newBalance
        })
        .eq('id', profile.id);

      if (!error) {
        // Log the transaction using correct enum value
        await supabase
          .from('radcoin_transactions_log')
          .insert({
            user_id: profile.id,
            amount: reward.radcoins,
            tx_type: 'admin_grant', // Using valid enum value
            balance_after: newBalance,
            metadata: {
              completion_percentage: reward.percentage,
              reward_type: 'profile_completeness'
            }
          });

        setClaimedRewards(prev => [...prev, reward.percentage]);
        await refreshProfile();
        setShowRewardModal(false);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getMissingFields = () => {
    if (!profile) return [];
    
    const fields = [
      { key: 'bio', label: 'Bio pessoal', current: profile.bio },
      { key: 'avatar_url', label: 'Foto de perfil', current: profile.avatar_url },
      { key: 'city', label: 'Cidade', current: profile.city },
      { key: 'state', label: 'Estado', current: profile.state }
    ];

    return fields.filter(field => !field.current || field.current.trim() === '');
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="text-cyan-400" size={20} />
            Completude do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-cyan-100 font-medium">Progresso</span>
              <Badge variant="outline" className="border-cyan-500 text-cyan-300">
                {completionPercentage}%
              </Badge>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-3 bg-slate-700 transition-all duration-500"
            />
          </div>

          {completionPercentage < 100 && (
            <div className="space-y-2">
              <h4 className="text-cyan-300 font-medium">Campos pendentes:</h4>
              <div className="flex flex-wrap gap-2">
                {getMissingFields().map(field => (
                  <Badge key={field.key} variant="secondary" className="bg-slate-700 text-gray-300">
                    {field.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-cyan-300 font-medium">Recompensas disponíveis:</h4>
            <div className="grid grid-cols-2 gap-2">
              {completionRewards.map(reward => (
                <div 
                  key={reward.percentage}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    completionPercentage >= reward.percentage
                      ? claimedRewards.includes(reward.percentage)
                        ? 'bg-green-900/30 border-green-500'
                        : 'bg-yellow-900/30 border-yellow-500 animate-pulse'
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                >
                  {reward.icon}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {reward.percentage}%
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Coins size={12} className="text-yellow-400" />
                      {reward.radcoins}
                    </div>
                  </div>
                  {claimedRewards.includes(reward.percentage) && (
                    <CheckCircle2 size={16} className="text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={onEditProfile}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold"
          >
            <User size={16} className="mr-2" />
            Completar Perfil
          </Button>
        </CardContent>
      </Card>

      {/* Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/50 text-white">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-yellow-400">
              🎉 Parabéns!
            </DialogTitle>
          </DialogHeader>
          
          {currentReward && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {currentReward.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white">
                {currentReward.description}
              </h3>
              
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
                  <Coins size={24} />
                  +{currentReward.radcoins} RadCoins
                </div>
              </div>
              
              <p className="text-gray-300">
                Você completou {currentReward.percentage}% do seu perfil e ganhou uma recompensa especial!
              </p>
              
              <Button
                onClick={() => claimReward(currentReward)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
              >
                Resgatar Recompensa
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
