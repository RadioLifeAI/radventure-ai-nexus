
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, Zap, Settings, BarChart3, Edit, Trash2, 
  Plus, Activity, TrendingUp, DollarSign, Clock
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { AITutorConfig, AITutorUsageLog } from "@/types/admin";

export function AITutorManagement() {
  const { hasPermission } = useAdminPermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConfig, setSelectedConfig] = useState<AITutorConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Query para buscar configurações do Tutor IA
  const { data: configs, isLoading } = useQuery({
    queryKey: ['ai-tutor-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tutor_config')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AITutorConfig[];
    },
    enabled: hasPermission('AI_TUTOR', 'READ')
  });

  // Query para estatísticas de uso
  const { data: usageStats } = useQuery({
    queryKey: ['ai-tutor-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tutor_usage_logs')
        .select('tokens_used, cost, response_time_ms, quality_rating, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) {
        console.error('Error fetching usage stats:', error);
        return {
          totalRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
          avgQuality: 0
        };
      }
      
      const logs = data as AITutorUsageLog[];
      const totalRequests = logs.length;
      const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const avgResponseTime = totalRequests > 0 ? logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalRequests : 0;
      const avgQuality = totalRequests > 0 ? logs.reduce((sum, log) => sum + (log.quality_rating || 0), 0) / totalRequests : 0;
      
      return {
        totalRequests,
        totalTokens,
        totalCost,
        avgResponseTime,
        avgQuality
      };
    }
  });

  // Mutation para criar/atualizar configuração
  const configMutation = useMutation({
    mutationFn: async (configData: Partial<AITutorConfig>) => {
      if (configData.id) {
        const { data, error } = await supabase
          .from('ai_tutor_config')
          .update({
            config_name: configData.config_name,
            model_name: configData.model_name,
            api_provider: configData.api_provider,
            prompt_template: configData.prompt_template,
            max_tokens: configData.max_tokens,
            temperature: configData.temperature,
            is_active: configData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', configData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('ai_tutor_config')
          .insert({
            config_name: configData.config_name!,
            model_name: configData.model_name!,
            api_provider: configData.api_provider!,
            prompt_template: configData.prompt_template,
            max_tokens: configData.max_tokens!,
            temperature: configData.temperature!,
            is_active: configData.is_active ?? true
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tutor-configs'] });
      toast({
        title: "Configuração salva",
        description: "A configuração do Tutor IA foi salva com sucesso.",
      });
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
      setSelectedConfig(null);
    },
    onError: (error) => {
      console.error('Error saving config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar configuração
  const deleteConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('ai_tutor_config')
        .delete()
        .eq('id', configId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tutor-configs'] });
      toast({
        title: "Configuração excluída",
        description: "A configuração foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting config:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir configuração. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  if (!hasPermission('AI_TUTOR', 'READ')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para gerenciar o Tutor IA.</p>
        </div>
      </div>
    );
  }

  const handleEditConfig = (config: AITutorConfig) => {
    setSelectedConfig(config);
    setIsEditModalOpen(true);
  };

  const ConfigForm = ({ config, onSubmit }: { config?: AITutorConfig, onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      
      const configData = {
        ...config,
        config_name: formData.get('config_name') as string,
        model_name: formData.get('model_name') as string,
        api_provider: formData.get('api_provider') as string,
        prompt_template: formData.get('prompt_template') as string,
        max_tokens: parseInt(formData.get('max_tokens') as string),
        temperature: parseFloat(formData.get('temperature') as string),
        is_active: formData.get('is_active') === 'on',
      };
      
      onSubmit(configData);
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="config_name">Nome da Configuração</Label>
            <Input
              id="config_name"
              name="config_name"
              defaultValue={config?.config_name || ''}
              required
            />
          </div>
          <div>
            <Label htmlFor="model_name">Modelo</Label>
            <Select name="model_name" defaultValue={config?.model_name || 'gpt-4o-mini'}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="api_provider">Provedor da API</Label>
            <Select name="api_provider" defaultValue={config?.api_provider || 'openai'}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={config?.is_active ?? true}
            />
            <Label htmlFor="is_active">Configuração Ativa</Label>
          </div>
        </div>
        
        <div>
          <Label htmlFor="prompt_template">Template do Prompt</Label>
          <Textarea
            id="prompt_template"
            name="prompt_template"
            defaultValue={config?.prompt_template || ''}
            rows={4}
            placeholder="Use {case_data} para inserir dados do caso..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max_tokens">Máximo de Tokens</Label>
            <Input
              id="max_tokens"
              name="max_tokens"
              type="number"
              min="50"
              max="4000"
              defaultValue={config?.max_tokens || 150}
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperatura (0.0 - 2.0)</Label>
            <Input
              id="temperature"
              name="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              defaultValue={config?.temperature || 0.7}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => {
          setIsEditModalOpen(false);
          setIsCreateModalOpen(false);
        }}>
          Cancelar
        </Button>
        <Button type="submit" disabled={configMutation.isPending}>
          {configMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="text-blue-200" />
              Tutor IA Configurável
              <Zap className="text-yellow-300" />
            </h1>
            <p className="text-blue-100 mt-2">Configure e monitore o assistente inteligente</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{usageStats?.totalRequests || 0}</div>
            <div className="text-blue-200">Requests (30 dias)</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="configs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configs">Configurações</TabsTrigger>
          <TabsTrigger value="usage">Monitoramento</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="configs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configurações do Tutor IA</CardTitle>
                  <CardDescription>Gerencie os modelos e prompts do assistente</CardDescription>
                </div>
                {hasPermission('AI_TUTOR', 'CREATE') && (
                  <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Configuração
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Max Tokens</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando configurações...
                      </TableCell>
                    </TableRow>
                  ) : configs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhuma configuração encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    configs?.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.config_name}</TableCell>
                        <TableCell>{config.model_name}</TableCell>
                        <TableCell>{config.api_provider}</TableCell>
                        <TableCell>{config.max_tokens}</TableCell>
                        <TableCell>{config.temperature}</TableCell>
                        <TableCell>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('AI_TUTOR', 'UPDATE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditConfig(config)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission('AI_TUTOR', 'DELETE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteConfigMutation.mutate(config.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Requests</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{usageStats?.totalRequests || 0}</div>
                <p className="text-xs text-gray-600">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tokens Consumidos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {usageStats?.totalTokens?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-600">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {(usageStats?.totalCost || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(usageStats?.avgResponseTime || 0)}ms
                </div>
                <p className="text-xs text-gray-600">Resposta média</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas Detalhadas
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real do desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Gráficos Avançados</h3>
                <p>Métricas detalhadas de uso e performance serão exibidas aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Templates de Prompts
              </CardTitle>
              <CardDescription>
                Templates pré-configurados para diferentes cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Biblioteca de Templates</h3>
                <p>Templates para hints, explicações e feedback serão organizados aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Configuração</DialogTitle>
            <DialogDescription>
              Faça alterações na configuração do Tutor IA.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConfig && (
            <ConfigForm 
              config={selectedConfig} 
              onSubmit={(data) => configMutation.mutate(data)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova Configuração</DialogTitle>
            <DialogDescription>
              Crie uma nova configuração para o Tutor IA.
            </DialogDescription>
          </DialogHeader>
          
          <ConfigForm onSubmit={(data) => configMutation.mutate(data)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
