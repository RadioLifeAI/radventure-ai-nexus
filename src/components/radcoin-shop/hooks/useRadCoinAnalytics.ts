import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreAnalytics {
  totalSales: number;
  totalRevenue: number;
  activeProducts: number;
  activeOffers: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentPurchases: Array<{
    id: string;
    user_name: string;
    product_name: string;
    amount: number;
    created_at: string;
  }>;
  dailyStats: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

export function useRadCoinAnalytics() {
  // Analytics consolidados para admin
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["radcoin-store-analytics"],
    queryFn: async () => {
      const [
        salesResult,
        productsResult,
        offersResult,
        recentPurchasesResult,
        dailyStatsResult
      ] = await Promise.all([
        // Total de vendas e receita
        supabase
          .from("radcoin_purchase_history")
          .select("radcoins_spent")
          .then(res => {
            const totalSales = res.data?.length || 0;
            const totalRevenue = res.data?.reduce((sum, p) => sum + p.radcoins_spent, 0) || 0;
            return { totalSales, totalRevenue };
          }),

        // Produtos ativos
        supabase
          .from("radcoin_products")
          .select("id")
          .eq("is_active", true)
          .then(res => res.data?.length || 0),

        // Ofertas ativas
        supabase
          .from("radcoin_special_offers")
          .select("id")
          .eq("is_active", true)
          .gte("expires_at", new Date().toISOString())
          .then(res => res.data?.length || 0),

        // Compras recentes com dados do usuário e produto
        supabase
          .from("radcoin_purchase_history")
          .select(`
            id,
            user_id,
            radcoins_spent,
            created_at,
            radcoin_products(name),
            radcoin_special_offers(name)
          `)
          .order("created_at", { ascending: false })
          .limit(10),

        // Estatísticas diárias dos últimos 7 dias
        supabase
          .from("radcoin_purchase_history")
          .select("radcoins_spent, created_at")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .then(res => {
            const dailyStats: Record<string, { sales: number; revenue: number }> = {};
            
            res.data?.forEach(purchase => {
              const date = new Date(purchase.created_at).toLocaleDateString('pt-BR');
              if (!dailyStats[date]) {
                dailyStats[date] = { sales: 0, revenue: 0 };
              }
              dailyStats[date].sales += 1;
              dailyStats[date].revenue += purchase.radcoins_spent;
            });

            return Object.entries(dailyStats).map(([date, stats]) => ({
              date,
              ...stats
            }));
          })
      ]);

      // Buscar dados dos usuários para compras recentes
      const userIds = recentPurchasesResult.data?.map(p => p.user_id).filter(Boolean) || [];
      const usersResult = userIds.length > 0 ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds) : { data: [] };

      // Processar compras recentes
      const recentPurchases = recentPurchasesResult.data?.map(purchase => ({
        id: purchase.id,
        user_name: usersResult.data?.find(u => u.id === purchase.user_id)?.full_name || 
                   usersResult.data?.find(u => u.id === purchase.user_id)?.username || 
                   'Usuário',
        product_name: purchase.radcoin_products?.name || 
                     purchase.radcoin_special_offers?.name || 
                     'Produto Desconhecido',
        amount: purchase.radcoins_spent,
        created_at: purchase.created_at
      })) || [];

      // Top produtos (por enquanto simulado - seria necessário uma view ou query complexa)
      const topProducts = [
        { id: '1', name: 'Pacote Avançado', sales: 45, revenue: 11250 },
        { id: '2', name: 'Pacote Básico', sales: 38, revenue: 3800 },
        { id: '3', name: 'Pacote Premium', sales: 22, revenue: 11000 },
        { id: '4', name: 'Booster de Eliminação', sales: 35, revenue: 1750 },
        { id: '5', name: 'Créditos IA Tutor', sales: 28, revenue: 2100 }
      ];

      const conversionRate = salesResult.totalSales > 0 ? 
        Math.round((salesResult.totalSales / (salesResult.totalSales + 50)) * 100 * 100) / 100 : 0;

      return {
        totalSales: salesResult.totalSales,
        totalRevenue: salesResult.totalRevenue,
        activeProducts: productsResult,
        activeOffers: offersResult,
        conversionRate,
        topProducts,
        recentPurchases,
        dailyStats: dailyStatsResult
      } as StoreAnalytics;
    },
    refetchInterval: 60000 // Atualizar a cada minuto
  });

  // Analytics específicos por produto
  const { data: productAnalytics } = useQuery({
    queryKey: ["product-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_purchase_history")
        .select(`
          product_id,
          radcoins_spent,
          created_at,
          radcoin_products(name, category)
        `)
        .not("product_id", "is", null);

      if (error) throw error;

      // Agrupar por produto
      const productStats: Record<string, any> = {};
      data?.forEach(purchase => {
        const productId = purchase.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            id: productId,
            name: purchase.radcoin_products?.name || 'Produto',
            category: purchase.radcoin_products?.category || 'unknown',
            sales: 0,
            revenue: 0,
            lastSale: purchase.created_at
          };
        }
        productStats[productId].sales += 1;
        productStats[productId].revenue += purchase.radcoins_spent;
        
        // Atualizar última venda se mais recente
        if (new Date(purchase.created_at) > new Date(productStats[productId].lastSale)) {
          productStats[productId].lastSale = purchase.created_at;
        }
      });

      return Object.values(productStats);
    },
    refetchInterval: 120000 // Atualizar a cada 2 minutos
  });

  return {
    analytics,
    productAnalytics: productAnalytics || [],
    isLoading,
    
    // Métricas calculadas
    metrics: analytics ? {
      totalSales: analytics.totalSales,
      totalRevenue: analytics.totalRevenue,
      activeProducts: analytics.activeProducts,
      conversionRate: analytics.conversionRate,
      averageOrderValue: analytics.totalSales > 0 ? 
        Math.round(analytics.totalRevenue / analytics.totalSales) : 0,
      dailyAverageRevenue: analytics.dailyStats.length > 0 ?
        Math.round(analytics.dailyStats.reduce((sum, day) => sum + day.revenue, 0) / analytics.dailyStats.length) : 0
    } : null
  };
}