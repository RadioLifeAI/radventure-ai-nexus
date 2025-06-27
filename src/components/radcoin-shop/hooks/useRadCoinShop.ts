
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface HelpPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
  };
  popular?: boolean;
  discount?: number;
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  timeLeft: string;
  benefits: any;
  limited?: boolean;
}

export function useRadCoinShop() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Dados dos pacotes de ajuda
  const helpPackages: HelpPackage[] = [
    {
      id: 'basic-help',
      name: 'Pacote Básico',
      description: 'Ajudas essenciais para começar',
      price: 100,
      benefits: {
        elimination_aids: 10,
        skip_aids: 5,
        ai_tutor_credits: 3
      }
    },
    {
      id: 'advanced-help',
      name: 'Pacote Avançado',
      description: 'Mais ajudas para acelerar seu progresso',
      price: 250,
      benefits: {
        elimination_aids: 30,
        skip_aids: 15,
        ai_tutor_credits: 10
      },
      popular: true,
      discount: 20
    },
    {
      id: 'premium-help',
      name: 'Pacote Premium',
      description: 'Tudo que você precisa para dominar',
      price: 500,
      benefits: {
        elimination_aids: 75,
        skip_aids: 40,
        ai_tutor_credits: 25
      },
      discount: 30
    }
  ];

  // Dados das ofertas especiais
  const specialOffers: SpecialOffer[] = [
    {
      id: 'weekend-deal',
      name: 'Mega Pacote Weekend',
      description: 'Oferta especial de fim de semana',
      originalPrice: 400,
      salePrice: 200,
      discount: 50,
      timeLeft: '2d 14h 23m',
      benefits: {
        elimination_aids: 50,
        skip_aids: 25,
        ai_tutor_credits: 15,
        bonus_points_multiplier: 1.5
      },
      limited: true
    },
    {
      id: 'flash-sale',
      name: 'Flash Sale Extremo',
      description: 'Por tempo limitado!',
      originalPrice: 300,
      salePrice: 150,
      discount: 50,
      timeLeft: '4h 32m',
      benefits: {
        elimination_aids: 40,
        skip_aids: 20,
        ai_tutor_credits: 12
      },
      limited: true
    }
  ];

  const purchaseHelpPackage = useMutation({
    mutationFn: async (packageData: HelpPackage) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      console.log('Comprando pacote de ajuda:', packageData);
      
      // Verificar saldo atual
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('radcoin_balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentBalance = profile?.radcoin_balance || 0;
      if (currentBalance < packageData.price) {
        throw new Error('Saldo insuficiente de RadCoins');
      }

      // Debitar RadCoins
      const { error: debitError } = await supabase
        .from('profiles')
        .update({ 
          radcoin_balance: currentBalance - packageData.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (debitError) throw debitError;

      // Atualizar benefícios do usuário
      const { error: benefitsError } = await supabase
        .from('user_help_aids')
        .update({
          elimination_aids: supabase.raw(`elimination_aids + ${packageData.benefits.elimination_aids || 0}`),
          skip_aids: supabase.raw(`skip_aids + ${packageData.benefits.skip_aids || 0}`),
          ai_tutor_credits: supabase.raw(`ai_tutor_credits + ${packageData.benefits.ai_tutor_credits || 0}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (benefitsError) throw benefitsError;

      // Registrar transação
      const { error: logError } = await supabase
        .from('radcoin_transactions_log')
        .insert({
          user_id: user.id,
          tx_type: 'help_package_purchase',
          amount: -packageData.price,
          balance_after: currentBalance - packageData.price,
          metadata: {
            package_id: packageData.id,
            package_name: packageData.name,
            benefits: packageData.benefits
          }
        });

      if (logError) throw logError;

      return { success: true };
    },
    onMutate: () => setIsPurchasing(true),
    onSuccess: (_, packageData) => {
      toast.success(`Pacote "${packageData.name}" adquirido com sucesso! 🎉`, {
        description: 'Seus benefícios foram adicionados à sua conta.',
        duration: 5000
      });
      
      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
    },
    onError: (error: any) => {
      console.error('Erro na compra:', error);
      toast.error('Erro na compra', {
        description: error.message || 'Tente novamente em alguns instantes.',
        duration: 5000
      });
    },
    onSettled: () => setIsPurchasing(false)
  });

  const purchaseSpecialOffer = useMutation({
    mutationFn: async (offerData: SpecialOffer) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      console.log('Comprando oferta especial:', offerData);
      
      // Similar ao purchaseHelpPackage mas com preço de oferta
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('radcoin_balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentBalance = profile?.radcoin_balance || 0;
      if (currentBalance < offerData.salePrice) {
        throw new Error('Saldo insuficiente de RadCoins');
      }

      // Debitar RadCoins
      const { error: debitError } = await supabase
        .from('profiles')
        .update({ 
          radcoin_balance: currentBalance - offerData.salePrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (debitError) throw debitError;

      // Atualizar benefícios
      const { error: benefitsError } = await supabase
        .from('user_help_aids')
        .update({
          elimination_aids: supabase.raw(`elimination_aids + ${offerData.benefits.elimination_aids || 0}`),
          skip_aids: supabase.raw(`skip_aids + ${offerData.benefits.skip_aids || 0}`),
          ai_tutor_credits: supabase.raw(`ai_tutor_credits + ${offerData.benefits.ai_tutor_credits || 0}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (benefitsError) throw benefitsError;

      // Registrar transação
      const { error: logError } = await supabase
        .from('radcoin_transactions_log')
        .insert({
          user_id: user.id,
          tx_type: 'special_offer_purchase',
          amount: -offerData.salePrice,
          balance_after: currentBalance - offerData.salePrice,
          metadata: {
            offer_id: offerData.id,
            offer_name: offerData.name,
            original_price: offerData.originalPrice,
            discount: offerData.discount,
            benefits: offerData.benefits
          }
        });

      if (logError) throw logError;

      return { success: true };
    },
    onMutate: () => setIsPurchasing(true),
    onSuccess: (_, offerData) => {
      toast.success(`Oferta "${offerData.name}" adquirida! 🔥`, {
        description: `Você economizou ${offerData.discount}% nesta compra!`,
        duration: 5000
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
    },
    onError: (error: any) => {
      console.error('Erro na compra da oferta:', error);
      toast.error('Erro na compra', {
        description: error.message || 'Tente novamente em alguns instantes.',
        duration: 5000
      });
    },
    onSettled: () => setIsPurchasing(false)
  });

  return {
    helpPackages,
    specialOffers,
    isPurchasing,
    purchaseHelpPackage: purchaseHelpPackage.mutate,
    purchaseSpecialOffer: purchaseSpecialOffer.mutate
  };
}
