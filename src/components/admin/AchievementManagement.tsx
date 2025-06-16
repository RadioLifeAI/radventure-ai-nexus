
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
  Trophy, Medal, Star, Edit, Trash2, Plus, 
  Users, Award, Crown, Target
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
        .order('rarity', { ascending: false });
      
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
        .select('is_completed, achievement_id');
      
      if (error) {
        console.error('Error fetching achievement stats:', error);
        return {
          totalAchievements: 0,
          completedAchievements: 0,
          completionRate: 0,
          activeUsers: 0
        };
      }
      
      const totalProgress = data.length;
      const completedProgress = data.filter(prog => prog.is_completed).length;
      const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
      
      return {
        totalAchievements: achievements?.length || 0,
        completedAchievements: completedProgress,
        completionRate,
        activeUsers: new Set(data.map(prog => prog.achievement_id)).size
      };
    },
    enabled: !!achievements
  });

  // Mutation para criar/atualizar conquista
  const achievementMutation = useMutation({
    mutationFn: async (achievementData: Partial<Achievement>) => {
      if (achievementData.id) {
        const { data, error } = await supabase
          .from('achievement_system')
          .update({
            code: achievementData.code,
            name: achievementData.name,
            description: achievementData.description,
            icon_url: achievementData.icon_url,
            rarity: achievementData.rarity,
            points_required: achievementData.points_required,
            conditions: achievementData.conditions,
            rewards: achievementData.rewards,
            is_active: achievementData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', achievementData.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('achievement_system')
          .insert({
            code: achievementData.code!,
            name: achievementData.name!,
            description: achievementData.description,
            icon_url: achievementData.icon_url,
            rarity: achievementData.rarity || 'common',
            points_required: achievementData.points_required,
            conditions: achievementData.conditions || {},
            rewards: achievementData.rewards || {},
            is_active: achievementData.is_active ?? true
          })
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
      setSelectedAchievement(null);
    },
    onError: (error) => {
      console.error('Error saving achievement:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conquista. Tente novamente.",
        variant: "destructive"
      });
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
    },
    onError: (error) => {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conquista. Tente novamente.",
        variant: "destructive"
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'common': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
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
        icon_url: formData.get('icon_url') as string,
        rarity: formData.get('rarity') as string,
        points_required: parseInt(formData.get('points_required') as string) || undefined,
        is_active: formData.get('is_active') === 'on',
        conditions: {},
        rewards: {}
      };
      
      onSubmit(achievementData);
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Código da Conquista</Label>
            <Input
              id="code"
              name="code"
              defaultValue={achievement?.code || ''}
              required
              placeholder="first_case"
            />
          </div>
          <div>
            <Label htmlFor="name">Nome da Conquista</Label>
            <Input
              id="name"
              name="name"
              defaultValue={achievement?.name || ''}
              required
              placeholder="Primeiro Caso"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={achievement?.description || ''}
            rows={3}
            placeholder="Descrição da conquista..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
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
              min="0"
              defaultValue={achievement?.points_required || ''}
              placeholder="100"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icon_url">URL do Ícone</Label>
            <Input
              id="icon_url"
              name="icon_url"
              defaultValue={achievement?.icon_url || ''}
              placeholder="https://example.com/icon.png"
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={achievement?.is_active ?? true}
            />
            <Label htmlFor="is_active">Conquista Ativa</Label>
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
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-300" />
              Sistema de Conquistas
              <Medal className="text-yellow-200" />
            </h1>
            <p className="text-amber-100 mt-2">Gerencie conquistas e recompensas gamificadas</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{achievements?.length || 0}</div>
            <div className="text-amber-200">Conquistas Ativas</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conquistas do Sistema</CardTitle>
                  <CardDescription>Gerencie todas as conquistas disponíveis na plataforma</CardDescription>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando conquistas...
                      </TableCell>
                    </TableRow>
                  ) : achievements?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhuma conquista encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    achievements?.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell className="font-medium">{achievement.name}</TableCell>
                        <TableCell className="font-mono text-sm">{achievement.code}</TableCell>
                        <TableCell className="max-w-xs truncate">{achievement.description}</TableCell>
                        <TableCell>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </TableCell>
                        <TableCell>{achievement.points_required || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={achievement.is_active ? "default" : "secondary"}>
                            {achievement.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('CONTENT', 'UPDATE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAchievement(achievement)}
                              >
                                <Edit className="h-4 w-4" />
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Conquistas</CardTitle>
                <Trophy className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{achievementStats?.totalAchievements || 0}</div>
                <p className="text-xs text-gray-600">Conquistas criadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conquistas Completadas</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{achievementStats?.completedAchievements || 0}</div>
                <p className="text-xs text-gray-600">Total de completadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {(achievementStats?.completionRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">Média de conclusão</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{achievementStats?.activeUsers || 0}</div>
                <p className="text-xs text-gray-600">Com progresso ativo</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics de Conquistas</CardTitle>
              <CardDescription>
                Análise detalhada do engajamento com o sistema de conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Crown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Analytics Avançados</h3>
                <p>Gráficos de engajamento e progresso serão exibidos aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progresso dos Usuários</CardTitle>
              <CardDescription>
                Monitore o progresso individual dos usuários nas conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Progresso dos Usuários</h3>
                <p>Interface de monitoramento de progresso será implementada aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Conquista</DialogTitle>
            <DialogDescription>
              Crie uma nova conquista para o sistema.
            </DialogDescription>
          </DialogHeader>
          
          <AchievementForm onSubmit={(data) => achievementMutation.mutate(data)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
