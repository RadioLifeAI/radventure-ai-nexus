
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
import { Plus, Edit, Trash2, Save, X, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUnifiedFormDataSource } from '@/hooks/useUnifiedFormDataSource';

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

export function PromptControlManager() {
  const [prompts, setPrompts] = useState<PromptControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<PromptControl | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Usar dados das tabelas reais do banco
  const { specialties, modalities, difficulties, isLoading: dataLoading } = useUnifiedFormDataSource();

  const defaultPromptTemplate = `Crie uma pergunta de verdadeiro/falso sobre {category} com nível de dificuldade {difficulty} relacionada a {modality}.

A pergunta deve:
- Ser clara e objetiva
- Ter relevância clínica prática
- Ser apropriada para estudantes de medicina
- Incluir conceitos importantes da especialidade

Categoria: {category}
Dificuldade: {difficulty} 
Modalidade: {modality}`;

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_prompt_controls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (promptData: Omit<PromptControl, 'id' | 'created_at' | 'usage_count' | 'success_rate'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      if (editingPrompt) {
        // Atualizar
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
        // Criar
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
      loadPrompts();
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
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
      loadPrompts();
    } catch (error) {
      console.error('Erro ao excluir prompt:', error);
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
      loadPrompts();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
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

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Prompt</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Prompt Cardiologia Básica"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Especialidade</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.id} value={diff.description || `Nível ${diff.level}`}>
                    {diff.description || `Nível ${diff.level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modality">Modalidade</Label>
            <Select value={formData.modality} onValueChange={(value) => setFormData({ ...formData, modality: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalities.map((modality) => (
                  <SelectItem key={modality.id} value={modality.name}>
                    {modality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="prompt_template">Template do Prompt</Label>
          <Textarea
            id="prompt_template"
            value={formData.prompt_template}
            onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
            rows={8}
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

  if (loading || dataLoading) {
    return <div className="flex justify-center p-8">Carregando prompts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prompts Configurados</h3>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                <p className="line-clamp-2">{prompt.prompt_template}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent className="max-w-2xl">
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
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum prompt configurado ainda.</p>
          <p className="text-sm">Crie seu primeiro prompt para começar a gerar questões.</p>
        </div>
      )}
    </div>
  );
}
