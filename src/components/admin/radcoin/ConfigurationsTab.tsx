
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save, 
  RefreshCw,
  Store,
  Bell,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Crown
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreConfig {
  key: string;
  value: any;
  description: string;
  is_public: boolean;
}

export function ConfigurationsTab() {
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<Record<string, any>>({
    store_enabled: true,
    store_announcement: '',
    daily_deals_enabled: true,
    min_purchase_amount: 10,
    max_purchase_amount: 10000,
    default_discount_percentage: 0,
    featured_products_limit: 6,
    notifications_enabled: true,
    maintenance_mode: false,
    auto_approve_purchases: true,
    subscriptions_enabled: true
  });

  // Buscar configurações atuais
  const { data: storeConfigs = [], isLoading } = useQuery({
    queryKey: ["store-configs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radcoin_store_config")
        .select("*")
        .order("key");

      if (error) throw error;
      return data as StoreConfig[];
    }
  });

  // Mutation para salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: { key: string; value: any; description: string; is_public: boolean }) => {
      const { data, error } = await supabase
        .from("radcoin_store_config")
        .upsert({
          key: configData.key,
          value: configData.value,
          description: configData.description,
          is_public: configData.is_public,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-configs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["store-config"] });
      toast.success("✅ Configuração salva e aplicada na loja!");
    },
    onError: (error: any) => {
      toast.error(`❌ Erro ao salvar configuração: ${error.message}`);
    }
  });

  // Carregar configurações quando dados chegam
  useEffect(() => {
    if (storeConfigs.length > 0) {
      const configObj: Record<string, any> = {};
      storeConfigs.forEach((config: StoreConfig) => {
        configObj[config.key] = config.value;
      });
      setConfigs(prev => ({ ...prev, ...configObj }));
    }
  }, [storeConfigs]);

  const handleSaveConfig = (key: string, value: any, description: string, isPublic: boolean = false) => {
    saveConfigMutation.mutate({
      key,
      value,
      description,
      is_public: isPublic
    });
  };

  const handleSaveAllConfigs = () => {
    const configsToSave = [
      { key: 'store_enabled', value: configs.store_enabled, description: 'Habilitar/desabilitar loja RadCoin', is_public: true },
      { key: 'store_announcement', value: configs.store_announcement, description: 'Anúncio da loja', is_public: true },
      { key: 'daily_deals_enabled', value: configs.daily_deals_enabled, description: 'Habilitar ofertas diárias', is_public: true },
      { key: 'min_purchase_amount', value: configs.min_purchase_amount, description: 'Valor mínimo de compra', is_public: false },
      { key: 'max_purchase_amount', value: configs.max_purchase_amount, description: 'Valor máximo de compra', is_public: false },
      { key: 'default_discount_percentage', value: configs.default_discount_percentage, description: 'Desconto padrão (%)', is_public: false },
      { key: 'featured_products_limit', value: configs.featured_products_limit, description: 'Limite de produtos em destaque', is_public: false },
      { key: 'notifications_enabled', value: configs.notifications_enabled, description: 'Habilitar notificações', is_public: false },
      { key: 'maintenance_mode', value: configs.maintenance_mode, description: 'Modo manutenção', is_public: true },
      { key: 'auto_approve_purchases', value: configs.auto_approve_purchases, description: 'Aprovar compras automaticamente', is_public: false },
      { key: 'subscriptions_enabled', value: configs.subscriptions_enabled, description: 'Habilitar sistema de assinaturas', is_public: true }
    ];

    // Salvar todas as configurações
    configsToSave.forEach(config => {
      saveConfigMutation.mutate(config);
    });

    toast.success("🎯 Todas as configurações foram aplicadas na loja!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Loja</h2>
          <p className="text-gray-600">Gerencie configurações globais da loja RadCoin - Alterações refletem imediatamente na loja</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["store-configs-admin"] })}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button 
            onClick={handleSaveAllConfigs}
            className="bg-gradient-to-r from-green-600 to-blue-600"
            disabled={saveConfigMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveConfigMutation.isPending ? 'Aplicando...' : 'Aplicar Tudo'}
          </Button>
        </div>
      </div>

      {/* ALERTA DE SINCRONIZAÇÃO */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-800">🔄 Sincronização Ativa</h4>
              <p className="text-sm text-blue-700 mt-1">
                Todas as alterações feitas aqui são aplicadas <strong>imediatamente na loja do usuário</strong>. 
                O modo manutenção, anúncios e configurações de assinaturas funcionam em tempo real.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da Loja */}
      <Card className={`border-2 ${configs.store_enabled ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Status da Loja
            {configs.store_enabled ? (
              <Badge className="bg-green-500 text-white">Ativa</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Inativa</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="store_enabled">Loja Habilitada</Label>
              <p className="text-sm text-gray-600">Controla se a loja está disponível para os usuários</p>
            </div>
            <Switch
              id="store_enabled"
              checked={configs.store_enabled}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, store_enabled: checked }));
                handleSaveConfig('store_enabled', checked, 'Habilitar/desabilitar loja RadCoin', true);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance_mode">Modo Manutenção</Label>
              <p className="text-sm text-gray-600">Exibe mensagem de manutenção na loja (funciona imediatamente)</p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={configs.maintenance_mode}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, maintenance_mode: checked }));
                handleSaveConfig('maintenance_mode', checked, 'Modo manutenção', true);
              }}
            />
          </div>

          <div>
            <Label htmlFor="store_announcement">Anúncio da Loja</Label>
            <Textarea
              id="store_announcement"
              value={configs.store_announcement}
              onChange={(e) => setConfigs(prev => ({ ...prev, store_announcement: e.target.value }))}
              onBlur={() => handleSaveConfig('store_announcement', configs.store_announcement, 'Anúncio da loja', true)}
              placeholder="Digite um anúncio para exibir na loja... (aparecer imediatamente)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Assinaturas Educacionais */}
      <Card className={`border-2 ${configs.subscriptions_enabled ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Sistema de Assinaturas Educacionais
            {configs.subscriptions_enabled ? (
              <Badge className="bg-purple-500 text-white">Ativo</Badge>
            ) : (
              <Badge className="bg-gray-500 text-white">Inativo</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="subscriptions_enabled">Assinaturas Habilitadas</Label>
              <p className="text-sm text-gray-600">Permite que usuários vejam e assinem planos educacionais (RadSupport)</p>
            </div>
            <Switch
              id="subscriptions_enabled"
              checked={configs.subscriptions_enabled}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, subscriptions_enabled: checked }));
                handleSaveConfig('subscriptions_enabled', checked, 'Habilitar sistema de assinaturas', true);
              }}
            />
          </div>
          
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800">Sistema Educacional RadSupport</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Quando desabilitado, a aba "Premium" fica oculta na loja RadCoin. 
                  Os planos educacionais RadSupport (Bronze/Prata/Ouro) ficam indisponíveis para assinatura.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configurações de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_purchase">Valor Mínimo de Compra (RC)</Label>
              <Input
                id="min_purchase"
                type="number"
                value={configs.min_purchase_amount}
                onChange={(e) => setConfigs(prev => ({ ...prev, min_purchase_amount: parseInt(e.target.value) }))}
                onBlur={() => handleSaveConfig('min_purchase_amount', configs.min_purchase_amount, 'Valor mínimo de compra', false)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="max_purchase">Valor Máximo de Compra (RC)</Label>
              <Input
                id="max_purchase"
                type="number"
                value={configs.max_purchase_amount}
                onChange={(e) => setConfigs(prev => ({ ...prev, max_purchase_amount: parseInt(e.target.value) }))}
                onBlur={() => handleSaveConfig('max_purchase_amount', configs.max_purchase_amount, 'Valor máximo de compra', false)}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_discount">Desconto Padrão (%)</Label>
              <Input
                id="default_discount"
                type="number"
                value={configs.default_discount_percentage}
                onChange={(e) => setConfigs(prev => ({ ...prev, default_discount_percentage: parseInt(e.target.value) }))}
                onBlur={() => handleSaveConfig('default_discount_percentage', configs.default_discount_percentage, 'Desconto padrão (%)', false)}
                min="0"
                max="90"
              />
            </div>
            <div>
              <Label htmlFor="featured_limit">Limite de Produtos em Destaque</Label>
              <Input
                id="featured_limit"
                type="number"
                value={configs.featured_products_limit}
                onChange={(e) => setConfigs(prev => ({ ...prev, featured_products_limit: parseInt(e.target.value) }))}
                onBlur={() => handleSaveConfig('featured_products_limit', configs.featured_products_limit, 'Limite de produtos em destaque', false)}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="daily_deals">Ofertas Diárias Habilitadas</Label>
              <p className="text-sm text-gray-600">Permite criar e exibir ofertas diárias especiais</p>
            </div>
            <Switch
              id="daily_deals"
              checked={configs.daily_deals_enabled}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, daily_deals_enabled: checked }));
                handleSaveConfig('daily_deals_enabled', checked, 'Habilitar ofertas diárias', true);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Notificações Habilitadas</Label>
              <p className="text-sm text-gray-600">Enviar notificações de compras e ofertas</p>
            </div>
            <Switch
              id="notifications"
              checked={configs.notifications_enabled}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, notifications_enabled: checked }));
                handleSaveConfig('notifications_enabled', checked, 'Habilitar notificações', false);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_approve">Aprovar Compras Automaticamente</Label>
              <p className="text-sm text-gray-600">Processar compras sem aprovação manual</p>
            </div>
            <Switch
              id="auto_approve"
              checked={configs.auto_approve_purchases}
              onCheckedChange={(checked) => {
                setConfigs(prev => ({ ...prev, auto_approve_purchases: checked }));
                handleSaveConfig('auto_approve_purchases', checked, 'Aprovar compras automaticamente', false);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status das Configurações */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            Status das Configurações - TEMPO REAL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">✅ Configurações Ativas</h4>
              <div className="space-y-2 text-sm">
                {configs.store_enabled && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Loja habilitada ✅</span>
                  </div>
                )}
                {configs.subscriptions_enabled && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Assinaturas educacionais ativas ✅</span>
                  </div>
                )}
                {configs.daily_deals_enabled && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Ofertas diárias ativas ✅</span>
                  </div>
                )}
                {configs.notifications_enabled && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Notificações habilitadas ✅</span>
                  </div>
                )}
                {configs.auto_approve_purchases && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Aprovação automática ativa ✅</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-800">⚠️ Configurações de Alerta</h4>
              <div className="space-y-2 text-sm">
                {configs.maintenance_mode && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>🔧 Modo manutenção ATIVO - Loja indisponível</span>
                  </div>
                )}
                {!configs.store_enabled && (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>🚫 Loja desabilitada - Usuários não conseguem acessar</span>
                  </div>
                )}
                {!configs.subscriptions_enabled && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>⏸ Assinaturas desabilitadas - Aba Premium oculta</span>
                  </div>
                )}
                {configs.min_purchase_amount > 100 && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>💰 Valor mínimo alto ({configs.min_purchase_amount} RC)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
