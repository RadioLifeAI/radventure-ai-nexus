
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Trophy, Plus, Edit, Trash2, Star, Crown } from "lucide-react";

export function RewardManagement() {
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
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["user-achievement-stats"],
    queryFn: async () => {
      const { data: achievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select("*")
        .order("unlocked_at", { ascending: false })
        .limit(20);

      if (achievementsError) throw achievementsError;

      // Get achievement details and user profiles separately
      const achievementIds = [...new Set(achievements.map(a => a.achievement_id))];
      const userIds = [...new Set(achievements.map(a => a.user_id))];

      const [{ data: achievementDetails }, { data: userProfiles }] = await Promise.all([
        supabase.from("achievement_system").select("*").in("id", achievementIds),
        supabase.from("profiles").select("id, full_name, username").in("id", userIds)
      ]);

      // Combine the data
      return achievements.map(achievement => ({
        ...achievement,
        achievement_system: achievementDetails?.find(a => a.id === achievement.achievement_id),
        profiles: userProfiles?.find(p => p.id === achievement.user_id)
      }));
    },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="text-purple-600" />
            Gestão de Recompensas
          </h1>
          <p className="text-gray-600">Configure recompensas, conquistas e sistema de gamificação</p>
        </div>
        <Button onClick={() => setShowRewardForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recompensa
        </Button>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Recompensas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

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
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((achievement) => (
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recompensas Recentes</CardTitle>
              <CardDescription>
                Acompanhe as recompensas concedidas aos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Raridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAchievements.map((userAchievement) => (
                    <TableRow key={userAchievement.id}>
                      <TableCell>
                        {new Date(userAchievement.unlocked_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {userAchievement.profiles?.full_name || userAchievement.profiles?.username || 'N/A'}
                      </TableCell>
                      <TableCell>{userAchievement.achievement_system?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getRarityColor(userAchievement.achievement_system?.rarity || 'common')}>
                          {userAchievement.achievement_system?.rarity || 'common'}
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
