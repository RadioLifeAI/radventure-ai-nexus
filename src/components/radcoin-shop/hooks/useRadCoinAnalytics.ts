
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
      // Buscar dados reais do histórico de compras
      const { data: purchaseHistory, error: purchaseError } = await supabase
        .from("radcoin_purchase_history")
        .select(`
          *,
          radcoin_products(name),
          radcoin_special_offers(name)
        `)
        .order("created_at", { ascending: false });

      if (purchaseError) throw purchaseError;

      // Buscar produtos ativos
      const { data: products, error: productsError } = await supabase
        .from("radcoin_products")
        .select("*")
        .eq("is_active", true);

      if (productsError) throw productsError;

      // Calcular métricas
      const totalSales = purchaseHistory?.length || 0;
      const totalRevenue = purchaseHistory?.reduce((sum, purchase) => sum + purchase.radcoins_spent, 0) || 0;
      const activeProducts = products?.length || 0;
      const conversionRate = totalSales > 0 ? Math.round((totalSales / (totalSales + 100)) * 100) : 0;

      // Top produtos mais vendidos
      const productSales = new Map();
      purchaseHistory?.forEach(purchase => {
        if (purchase.radcoin_products) {
          const productName = purchase.radcoin_products.name;
          const existing = productSales.get(productName) || { sales: 0, revenue: 0 };
          productSales.set(productName, {
            name: productName,
            sales: existing.sales + 1,
            revenue: existing.revenue + purchase.radcoins_spent
          });
        }
        if (purchase.radcoin_special_offers) {
          const offerName = purchase.radcoin_special_offers.name;
          const existing = productSales.get(offerName) || { sales: 0, revenue: 0 };
          productSales.set(offerName, {
            name: offerName,
            sales: existing.sales + 1,
            revenue: existing.revenue + purchase.radcoins_spent
          });
        }
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Stats diárias (últimos 30 dias)
      const dailyStats = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySales = purchaseHistory?.filter(p => 
          p.created_at.startsWith(dateStr)
        ) || [];
        
        dailyStats.push({
          date: dateStr,
          sales: daySales.length,
          revenue: daySales.reduce((sum, p) => sum + p.radcoins_spent, 0)
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
    }
  });

  // Métricas básicas para compatibilidade
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
