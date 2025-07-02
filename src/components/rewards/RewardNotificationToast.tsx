
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Coins, Trophy, Sparkles, Gift } from 'lucide-react';

interface RewardNotificationProps {
  type: 'radcoins' | 'points' | 'achievement' | 'subscription';
  amount?: number;
  title: string;
  description: string;
}

export function useRewardNotification() {
  const { toast } = useToast();

  const showRewardToast = ({ type, amount, title, description }: RewardNotificationProps) => {
    const getIcon = () => {
      switch (type) {
        case 'radcoins': return '💰';
        case 'points': return '🎯';
        case 'achievement': return '🏆';
        case 'subscription': return '⭐';
        default: return '🎁';
      }
    };

    toast({
      title: `${getIcon()} ${title}`,
      description: amount ? `+${amount} ${description}` : description,
      duration: 4000,
    });
  };

  return { showRewardToast };
}
