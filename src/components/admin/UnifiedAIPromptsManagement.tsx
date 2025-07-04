import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  BarChart3, 
  Activity, 
  Zap, 
  Eye,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AIPromptConfig {
  id: string;
  ai_function_type: string;
  config_name: string;
  prompt_template: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  is_default: boolean;
  prompt_category: string;
  usage_stats: any;
  created_at: string;
  updated_at: string;
}

const AI_FUNCTION_TYPES = [
  { value: 'ai_tutor', label: 'Tutor IA (Dicas)', icon: '🧠' },
  { value: 'case_autofill', label: 'Auto-preenchimento de Casos', icon: '📝' },
  { value: 'daily_challenge', label: 'Desafios Diários', icon: '🎯' },
  { value: 'event_suggestions', label: 'Sugestões de Eventos', icon: '📅' },
  { value: 'journey_suggestions', label: 'Sugestões de Jornadas', icon: '🛤️' },
  { value: 'radbot_chat', label: 'RadBot Chat', icon: '🤖' },
];

const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido)', cost: '$' },
  { value: 'gpt-4o', label: 'GPT-4o (Avançado)', cost: '$$$' },
  { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Premium)', cost: '$$$$' },
];

export function UnifiedAIPromptsManagement() {
  const [configs, setConfigs] = useState<AIPromptConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string>('all');
  const [editingConfig, setEditingConfig] = useState<AIPromptConfig | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tutor_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações de IA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = selectedFunction === 'all' 
    ? configs 
    : configs.filter(c => c.ai_function_type === selectedFunction);

  const getStatusColor = (config: AIPromptConfig) => {
    if (!config.is_active) return 'bg-gray-500';
    if (config.is_default) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusText = (config: AIPromptConfig) => {
    if (!config.is_active) return 'Inativo';
    if (config.is_default) return 'Padrão';
    return 'Ativo';
  };

  const ConfigCard = ({ config }: { config: AIPromptConfig }) => {
    const functionType = AI_FUNCTION_TYPES.find(f => f.value === config.ai_function_type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{functionType?.icon || '🤖'}</span>
              <div>
                <CardTitle className="text-lg">{config.config_name}</CardTitle>
                <CardDescription className="text-sm">
                  {functionType?.label} • {config.model_name}
                </CardDescription>
              </div>
            </div>
            <Badge 
              className={`${getStatusColor(config)} text-white`}
            >
              {getStatusText(config)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Uso:</span>
              <span className="font-medium">{config.usage_stats?.total_calls || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Taxa:</span>
              <span className="font-medium">{((config.usage_stats?.success_rate || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Tempo:</span>
              <span className="font-medium">{config.usage_stats?.avg_response_time || 0}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Custo:</span>
              <span className="font-medium">${(config.usage_stats?.total_cost || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Parâmetros */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>Temp: {config.temperature}</div>
            <div>Tokens: {config.max_tokens}</div>
          </div>

          {/* Prompt Preview */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
            <p className="text-sm line-clamp-2">{config.prompt_template}</p>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingConfig(config)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(config.prompt_template);
                toast({ title: 'Copiado!', description: 'Prompt copiado para a área de transferência' });
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
            <Button
              size="sm"
              variant="ghost"
            >
              <Eye className="h-3 w-3 mr-1" />
              Testar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema Unificado de Prompts IA</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os prompts e configurações de IA da plataforma em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prompt
          </Button>
          <Button variant="outline" onClick={loadConfigs}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Prompts</CardTitle>
            <div className="text-2xl font-bold">{configs.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prompts Ativos</CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {configs.filter(c => c.is_active).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funções Configuradas</CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(configs.map(c => c.ai_function_type)).size}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Total (Est.)</CardTitle>
            <div className="text-2xl font-bold text-purple-600">
              ${configs.reduce((acc, c) => acc + (c.usage_stats?.total_cost || 0), 0).toFixed(2)}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Select value={selectedFunction} onValueChange={setSelectedFunction}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🔍 Todas as Funções</SelectItem>
            {AI_FUNCTION_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Configurações */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredConfigs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum prompt encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {selectedFunction === 'all' 
                ? 'Não há prompts configurados ainda.'
                : `Não há prompts para a função "${AI_FUNCTION_TYPES.find(f => f.value === selectedFunction)?.label}".`
              }
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConfigs.map(config => (
            <ConfigCard key={config.id} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}