
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Settings, 
  Zap, 
  Award, 
  TrendingUp, 
  Clock, 
  Target,
  RefreshCw,
  Save,
  AlertTriangle
} from "lucide-react";

interface RewardConfig {
  level_up_base: number;
  daily_login_base: number;
  achievement_multiplier: number;
  weekend_bonus: boolean;
  inflation_control: boolean;
  max_daily_per_user: number;
  event_bonus_active: boolean;
  streak_multiplier: number;
}

export function RewardConfigurationTab() {
  const [config, setConfig] = useState<RewardConfig>({
    level_up_base: 50,
    daily_login_base: 5,
    achievement_multiplier: 1.0,
    weekend_bonus: false,
    inflation_control: true,
    max_daily_per_user: 200,
    event_bonus_active: false,
    streak_multiplier: 1.2
  });

  const queryClient = useQueryClient();

  // Carregar configurações atuais
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ["reward-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", "reward_config")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.value) {
        setConfig(data.value as RewardConfig);
        return data.value as RewardConfig;
      }
      
      return config;
    }
  });

  // Salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: RewardConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "reward_config",
          value: newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-config"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const resetToDefaults = () => {
    const defaultConfig: RewardConfig = {
      level_up_base: 50,
      daily_login_base: 5,
      achievement_multiplier: 1.0,
      weekend_bonus: false,
      inflation_control: true,
      max_daily_per_user: 200,
      event_bonus_active: false,
      streak_multiplier: 1.2
    };
    setConfig(defaultConfig);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações de Recompensas</h2>
          <p className="text-gray-600">Configure os valores base e multiplicadores do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Padrões
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valores Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Valores Base de Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-yellow-500" />
                RadCoins por Level Up
              </Label>
              <Input
                type="number"
                value={config.level_up_base}
                onChange={(e) => setConfig({
                  ...config,
                  level_up_base: parseInt(e.target.value) || 0
                })}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Quantidade base de RadCoins ganha ao subir de nível
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                RadCoins por Login Diário
              </Label>
              <Input
                type="number"
                value={config.daily_login_base}
                onChange={(e) => setConfig({
                  ...config,
                  daily_login_base: parseInt(e.target.value) || 0
                })}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Recompensa diária por fazer login
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Limite Diário por Usuário
              </Label>
              <Input
                type="number"
                value={config.max_daily_per_user}
                onChange={(e) => setConfig({
                  ...config,
                  max_daily_per_user: parseInt(e.target.value) || 0
                })}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Máximo de RadCoins que um usuário pode ganhar por dia
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplicadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Multiplicadores e Bônus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">
                Multiplicador de Conquistas: {config.achievement_multiplier}x
              </Label>
              <Slider
                value={[config.achievement_multiplier]}
                onValueChange={(value) => setConfig({
                  ...config,
                  achievement_multiplier: value[0]
                })}
                max={3}
                min={0.5}
                step={0.1}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Multiplica as recompensas de conquistas desbloqueadas
              </p>
            </div>

            <div>
              <Label className="mb-3 block">
                Multiplicador de Streak: {config.streak_multiplier}x
              </Label>
              <Slider
                value={[config.streak_multiplier]}
                onValueChange={(value) => setConfig({
                  ...config,
                  streak_multiplier: value[0]
                })}
                max={2}
                min={1}
                step={0.1}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Multiplica recompensas quando o usuário tem streak ativo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Especiais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Configurações Especiais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Bônus de Final de Semana</div>
                    <div className="text-sm text-gray-600">Dobra recompensas sáb/dom</div>
                  </div>
                </div>
                <Switch
                  checked={config.weekend_bonus}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    weekend_bonus: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Controle de Inflação</div>
                    <div className="text-sm text-gray-600">Limite automático de distribuição</div>
                  </div>
                </div>
                <Switch
                  checked={config.inflation_control}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    inflation_control: checked
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Evento Bônus Ativo</div>
                    <div className="text-sm text-gray-600">+50% em todas as recompensas</div>
                  </div>
                </div>
                <Switch
                  checked={config.event_bonus_active}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    event_bonus_active: checked
                  })}
                />
              </div>

              {config.event_bonus_active && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <Badge className="bg-purple-500 text-white mb-2">
                    Evento Ativo
                  </Badge>
                  <p className="text-sm text-purple-800">
                    Todas as recompensas estão com bônus de 50%. 
                    Desative quando o evento terminar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Impacto */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {config.level_up_base * (config.event_bonus_active ? 1.5 : 1)} RC
              </div>
              <div className="text-sm text-gray-600">Level Up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {config.daily_login_base * (config.weekend_bonus ? 2 : 1) * (config.event_bonus_active ? 1.5 : 1)} RC
              </div>
              <div className="text-sm text-gray-600">Login Diário</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {config.achievement_multiplier}x
              </div>
              <div className="text-sm text-gray-600">Mult. Conquistas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {config.max_daily_per_user} RC
              </div>
              <div className="text-sm text-gray-600">Limite Diário</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
