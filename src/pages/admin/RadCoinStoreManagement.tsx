
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Package, 
  Flame, 
  BarChart3, 
  Settings,
  TrendingUp,
  Users,
  ShoppingCart,
  Star
} from "lucide-react";
import { ProductsManagementTab } from "@/components/admin/radcoin/ProductsManagementTab";
import { SpecialOffersAdminTab } from "@/components/admin/radcoin/SpecialOffersAdminTab";
import { AnalyticsTab } from "@/components/admin/radcoin/AnalyticsTab";
import { ConfigurationsTab } from "@/components/admin/radcoin/ConfigurationsTab";
import { useRadCoinAnalytics } from "@/components/radcoin-shop/hooks/useRadCoinAnalytics";

export default function RadCoinStoreManagement() {
  const [activeTab, setActiveTab] = useState("products");
  const { analytics, isLoading } = useRadCoinAnalytics();

  // Usar dados reais ou fallback
  const metrics = {
    totalSales: analytics?.totalSales || 0,
    totalRevenue: analytics?.totalRevenue || 0,
    activeProducts: analytics?.activeProducts || 0,
    conversionRate: analytics?.conversionRate || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Coins className="h-6 w-6 text-white" />
            </div>
            Gestão da Loja RadCoin
          </h1>
          <p className="text-gray-600 mt-1">
            Controle total sobre produtos, preços e promoções da loja virtual
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
          Sistema Ativo
        </Badge>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {metrics.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Receita Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {metrics.totalRevenue.toLocaleString()} RC
            </div>
            <p className="text-xs text-green-600">
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Produtos Ativos
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {metrics.activeProducts}
            </div>
            <p className="text-xs text-purple-600">
              3 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Taxa de Conversão
            </CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {metrics.conversionRate}%
            </div>
            <p className="text-xs text-orange-600">
              +2.3% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="offers" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Ofertas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="products" className="space-y-6">
                <ProductsManagementTab />
              </TabsContent>

              <TabsContent value="offers" className="space-y-6">
                <SpecialOffersAdminTab />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <ConfigurationsTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
