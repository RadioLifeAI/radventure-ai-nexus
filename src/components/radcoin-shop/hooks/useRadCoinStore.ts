import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RadCoinProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
    bonus_points_multiplier?: number;
  };
  is_active: boolean;
  is_popular: boolean;
  discount_percentage: number;
  sort_order: number;
  max_purchase_per_user?: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface RadCoinSpecialOffer {
  id: string;
  name: string;
  description: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
    bonus_points_multiplier?: number;
  };
  is_active: boolean;
  is_limited: boolean;
  max_redemptions?: number;
  current_redemptions: number;
  starts_at: string;
  expires_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  timeLeft?: string;
  limited?: boolean;
}

export interface StoreConfig {
  key: string;
  value: any;
  description: string;
  is_public: boolean;
  updated_at: string;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  product_id?: string;
  special_offer_id?: string;
  purchase_type: string;
  radcoins_spent: number;
  benefits_received: any;
  transaction_id?: string;
  metadata: any;
  created_at: string;
}

export function useRadCoinStore() {
  const queryClient = useQueryClient();

  // Hook para produtos
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["radcoin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as RadCoinProduct[];
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Hook para ofertas especiais
  const { data: specialOffers = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: ["radcoin-special-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_special_offers")
        .select("*")
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calcular tempo restante para cada oferta
      return (data as RadCoinSpecialOffer[]).map(offer => {
        const now = new Date();
        const expiresAt = new Date(offer.expires_at || now);
        const timeDiff = expiresAt.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          let timeLeft = "";
          if (days > 0) timeLeft += `${days}d `;
          if (hours > 0) timeLeft += `${hours}h `;
          if (minutes > 0) timeLeft += `${minutes}m`;
          
          return {
            ...offer,
            timeLeft: timeLeft.trim(),
            limited: offer.is_limited
          };
        }
        
        return { ...offer, timeLeft: "Expirado", limited: offer.is_limited };
      });
    },
    refetchInterval: 60000 // Atualizar a cada minuto para tempo restante
  });

  // Hook para configurações da loja
  const { data: storeConfig = {} } = useQuery({
    queryKey: ["store-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_store_config")
        .select("*")
        .eq("is_public", true);

      if (error) throw error;

      // Converter array em objeto para facilitar acesso
      const configObj: Record<string, any> = {};
      data.forEach((config: StoreConfig) => {
        configObj[config.key] = config.value;
      });

      return configObj;
    }
  });

  // Hook para histórico de compras do usuário
  const { data: purchaseHistory = [] } = useQuery({
    queryKey: ["user-purchase-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_purchase_history")
        .select(`
          *,
          radcoin_products(name, category),
          radcoin_special_offers(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PurchaseHistory[];
    },
    refetchInterval: 30000
  });

  // Mutation para compra de produto
  const purchaseProductMutation = useMutation({
    mutationFn: async ({ productId, specialOfferId }: { productId?: string; specialOfferId?: string }) => {
      const { data, error } = await supabase.rpc("purchase_radcoin_product", {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_product_id: productId || null,
        p_special_offer_id: specialOfferId || null
      });

      if (error) throw error;
      return data as any;
    },
    onSuccess: (result: any) => {
      if (result?.success) {
        toast.success(`Compra realizada! -${result.radcoins_spent} RadCoins`);
        
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ["radcoin-products"] });
        queryClient.invalidateQueries({ queryKey: ["radcoin-special-offers"] });
        queryClient.invalidateQueries({ queryKey: ["user-purchase-history"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-help-aids"] });
      } else {
        toast.error(result?.error || "Erro na compra");
      }
    },
    onError: (error: any) => {
      toast.error(`Erro na compra: ${error.message}`);
    }
  });

  // Função para comprar produto
  const purchaseProduct = (productId: string) => {
    purchaseProductMutation.mutate({ productId });
  };

  // Função para comprar oferta especial
  const purchaseSpecialOffer = (specialOfferId: string) => {
    purchaseProductMutation.mutate({ specialOfferId });
  };

  // Função genérica de compra (compatibilidade com hook anterior)
  const purchaseItem = (itemId: string, isSpecialOffer = false) => {
    if (isSpecialOffer) {
      purchaseSpecialOffer(itemId);
    } else {
      purchaseProduct(itemId);
    }
  };

  return {
    // Dados
    products,
    specialOffers,
    storeConfig,
    purchaseHistory,
    
    // Estados de loading
    isLoadingProducts,
    isLoadingOffers,
    isPurchasing: purchaseProductMutation.isPending,
    
    // Funções
    purchaseProduct,
    purchaseSpecialOffer,
    purchaseItem, // Para compatibilidade
    
    // Dados processados para compatibilidade
    helpPackages: products.filter(p => p.category === 'help_package'),
    
    // Configurações específicas
    isStoreEnabled: storeConfig.store_enabled === 'true',
    storeAnnouncement: storeConfig.store_announcement,
    dailyDealsEnabled: storeConfig.daily_deals_enabled === 'true'
  };
}

// Re-export tipos para compatibilidade
export type { RadCoinProduct as HelpPackage, RadCoinSpecialOffer as SpecialOffer };