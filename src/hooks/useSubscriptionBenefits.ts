
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionBenefits {
  collaboratorBadge: string | null;
  monthlyRadcoins: number;
  eliminationAids: number;
  skipAids: number;
  aiTutorCredits: number;
  xpMultiplier: number;
  hasActivePlan: boolean;
  planName: string | null;
}

export function useSubscriptionBenefits() {
  const { user } = useAuth();

  const { data: benefits, isLoading } = useQuery({
    queryKey: ["subscription-benefits", user?.id],
    queryFn: async (): Promise<SubscriptionBenefits> => {
      if (!user?.id) {
        return {
          collaboratorBadge: null,
          monthlyRadcoins: 0,
          eliminationAids: 3, // Básico gratuito
          skipAids: 1, // Básico gratuito
          aiTutorCredits: 2, // Básico gratuito
          xpMultiplier: 1.0,
          hasActivePlan: false,
          planName: null
        };
      }

      // Buscar assinatura ativa do usuário
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (
            name,
            display_name,
            features,
            limits
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!subscription?.subscription_plans) {
        // Usuário sem plano ativo - benefícios gratuitos
        return {
          collaboratorBadge: null,
          monthlyRadcoins: 0,
          eliminationAids: 3,
          skipAids: 1,
          aiTutorCredits: 2,
          xpMultiplier: 1.0,
          hasActivePlan: false,
          planName: null
        };
      }

      const plan = subscription.subscription_plans;
      const features = (plan.features as Record<string, any>) || {};
      const limits = (plan.limits as Record<string, any>) || {};

      return {
        collaboratorBadge: features.colaborator_badge || null,
        monthlyRadcoins: limits.radcoins_monthly || 0,
        eliminationAids: features.elimination_aids || 3,
        skipAids: features.skip_aids || 1,
        aiTutorCredits: features.ai_tutor_credits || 2,
        xpMultiplier: features.xp_multiplier || 1.0,
        hasActivePlan: true,
        planName: plan.display_name || plan.name
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  return {
    benefits: benefits || {
      collaboratorBadge: null,
      monthlyRadcoins: 0,
      eliminationAids: 3,
      skipAids: 1,
      aiTutorCredits: 2,
      xpMultiplier: 1.0,
      hasActivePlan: false,
      planName: null
    },
    isLoading
  };
}
