
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
  Trophy, Star, Medal, Award, Edit, Trash2, 
  Plus, Crown, Target, Gift, Zap
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { Achievement } from "@/types/admin";

export function AchievementManagement() {
  const { hasPermission } = useAdminPermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Query para buscar conquistas
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_system')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: hasPermission('CONTENT', 'READ')
  });

  // Query para estatísticas de conquistas
  const { data: achievementStats } = useQuery({
    queryKey: ['achievement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements_progress')
        .select('achievement_id, is_completed')
        .eq('is_completed', true);
      
      if (error) throw error;
      
      const completionsByAchievement = data.reduce((acc, progress) => {
        acc[progress.achievement_id] = (acc[progress.achievement_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return { completionsByAchievement, totalCompletions: data.length };
    }
  });

  // Mutation para criar/atualizar conquista
  const achievementMutation = useMutation({
    mutationFn: async (achievementData: Partial<Achievement>) => {
      if (achievementData.id) {
        const { data, error } = await supabase
          .from('achievement_system')
          .update(achievementData)
          .eq('id', achievementData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('achievement_system')
          .insert(achievementData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast({
        title: "Conquista salva",
        description: "A conquista foi salva com sucesso.",
      });
      setIsEditModalOpen(false);
      setIsCreateModalOpen(false);
    }
  });

  // Mutation para deletar conquista
  const deleteAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const { error } = await supabase
        .from('achievement_system')
        .delete()
        .eq('id', achievementId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast({
        title: "Conquista excluída",
        description: "A conquista foi excluída com sucesso.",
      });
    }
  });

  if (!hasPermission('CONTENT', 'READ')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para gerenciar conquistas.</p>
        </div>
      </div>
    );
  }

  const handleEditAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsEditModalOpen(true);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'epic': return <Medal className="h-4 w-4 text-purple-500" />;
      case 'rare': return <Star className="h-4 w-4 text-blue-500" />;
      case 'uncommon': return <Award className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 bg-yellow-50';
      case 'epic': return 'border-purple-500 bg-purple-50';
      case 'rare': return 'border-blue-500 bg-blue-50';
      case 'uncommon': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const AchievementForm = ({ achievement, onSubmit }: { achievement?: Achievement, onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      
      const achievementData = {
        ...achievement,
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        rarity: formData.get('rarity') as string,
        points_required: parseInt(formData.get('points_required') as string) || null,
        icon_url: formData.get('icon_url') as string || null,
        is_active: formData.get('is_active') === 'on',
        conditions: {
          type: formData.get('condition_type') as string,
          value: parseInt(formData.get('condition_value') as string) || 0,
        },
        rewards: {
          radcoins: parseInt(formData.get('reward_radcoins') as string) || 0,
          points: parseInt(formData.get('reward_points') as string) || 0,
        }
      };
      
      onSubmit(achievementData);
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Código Único</Label>
            <Input
              id="code"
              name="code"
              defaultValue={achievement?.code || ''}
              placeholder="ex: first_case_solved"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Nome da Conquista</Label>
            <Input
              id="name"
              name="name"
              defaultValue={achievement?.name || ''}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={achievement?.description || ''}
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rarity">Raridade</Label>
            <Select name="rarity" defaultValue={achievement?.rarity || 'common'}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="uncommon">Incomum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="points_required">Pontos Necessários</Label>
            <Input
              id="points_required"
              name="points_required"
              type="number"
              defaultValue={achievement?.points_required || ''}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={achievement?.is_active ?? true}
            />
            <Label htmlFor="is_active">Ativa</Label>
          </div>
        </div>
        
        <div>
          <Label htmlFor="icon_url">URL do Ícone</Label>
          <Input
            id="icon_url"
            name="icon_url"
            defaultValue={achievement?.icon_url || ''}
            placeholder="https://..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="condition_type">Tipo de Condição</Label>
            <Select name="condition_type" defaultValue={achievement?.conditions?.type || 'cases_solved'}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de condição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cases_solved">Casos Resolvidos</SelectItem>
                <SelectItem value="streak">Sequência de Acertos</SelectItem>
                <SelectItem value="points_earned">Pontos Ganhos</SelectItem>
                <SelectItem value="events_won">Eventos Vencidos</SelectItem>
                <SelectItem value="login_days">Dias de Login</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition_value">Valor da Condição</Label>
            <Input
              id="condition_value"
              name="condition_value"
              type="number"
              defaultValue={achievement?.conditions?.value || 0}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reward_radcoins">Recompensa (RadCoins)</Label>
            <Input
              id="reward_radcoins"
              name="reward_radcoins"
              type="number"
              defaultValue={achievement?.rewards?.radcoins || 0}
            />
          </div>
          <div>
            <Label htmlFor="reward_points">Recompensa (Pontos)</Label>
            <Input
              id="reward_points"
              name="reward_points"
              type="number"
              defaultValue={achievement?.rewards?.points || 0}
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
        <Button type="submit" disabled={achievementMutation.isPending}>
          {achievementMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-200" />
              Sistema de Conquistas
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-yellow-100 mt-2">Gerencie conquistas e recompensas</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{achievements?.length || 0}</div>
            <div className="text-yellow-200">Conquistas Criadas</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conquistas do Sistema</CardTitle>
                  <CardDescription>Gerencie as conquistas disponíveis na plataforma</CardDescription>
                </div>
                {hasPermission('CONTENT', 'CREATE') && (
                  <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conquista
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements?.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`relative border-2 ${getRarityColor(achievement.rarity)} ${!achievement.is_active ? 'opacity-60' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRarityIcon(achievement.rarity)}
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        </div>
                        <Badge variant={achievement.is_active ? "default" : "secondary"}>
                          {achievement.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Raridade:</span> {achievement.rarity}
                        </div>
                        {achievement.points_required && (
                          <div className="text-sm">
                            <span className="font-medium">Pontos:</span> {achievement.points_required}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">Conquistas:</span> {achievementStats?.completionsByAchievement[achievement.id] || 0}
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          {hasPermission('CONTENT', 'UPDATE') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAchievement(achievement)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                          {hasPermission('CONTENT', 'DELETE') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progresso dos Usuários
              </CardTitle>
              <CardDescription>
                Monitore o progresso das conquistas pelos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Analytics de Progresso</h3>
                <p>Relatórios detalhados do progresso dos usuários serão exibidos aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Sistema de Recompensas
              </CardTitle>
              <CardDescription>
                Configure recompensas e marketplace RadCoins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Marketplace de Recompensas</h3>
                <p>Sistema de troca de RadCoins por benefícios será implementado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Conquista</DialogTitle>
            <DialogDescription>
              Faça alterações na conquista.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAchievement && (
            <AchievementForm 
              achievement={selectedAchievement} 
              onSubmit={(data) => achievementMutation.mutate(data)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova Conquista</DialogTitle>
            <DialogDescription>
              Crie uma nova conquista para a plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <AchievementForm onSubmit={(data) => achievementMutation.mutate(data)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
