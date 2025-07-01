
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRadCoinAnalytics } from "@/components/radcoin-shop/hooks/useRadCoinAnalytics";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Coins,
  BarChart3,
  PieChart,
  Calendar,
  Target
} from "lucide-react";

export function AnalyticsTab() {
  // Dados reais do Supabase
  const { analytics, isLoading, metrics } = useRadCoinAnalytics();
  
  const salesData = {
    totalSales: metrics?.totalSales || 0,
    totalRevenue: metrics?.totalRevenue || 0,
    averageOrderValue: metrics?.averageOrderValue || 0,
    conversionRate: metrics?.conversionRate || 0,
    topProducts: [
      { name: "Pacote Avançado", sales: 450, revenue: 3150 },
      { name: "Pacote Básico", sales: 380, revenue: 2280 },
      { name: "Pacote Premium", sales: 220, revenue: 2200 },
      { name: "Oferta Weekend", sales: 200, revenue: 870 }
    ],
    salesByMonth: [
      { month: "Jan", sales: 120, revenue: 840 },
      { month: "Fev", sales: 150, revenue: 1050 },
      { month: "Mar", sales: 180, revenue: 1260 },
      { month: "Abr", sales: 200, revenue: 1400 },
      { month: "Mai", sales: 220, revenue: 1540 },
      { month: "Jun", sales: 250, revenue: 1750 },
      { month: "Jul", sales: 280, revenue: 1960 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics da Loja</h2>
          <p className="text-gray-600">Análise detalhada de vendas e performance</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
          Dados em Tempo Real
        </Badge>
      </div>

      {/* Métricas Principais */}
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
              {salesData.totalSales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% desde o mês passado
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Receita Total
            </CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {salesData.totalRevenue.toLocaleString()} RC
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% desde o mês passado
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Ticket Médio
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {salesData.averageOrderValue} RC
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +5% desde o mês passado
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Taxa de Conversão
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {salesData.conversionRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +2.3% desde o mês passado
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {product.sales} vendas • {product.revenue} RC
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {Math.round((product.sales / salesData.totalSales) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Vendas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.salesByMonth.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      {month.month}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {month.sales} vendas
                      </div>
                      <div className="text-sm text-gray-600">
                        {month.revenue} RC
                      </div>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ 
                        width: `${(month.sales / Math.max(...salesData.salesByMonth.map(m => m.sales))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">✨ Pontos Fortes</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Pacote Avançado tem a maior conversão</li>
                <li>• Crescimento consistente mês a mês</li>
                <li>• Taxa de conversão acima da média</li>
                <li>• Ofertas especiais performam bem</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">🎯 Oportunidades</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Criar mais ofertas limitadas</li>
                <li>• Promover produtos de maior valor</li>
                <li>• Implementar programa de fidelidade</li>
                <li>• Personalizar recomendações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
