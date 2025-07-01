import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StoreConfiguration {
  storeEnabled: boolean;
  dailyDealsEnabled: boolean;
  maxPurchasesPerDay: number;
  featuredProducts: string[];
  storeAnnouncement: {
    title: string;
    message: string;
  };
  discountThresholds: {
    bronze: number;
    silver: number;
    gold: number;
  };
  giftEnabled: boolean;
}

export function useStoreConfig() {
  const queryClient = useQueryClient();

  // Hook para buscar configurações
  const { data: config, isLoading } = useQuery({
    queryKey: ["store-configuration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_store_config")
        .select("*");

      if (error) throw error;

      // Converter array em objeto estruturado
      const configObj: Record<string, any> = {};
      data.forEach(item => {
        configObj[item.key] = item.value;
      });

      return {
        storeEnabled: configObj.store_enabled === 'true',
        dailyDealsEnabled: configObj.daily_deals_enabled === 'true',
        maxPurchasesPerDay: parseInt(configObj.max_purchases_per_day || '10'),
        featuredProducts: configObj.featured_products || [],
        storeAnnouncement: configObj.store_announcement || {
          title: "Bem-vindo à Loja RadCoin!",
          message: "Troque seus RadCoins por ajudas e benefícios exclusivos!"
        },
        discountThresholds: configObj.discount_thresholds || {
          bronze: 1000,
          silver: 5000,
          gold: 10000
        },
        giftEnabled: configObj.gift_enabled === 'true'
      } as StoreConfiguration;
    }
  });

  // Mutation para atualizar configurações
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<StoreConfiguration>) => {
      const updates = [];

      // Converter configurações para formato de banco
      if (newConfig.storeEnabled !== undefined) {
        updates.push({
          key: 'store_enabled',
          value: newConfig.storeEnabled.toString()
        });
      }

      if (newConfig.dailyDealsEnabled !== undefined) {
        updates.push({
          key: 'daily_deals_enabled',
          value: newConfig.dailyDealsEnabled.toString()
        });
      }

      if (newConfig.maxPurchasesPerDay !== undefined) {
        updates.push({
          key: 'max_purchases_per_day',
          value: newConfig.maxPurchasesPerDay.toString()
        });
      }

      if (newConfig.featuredProducts !== undefined) {
        updates.push({
          key: 'featured_products',
          value: newConfig.featuredProducts
        });
      }

      if (newConfig.storeAnnouncement !== undefined) {
        updates.push({
          key: 'store_announcement',
          value: newConfig.storeAnnouncement
        });
      }

      if (newConfig.discountThresholds !== undefined) {
        updates.push({
          key: 'discount_thresholds',
          value: newConfig.discountThresholds
        });
      }

      if (newConfig.giftEnabled !== undefined) {
        updates.push({
          key: 'gift_enabled',
          value: newConfig.giftEnabled.toString()
        });
      }

      // Buscar usuário atual
      const { data: user } = await supabase.auth.getUser();
      
      // Executar updates em paralelo
      const promises = updates.map(update =>
        supabase
          .from("radcoin_store_config")
          .upsert({
            key: update.key,
            value: update.value,
            updated_at: new Date().toISOString(),
            updated_by: user.user?.id
          })
      );

      const results = await Promise.all(promises);
      
      // Verificar se algum update falhou
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Erro ao atualizar configurações: ${errors[0].error?.message}`);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-configuration"] });
      queryClient.invalidateQueries({ queryKey: ["store-config"] }); // Para compatibilidade
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    }
  });

  // Função para resetar configurações para padrão
  const resetToDefaults = () => {
    const defaultConfig: StoreConfiguration = {
      storeEnabled: true,
      dailyDealsEnabled: true,
      maxPurchasesPerDay: 10,
      featuredProducts: [],
      storeAnnouncement: {
        title: "Bem-vindo à Loja RadCoin!",
        message: "Troque seus RadCoins por ajudas e benefícios exclusivos!"
      },
      discountThresholds: {
        bronze: 1000,
        silver: 5000,
        gold: 10000
      },
      giftEnabled: false
    };

    updateConfigMutation.mutate(defaultConfig);
  };

  return {
    config: config || {
      storeEnabled: true,
      dailyDealsEnabled: true,
      maxPurchasesPerDay: 10,
      featuredProducts: [],
      storeAnnouncement: {
        title: "Bem-vindo à Loja RadCoin!",
        message: "Troque seus RadCoins por ajudas e benefícios exclusivos!"
      },
      discountThresholds: {
        bronze: 1000,
        silver: 5000,
        gold: 10000
      },
      giftEnabled: false
    },
    isLoading,
    updateConfig: updateConfigMutation.mutate,
    resetToDefaults,
    isUpdating: updateConfigMutation.isPending
  };
}