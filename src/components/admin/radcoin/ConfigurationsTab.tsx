
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Save, 
  AlertCircle, 
  Bell, 
  Shield, 
  Percent,
  Clock,
  Users,
  DollarSign
} from "lucide-react";

export function ConfigurationsTab() {
  const [config, setConfig] = useState({
    // Configurações de Preços
    basePrices: {
      elimination_aid: 10,
      skip_aid: 15,
      ai_tutor_credit: 25
    },
    
    // Limites de Compra
    purchaseLimits: {
      maxPerUser: 10,
      maxPerDay: 5,
      requireApproval: 1000
    },
    
    // Configurações de Desconto
    discountSettings: {
      maxDiscount: 50,
      autoApplyBulk: true,
      seasonalEnabled: true
    },
    
    // Notificações
    notifications: {
      salesAlerts: true,
      lowStockAlerts: true,
      highValuePurchases: true,
      emailNotifications: true
    },
    
    // Moderação
    moderation: {
      autoApproval: true,
      reviewThreshold: 500,
      flagSuspiciousActivity: true
    }
  });

  const handleSave = () => {
    console.log('Salvando configurações:', config);
    // Aqui seria implementada a lógica de salvar no backend
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Loja</h2>
          <p className="text-gray-600">Configure parâmetros globais da loja RadCoin</p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-blue-600">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Preços Base */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Preços Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="elimination-price">Preço por Eliminação (RC)</Label>
              <Input
                id="elimination-price"
                type="number"
                value={config.basePrices.elimination_aid}
                onChange={(e) => setConfig({
                  ...config,
                  basePrices: {
                    ...config.basePrices,
                    elimination_aid: parseInt(e.target.value)
                  }
                })}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="skip-price">Preço por Pular (RC)</Label>
              <Input
                id="skip-price"
                type="number"
                value={config.basePrices.skip_aid}
                onChange={(e) => setConfig({
                  ...config,
                  basePrices: {
                    ...config.basePrices,
                    skip_aid: parseInt(e.target.value)
                  }
                })}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="ai-credit-price">Preço por Crédito IA (RC)</Label>
              <Input
                id="ai-credit-price"
                type="number"
                value={config.basePrices.ai_tutor_credit}
                onChange={(e) => setConfig({
                  ...config,
                  basePrices: {
                    ...config.basePrices,
                    ai_tutor_credit: parseInt(e.target.value)
                  }
                })}
                min="1"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Estes são os preços base usados para calcular o valor dos pacotes automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limites de Compra */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Limites de Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max-per-user">Máximo por Usuário (por semana)</Label>
              <Input
                id="max-per-user"
                type="number"
                value={config.purchaseLimits.maxPerUser}
                onChange={(e) => setConfig({
                  ...config,
                  purchaseLimits: {
                    ...config.purchaseLimits,
                    maxPerUser: parseInt(e.target.value)
                  }
                })}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="max-per-day">Máximo por Dia</Label>
              <Input
                id="max-per-day"
                type="number"
                value={config.purchaseLimits.maxPerDay}
                onChange={(e) => setConfig({
                  ...config,
                  purchaseLimits: {
                    ...config.purchaseLimits,
                    maxPerDay: parseInt(e.target.value)
                  }
                })}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="approval-threshold">Valor para Aprovação Manual (RC)</Label>
              <Input
                id="approval-threshold"
                type="number"
                value={config.purchaseLimits.requireApproval}
                onChange={(e) => setConfig({
                  ...config,
                  purchaseLimits: {
                    ...config.purchaseLimits,
                    requireApproval: parseInt(e.target.value)
                  }
                })}
                min="0"
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ Compras acima do valor definido precisarão de aprovação manual.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Desconto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-orange-600" />
              Sistema de Descontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max-discount">Desconto Máximo (%)</Label>
              <Input
                id="max-discount"
                type="number"
                value={config.discountSettings.maxDiscount}
                onChange={(e) => setConfig({
                  ...config,
                  discountSettings: {
                    ...config.discountSettings,
                    maxDiscount: parseInt(e.target.value)
                  }
                })}
                min="0"
                max="90"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Desconto Automático em Lote</Label>
                <p className="text-sm text-gray-600">Aplicar desconto para compras em quantidade</p>
              </div>
              <Switch
                checked={config.discountSettings.autoApplyBulk}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  discountSettings: {
                    ...config.discountSettings,
                    autoApplyBulk: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Promoções Sazonais</Label>
                <p className="text-sm text-gray-600">Ativar ofertas especiais automáticas</p>
              </div>
              <Switch
                checked={config.discountSettings.seasonalEnabled}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  discountSettings: {
                    ...config.discountSettings,
                    seasonalEnabled: checked
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Vendas</Label>
                <p className="text-sm text-gray-600">Notificar sobre novas vendas</p>
              </div>
              <Switch
                checked={config.notifications.salesAlerts}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notifications: {
                    ...config.notifications,
                    salesAlerts: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Estoque Baixo</Label>
                <p className="text-sm text-gray-600">Notificar quando produtos estão acabando</p>
              </div>
              <Switch
                checked={config.notifications.lowStockAlerts}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notifications: {
                    ...config.notifications,
                    lowStockAlerts: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Compras de Alto Valor</Label>
                <p className="text-sm text-gray-600">Notificar sobre compras importantes</p>
              </div>
              <Switch
                checked={config.notifications.highValuePurchases}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notifications: {
                    ...config.notifications,
                    highValuePurchases: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por Email</Label>
                <p className="text-sm text-gray-600">Enviar notificações por email</p>
              </div>
              <Switch
                checked={config.notifications.emailNotifications}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notifications: {
                    ...config.notifications,
                    emailNotifications: checked
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Moderação */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Sistema de Moderação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-red-800">Aprovação Automática</Label>
              <p className="text-sm text-red-600">Aprovar compras automaticamente abaixo do limite</p>
            </div>
            <Switch
              checked={config.moderation.autoApproval}
              onCheckedChange={(checked) => setConfig({
                ...config,
                moderation: {
                  ...config.moderation,
                  autoApproval: checked
                }
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="review-threshold" className="text-red-800">
              Limite para Revisão Manual (RC)
            </Label>
            <Input
              id="review-threshold"
              type="number"
              value={config.moderation.reviewThreshold}
              onChange={(e) => setConfig({
                ...config,
                moderation: {
                  ...config.moderation,
                  reviewThreshold: parseInt(e.target.value)
                }
              })}
              min="0"
              className="border-red-200 focus:border-red-400"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-red-800">Detectar Atividade Suspeita</Label>
              <p className="text-sm text-red-600">Marcar padrões anômalos de compra</p>
            </div>
            <Switch
              checked={config.moderation.flagSuspiciousActivity}
              onCheckedChange={(checked) => setConfig({
                ...config,
                moderation: {
                  ...config.moderation,
                  flagSuspiciousActivity: checked
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge className="bg-green-500 text-white mb-2">Online</Badge>
              <div className="text-sm text-gray-600">Sistema da Loja</div>
            </div>
            <div className="text-center">
              <Badge className="bg-blue-500 text-white mb-2">Ativo</Badge>
              <div className="text-sm text-gray-600">Processamento de Pagamentos</div>
            </div>
            <div className="text-center">
              <Badge className="bg-purple-500 text-white mb-2">Funcionando</Badge>
              <div className="text-sm text-gray-600">Notificações</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
