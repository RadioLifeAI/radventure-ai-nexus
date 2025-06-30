
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bot, 
  Wand2, 
  Calendar, 
  Map, 
  MessageSquare, 
  Save, 
  Plus,
  Settings,
  Activity,
  BarChart3
} from "lucide-react";

interface AIPromptConfig {
  id: string;
  config_name: string;
  ai_function_type: string;
  prompt_category: string;
  api_provider: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  is_default: boolean;
  prompt_template: string;
  usage_stats: any;
  optimization_data: any;
  created_at: string;
  updated_at: string;
}

// Tipo específico para upsert que garante config_name obrigatório
interface AIPromptConfigUpsert {
  id?: string;
  config_name: string;
  ai_function_type: string;
  prompt_category: string;
  api_provider: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  is_default: boolean;
  prompt_template: string;
}

const AI_FUNCTION_TYPES = {
  'ai_tutor': { name: 'AI Tutor', icon: Bot, color: 'bg-blue-500' },
  'radbot_chat': { name: 'RadBot Chat', icon: MessageSquare, color: 'bg-purple-500' },
  'case_autofill': { name: 'Case Autofill', icon: Wand2, color: 'bg-green-500' },
  'event_ai_suggestions': { name: 'Event AI', icon: Calendar, color: 'bg-orange-500' },
  'journey_ai_suggestions': { name: 'Journey AI', icon: Map, color: 'bg-pink-500' }
};

export function AIPromptManager() {
  const [selectedType, setSelectedType] = useState<string>('ai_tutor');
  const [editingConfig, setEditingConfig] = useState<AIPromptConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["ai-prompt-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tutor_config")
        .select("*")
        .order("ai_function_type", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIPromptConfig[];
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (config: AIPromptConfigUpsert) => {
      const { data, error } = await supabase
        .from("ai_tutor_config")
        .upsert(config)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-prompt-configs"] });
      toast.success("Configuração salva com sucesso!");
      setShowEditor(false);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const handleSaveConfig = (formData: FormData) => {
    const configName = formData.get('config_name') as string;
    
    if (!configName || configName.trim() === '') {
      toast.error("Nome da configuração é obrigatório");
      return;
    }

    const config: AIPromptConfigUpsert = {
      id: editingConfig?.id,
      config_name: configName,
      ai_function_type: formData.get('ai_function_type') as string,
      prompt_category: formData.get('prompt_category') as string,
      api_provider: formData.get('api_provider') as string,
      model_name: formData.get('model_name') as string,
      max_tokens: parseInt(formData.get('max_tokens') as string),
      temperature: parseFloat(formData.get('temperature') as string),
      is_active: formData.get('is_active') === 'true',
      is_default: formData.get('is_default') === 'true',
      prompt_template: formData.get('prompt_template') as string,
    };

    saveConfigMutation.mutate(config);
  };

  const filteredConfigs = configs.filter(config => 
    selectedType === 'all' || config.ai_function_type === selectedType
  );

  const getStatsForType = (type: string) => {
    const typeConfigs = configs.filter(c => c.ai_function_type === type);
    const totalCalls = typeConfigs.reduce((sum, c) => 
      sum + (c.usage_stats?.total_calls || 0), 0
    );
    const totalCost = typeConfigs.reduce((sum, c) => 
      sum + (c.usage_stats?.total_cost || 0), 0
    );
    const avgSuccessRate = typeConfigs.length > 0 
      ? typeConfigs.reduce((sum, c) => sum + (c.usage_stats?.success_rate || 0), 0) / typeConfigs.length
      : 0;

    return { totalCalls, totalCost, avgSuccessRate };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Todas
          </TabsTrigger>
          {Object.entries(AI_FUNCTION_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            const stats = getStatsForType(key);
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.name}
                {stats.totalCalls > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stats.totalCalls}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Painel de Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(AI_FUNCTION_TYPES).map(([key, config]) => {
            const stats = getStatsForType(key);
            const Icon = config.icon;
            
            if (selectedType !== 'all' && selectedType !== key) return null;
            
            return (
              <Card key={key} className="border-l-4" style={{ borderLeftColor: config.color.replace('bg-', '#') }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4" />
                    {config.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Chamadas:</span>
                      <span className="font-mono">{stats.totalCalls}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Sucesso:</span>
                      <span className="font-mono">{stats.avgSuccessRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Custo:</span>
                      <span className="font-mono">R$ {stats.totalCost.toFixed(4)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de Configurações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Prompts
              </CardTitle>
              <CardDescription>
                Gerencie os prompts de todas as funções de IA do sistema
              </CardDescription>
            </div>
            <Button onClick={() => {
              setEditingConfig(null);
              setShowEditor(true);
            }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Configuração
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConfigs.map((config) => {
                const functionType = AI_FUNCTION_TYPES[config.ai_function_type as keyof typeof AI_FUNCTION_TYPES];
                const Icon = functionType?.icon || Settings;
                
                return (
                  <div key={config.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${functionType?.color || 'bg-gray-500'} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{config.config_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{functionType?.name || config.ai_function_type}</span>
                            <span>•</span>
                            <span>{config.model_name}</span>
                            <span>•</span>
                            <Badge variant={config.is_active ? "default" : "secondary"}>
                              {config.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            {config.is_default && (
                              <Badge variant="outline">Padrão</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600">
                          <div>Chamadas: {config.usage_stats?.total_calls || 0}</div>
                          <div>Custo: R$ {(config.usage_stats?.total_cost || 0).toFixed(4)}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(config);
                            setShowEditor(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveConfig(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="config_name">Nome da Configuração</Label>
                    <Input
                      id="config_name"
                      name="config_name"
                      defaultValue={editingConfig?.config_name || ''}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai_function_type">Tipo de Função IA</Label>
                    <Select name="ai_function_type" defaultValue={editingConfig?.ai_function_type || 'ai_tutor'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AI_FUNCTION_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="model_name">Modelo</Label>
                    <Select name="model_name" defaultValue={editingConfig?.model_name || 'gpt-4o-mini'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_tokens">Max Tokens</Label>
                    <Input
                      id="max_tokens"
                      name="max_tokens"
                      type="number"
                      defaultValue={editingConfig?.max_tokens || 150}
                      min="50"
                      max="4000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      defaultValue={editingConfig?.temperature || 0.7}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prompt_category">Categoria</Label>
                    <Input
                      id="prompt_category"
                      name="prompt_category"
                      defaultValue={editingConfig?.prompt_category || 'general'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api_provider">Provider</Label>
                    <Select name="api_provider" defaultValue={editingConfig?.api_provider || 'openai'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        value="true"
                        defaultChecked={editingConfig?.is_active !== false}
                      />
                      <Label htmlFor="is_active">Ativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        name="is_default"
                        value="true"
                        defaultChecked={editingConfig?.is_default}
                      />
                      <Label htmlFor="is_default">Padrão</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="prompt_template">Template do Prompt</Label>
                  <Textarea
                    id="prompt_template"
                    name="prompt_template"
                    className="min-h-[300px] font-mono text-sm"
                    defaultValue={editingConfig?.prompt_template || ''}
                    placeholder="Digite o template do prompt aqui..."
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditor(false);
                      setEditingConfig(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveConfigMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
