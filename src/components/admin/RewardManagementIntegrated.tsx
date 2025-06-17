
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Trophy, Plus, Edit, Trash2, Star, Crown, Users, TrendingUp } from "lucide-react";

export function RewardManagementIntegrated() {
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    rarity: "common",
    points_required: 0,
    rewards: {},
    conditions: {},
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading, refetch } = useQuery({
    queryKey: ["achievement-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievement_system")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  // Usando user_achievements_progress que ainda existe após a limpeza
  const { data: userAchievements = [] } = useQuery({
    queryKey: ["user-achievement-stats"],
    queryFn: async () => {
      const { data: userAchievements, error } = await supabase
        .from("user_achievements_progress")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const achievementIds = [...new Set(userAchievements.map(a => a.achievement_id))];
      const userIds = [...new Set(userAchievements.map(a => a.user_id))];

      const [{ data: achievementDetails }, { data: userProfiles }] = await Promise.all([
        supabase.from("achievement_system").select("*").in("id", achievementIds),
        supabase.from("profiles").select("id, full_name, username").in("id", userIds)
      ]);

      return userAchievements.map(achievement => ({
        ...achievement,
        achievement_system: achievementDetails?.find(a => a.id === achievement.achievement_id),
        profiles: userProfiles?.find(p => p.id === achievement.user_id)
      }));
    },
    refetchInterval: 30000
  });

  const { data: achievementStats } = useQuery({
    queryKey: ["achievement-statistics"],
    queryFn: async () => {
      const { data: allAchievements, error: achievementsError } = await supabase
        .from("achievement_system")
        .select("id, rarity");

      if (achievementsError) throw achievementsError;

      const { data: progressRecords, error: progressError } = await supabase
        .from("user_achievements_progress")
        .select("achievement_id, user_id, is_completed");

      if (progressError) throw progressError;

      const totalAchievements = allAchievements?.length || 0;
      const completedAchievements = progressRecords?.filter(p => p.is_completed).length || 0;
      const uniqueUsers = new Set(progressRecords?.map(a => a.user_id)).size;

      const rarityStats = allAchievements?.reduce((acc: any, ach) => {
        acc[ach.rarity] = (acc[ach.rarity] || 0) + 1;
        return acc;
      }, {}) || {};

      const completedByRarity = allAchievements?.reduce((acc: any, ach) => {
        const completed = progressRecords?.filter(p => p.achievement_id === ach.id && p.is_completed).length || 0;
        acc[ach.rarity] = (acc[ach.rarity] || 0) + completed;
        return acc;
      }, {}) || {};

      return {
        totalAchievements,
        completedAchievements,
        uniqueUsers,
        rarityStats,
        completedByRarity
      };
    },
    refetchInterval: 30000
  });

  const saveRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      if (rewardData.id) {
        const { error } = await supabase
          .from("achievement_system")
          .update(rewardData)
          .eq("id", rewardData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("achievement_system")
          .insert([rewardData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievement-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-statistics"] });
      toast.success("Recompensa salva com sucesso!");
      setShowRewardForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar recompensa: ${error.message}`);
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase
        .from("achievement_system")
        .delete()
        .eq("id", rewardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievement-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-statistics"] });
      toast.success("Recompensa deletada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar recompensa: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      rarity: "common",
      points_required: 0,
      rewards: {},
      conditions: {},
      is_active: true
    });
    setSelectedReward(null);
  };

  const handleEdit = (reward: any) => {
    setSelectedReward(reward);
    setFormData({
      name: reward.name || "",
      code: reward.code || "",
      description: reward.description || "",
      rarity: reward.rarity || "common",
      points_required: reward.points_required || 0,
      rewards: reward.rewards || {},
      conditions: reward.conditions || {},
      is_active: reward.is_active ?? true
    });
    setShowRewardForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rewardData = {
      ...formData,
      ...(selectedReward ? { id: selectedReward.id } : {})
    };
    saveRewardMutation.mutate(rewardData);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'uncommon': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gift className="text-yellow-300" />
              Sistema de Recompensas
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-purple-100 mt-2">Gestão completa de conquistas e gamificação</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{achievementStats?.totalAchievements || 0}</div>
            <div className="text-purple-200">Conquistas Criadas</div>
            <div className="text-sm text-purple-200 mt-1">
              {achievementStats?.completedAchievements || 0} completadas por {achievementStats?.uniqueUsers || 0} usuários
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(achievementStats?.rarityStats || {}).map(([rarity, count]) => (
          <Card key={rarity} className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{rarity}</p>
                  <p className="text-2xl font-bold">{count as number}</p>
                  <p className="text-xs text-gray-500">
                    {achievementStats?.completedByRarity?.[rarity] || 0} completadas
                  </p>
                </div>
                <Badge className={getRarityColor(rarity)}>{rarity}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Progresso
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowRewardForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Recompensa
          </Button>
        </div>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Recompensas</CardTitle>
              <CardDescription>
                Gerencie todas as recompensas e conquistas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((achievement) => {
                    const progressCount = userAchievements.filter(ua => ua.achievement_id === achievement.id).length;
                    return (
                      <TableRow key={achievement.id}>
                        <TableCell className="font-medium">{achievement.name}</TableCell>
                        <TableCell>{achievement.code}</TableCell>
                        <TableCell>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </TableCell>
                        <TableCell>{achievement.points_required || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={achievement.is_active ? "default" : "secondary"}>
                            {achievement.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{progressCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(achievement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRewardMutation.mutate(achievement.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressão de Conquistas</CardTitle>
                <CardDescription>Conquistas completadas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de progressão será implementado aqui
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Usuários</CardTitle>
                <CardDescription>Usuários com mais conquistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(userAchievements.map(ua => ua.user_id)))
                    .slice(0, 5)
                    .map((userId, index) => {
                      const userAchievementCount = userAchievements.filter(ua => ua.user_id === userId).length;
                      const userProfile = userAchievements.find(ua => ua.user_id === userId)?.profiles;
                      
                      return (
                        <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            <div>
                              <div className="font-medium">
                                {userProfile?.full_name || userProfile?.username || 'Usuário Anônimo'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {userAchievementCount} em progresso
                              </div>
                            </div>
                          </div>
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Recente</CardTitle>
              <CardDescription>
                Últimos progressos de conquistas dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Conquista</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAchievements.slice(0, 10).map((userAchievement) => (
                    <TableRow key={userAchievement.id}>
                      <TableCell>
                        {new Date(userAchievement.updated_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {userAchievement.profiles?.full_name || userAchievement.profiles?.username || 'N/A'}
                      </TableCell>
                      <TableCell>{userAchievement.achievement_system?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{userAchievement.current_progress}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (userAchievement.current_progress / (userAchievement.achievement_system?.points_required || 1)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userAchievement.is_completed ? "default" : "secondary"}>
                          {userAchievement.is_completed ? "Completa" : "Em Progresso"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação/Edição */}
      <Dialog open={showRewardForm} onOpenChange={setShowRewardForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReward ? "Editar Recompensa" : "Nova Recompensa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rarity">Raridade</Label>
                <Select value={formData.rarity} onValueChange={(value) => setFormData({...formData, rarity: value})}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="points">Pontos Necessários</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="active">Ativo</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRewardForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveRewardMutation.isPending}>
                {selectedReward ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
