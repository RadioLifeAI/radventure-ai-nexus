
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  activeProducts: number;
  conversionRate: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

export function useRadCoinAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["radcoin-analytics"],
    queryFn: async () => {
      // DADOS REAIS DO SUPABASE - ZERO MOCK
      
      // Buscar histórico de compras real
      const { data: purchaseHistory, error: purchaseError } = await supabase
        .from("radcoin_purchase_history")
        .select(`
          *,
          radcoin_products!inner(name),
          radcoin_special_offers(name)
        `);

      if (purchaseError) throw purchaseError;

      // Buscar produtos ativos reais
      const { data: products, error: productsError } = await supabase
        .from("radcoin_products")
        .select("*")
        .eq("is_active", true);

      if (productsError) throw productsError;

      // Buscar ofertas ativas reais
      const { data: offers, error: offersError } = await supabase
        .from("radcoin_special_offers")
        .select("*")
        .eq("is_active", true);

      if (offersError) throw offersError;

      // CÁLCULOS BASEADOS EM DADOS REAIS
      const totalSales = purchaseHistory?.length || 0;
      const totalRevenue = purchaseHistory?.reduce((sum, purchase) => 
        sum + (purchase.radcoins_spent || 0), 0) || 0;
      const activeProducts = (products?.length || 0) + (offers?.length || 0);
      
      // Taxa de conversão real baseada em usuários vs compras
      const { data: totalUsers } = await supabase
        .from("profiles")
        .select("id", { count: 'exact', head: true });
      
      const totalUserCount = totalUsers?.length || 1;
      const conversionRate = totalSales > 0 ? Math.round((totalSales / totalUserCount) * 100) : 0;

      // Top produtos REAIS mais vendidos
      const productSales = new Map();
      
      purchaseHistory?.forEach(purchase => {
        let productName = 'Produto Desconhecido';
        
        if (purchase.radcoin_products?.name) {
          productName = purchase.radcoin_products.name;
        } else if (purchase.radcoin_special_offers?.name) {
          productName = purchase.radcoin_special_offers.name;
        } else if (purchase.purchase_type === 'product' && purchase.product_id) {
          productName = `Produto ${purchase.product_id.slice(0, 8)}`;
        } else if (purchase.purchase_type === 'special_offer' && purchase.special_offer_id) {
          productName = `Oferta ${purchase.special_offer_id.slice(0, 8)}`;
        }

        const existing = productSales.get(productName) || { sales: 0, revenue: 0 };
        productSales.set(productName, {
          name: productName,
          sales: existing.sales + 1,
          revenue: existing.revenue + (purchase.radcoins_spent || 0)
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Stats diárias REAIS (últimos 30 dias)
      const dailyStats = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySales = purchaseHistory?.filter(p => 
          p.created_at && p.created_at.startsWith(dateStr)
        ) || [];
        
        dailyStats.push({
          date: dateStr,
          sales: daySales.length,
          revenue: daySales.reduce((sum, p) => sum + (p.radcoins_spent || 0), 0)
        });
      }

      return {
        totalSales,
        totalRevenue,
        activeProducts,
        conversionRate,
        topProducts,
        dailyStats
      } as AnalyticsData;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Métricas calculadas baseadas em dados reais
  const metrics = {
    totalSales: analytics?.totalSales || 0,
    totalRevenue: analytics?.totalRevenue || 0,
    activeProducts: analytics?.activeProducts || 0,
    conversionRate: analytics?.conversionRate || 0,
    averageOrderValue: analytics && analytics.totalSales > 0 
      ? Math.round(analytics.totalRevenue / analytics.totalSales) 
      : 0
  };

  return {
    analytics,
    metrics,
    isLoading
  };
}
