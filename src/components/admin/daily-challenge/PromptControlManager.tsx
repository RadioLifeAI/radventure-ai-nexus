
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Save, X, Brain, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PromptControl {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  modality: string;
  prompt_template: string;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  created_at: string;
}

interface ReferenceData {
  specialties: Array<{ id: number; name: string }>;
  difficulties: Array<{ id: number; description: string; level: number }>;
  modalities: Array<{ id: number; name: string }>;
}

export function PromptControlManager() {
  const [prompts, setPrompts] = useState<PromptControl[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    specialties: [],
    difficulties: [],
    modalities: []
  });
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<PromptControl | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const defaultPromptTemplate = `Crie uma pergunta de verdadeiro/falso sobre {category} com nível de dificuldade {difficulty} relacionada a {modality}.

A pergunta deve ser:
- Clara e objetiva para estudantes de medicina
- Clinicamente relevante e educativa
- Apropriada para o nível {difficulty}
- Focada em conceitos importantes de {category}

Use terminologia médica adequada ao nível de dificuldade especificado.`;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      console.log('🔄 Carregando todos os dados...');
      
      // Carregar dados de referência em paralelo
      const [specialtiesRes, difficultiesRes, modalitiesRes, promptsRes] = await Promise.all([
        supabase.from('medical_specialties').select('id, name').order('name'),
        supabase.from('difficulties').select('id, description, level').order('level'),
        supabase.from('imaging_modalities').select('id, name').order('name'),
        supabase.from('quiz_prompt_controls').select('*').order('created_at', { ascending: false })
      ]);

      // Verificar erros
      if (specialtiesRes.error) throw specialtiesRes.error;
      if (difficultiesRes.error) throw difficultiesRes.error;
      if (modalitiesRes.error) throw modalitiesRes.error;
      if (promptsRes.error) throw promptsRes.error;

      console.log('📊 Dados carregados:', {
        specialties: specialtiesRes.data?.length || 0,
        difficulties: difficultiesRes.data?.length || 0,
        modalities: modalitiesRes.data?.length || 0,
        prompts: promptsRes.data?.length || 0
      });

      setReferenceData({
        specialties: specialtiesRes.data || [],
        difficulties: difficultiesRes.data || [],
        modalities: modalitiesRes.data || []
      });

      setPrompts(promptsRes.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de referência',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (promptData: Omit<PromptControl, 'id' | 'created_at' | 'usage_count' | 'success_rate'>) => {
    try {
      console.log('💾 Salvando prompt:', promptData);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      if (editingPrompt) {
        // Atualizar prompt existente
        const { error } = await supabase
          .from('quiz_prompt_controls')
          .update({
            name: promptData.name,
            category: promptData.category,
            difficulty: promptData.difficulty,
            modality: promptData.modality,
            prompt_template: promptData.prompt_template,
            is_active: promptData.is_active,
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Prompt atualizado com sucesso' });
      } else {
        // Criar novo prompt
        const { error } = await supabase
          .from('quiz_prompt_controls')
          .insert({
            ...promptData,
            created_by: user.user.id,
          });

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Prompt criado com sucesso' });
      }

      setEditingPrompt(null);
      setIsCreateModalOpen(false);
      loadAllData(); // Recarregar todos os dados
    } catch (error) {
      console.error('❌ Erro ao salvar prompt:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o prompt',
        variant: 'destructive',
      });
    }
  };

  const deletePrompt = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    try {
      const { error } = await supabase
        .from('quiz_prompt_controls')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Prompt excluído com sucesso' });
      loadAllData();
    } catch (error) {
      console.error('❌ Erro ao excluir prompt:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o prompt',
        variant: 'destructive',
      });
    }
  };

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz_prompt_controls')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      loadAllData();
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive',
      });
    }
  };

  const PromptForm = ({ 
    prompt, 
    onSave, 
    onCancel 
  }: { 
    prompt?: PromptControl; 
    onSave: (data: any) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: prompt?.name || '',
      category: prompt?.category || '',
      difficulty: prompt?.difficulty || '',
      modality: prompt?.modality || '',
      prompt_template: prompt?.prompt_template || defaultPromptTemplate,
      is_active: prompt?.is_active ?? true,
    });

    const updatePromptTemplate = () => {
      if (formData.category && formData.difficulty && formData.modality) {
        const newTemplate = defaultPromptTemplate
          .replace(/{category}/g, formData.category)
          .replace(/{difficulty}/g, formData.difficulty)
          .replace(/{modality}/g, formData.modality);
        setFormData({ ...formData, prompt_template: newTemplate });
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Prompt</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Cardiologia Básica - Radiografia"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Especialidade</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => {
                setFormData({ ...formData, category: value });
                if (!formData.name) {
                  setFormData(prev => ({ ...prev, name: `${value} - ${prev.difficulty} - ${prev.modality}` }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione especialidade" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => {
                setFormData({ ...formData, difficulty: value });
                if (!formData.name) {
                  setFormData(prev => ({ ...prev, name: `${prev.category} - ${value} - ${prev.modality}` }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.difficulties.map((diff) => (
                  <SelectItem key={diff.id} value={diff.description || `Nível ${diff.level}`}>
                    {diff.description || `Nível ${diff.level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modality">Modalidade</Label>
            <Select 
              value={formData.modality} 
              onValueChange={(value) => {
                setFormData({ ...formData, modality: value });
                if (!formData.name) {
                  setFormData(prev => ({ ...prev, name: `${prev.category} - ${prev.difficulty} - ${value}` }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione modalidade" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.modalities.map((modality) => (
                  <SelectItem key={modality.id} value={modality.name}>
                    {modality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="prompt_template">Template do Prompt</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={updatePromptTemplate}
              disabled={!formData.category || !formData.difficulty || !formData.modality}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar Template
            </Button>
          </div>
          <Textarea
            id="prompt_template"
            value={formData.prompt_template}
            onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
            rows={12}
            placeholder="Template do prompt para IA..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Use {'{category}'}, {'{difficulty}'}, {'{modality}'} como variáveis no template
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Prompt ativo</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Carregando prompts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Prompts Configurados</h3>
          <p className="text-sm text-gray-600">
            {prompts.length} prompts • {prompts.filter(p => p.is_active).length} ativos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Prompt</DialogTitle>
              </DialogHeader>
              <PromptForm
                onSave={(data) => savePrompt(data)}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{prompt.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{prompt.category}</Badge>
                    <Badge variant="outline">{prompt.difficulty}</Badge>
                    <Badge variant="outline">{prompt.modality}</Badge>
                    {prompt.is_active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={prompt.is_active}
                    onCheckedChange={(checked) => toggleActiveStatus(prompt.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPrompt(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePrompt(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>Usos: {prompt.usage_count}</span>
                  <span>Taxa de sucesso: {prompt.success_rate.toFixed(1)}%</span>
                </div>
                <p className="line-clamp-3 bg-gray-50 p-2 rounded text-xs">
                  {prompt.prompt_template}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Prompt</DialogTitle>
            </DialogHeader>
            <PromptForm
              prompt={editingPrompt}
              onSave={(data) => savePrompt(data)}
              onCancel={() => setEditingPrompt(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {prompts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum prompt configurado</h3>
          <p className="text-sm mb-4">Crie seu primeiro prompt para começar a gerar questões.</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Prompt
          </Button>
        </div>
      )}
    </div>
  );
}
