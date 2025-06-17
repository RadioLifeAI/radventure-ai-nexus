
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Award, Star, Plus, Edit, Trash2, Users } from "lucide-react";

export function AchievementManagement() {
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAchievementForm, setShowAchievementForm] = useState(false);

  const { data: achievements = [], isLoading, refetch } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievement_system")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userTitles = [] } = useQuery({
    queryKey: ["user-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_titles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["user-achievements"],
    queryFn: async () => {
      const { data: achievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select("*")
        .order("unlocked_at", { ascending: false })
        .limit(50);

      if (achievementsError) throw achievementsError;

      const userIds = [...new Set(achievements?.map(a => a.user_id))];
      const achievementIds = [...new Set(achievements?.map(a => a.achievement_id))];

      const [usersData, achievementSystemData] = await Promise.all([
        userIds.length > 0 ? supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", userIds) : Promise.resolve({ data: [] }),
        achievementIds.length > 0 ? supabase
          .from("achievement_system")
          .select("id, name, rarity")
          .in("id", achievementIds) : Promise.resolve({ data: [] })
      ]);

      const enrichedAchievements = achievements?.map(achievement => ({
        ...achievement,
        user: usersData.data?.find(u => u.id === achievement.user_id),
        achievement: achievementSystemData.data?.find(a => a.id === achievement.achievement_id)
      }));

      return enrichedAchievements || [];
    },
  });

  const handleSaveAchievement = async (achievementData: any) => {
    try {
      const { error } = await supabase
        .from("achievement_system")
        .upsert(achievementData);

      if (error) throw error;

      toast.success("Conquista salva com sucesso!");
      setShowAchievementForm(false);
      setSelectedAchievement(null);
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao salvar conquista: ${error.message}`);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from("achievement_system")
        .delete()
        .eq("id", achievementId);

      if (error) throw error;

      toast.success("Conquista deletada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao deletar conquista: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Conquistas</h1>
          <p className="text-gray-600">Configure conquistas, títulos e sistema de gamificação</p>
        </div>
        <Button onClick={() => setShowAchievementForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conquista
        </Button>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="titles" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Títulos
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Progresso dos Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Conquistas</CardTitle>
              <CardDescription>
                Gerencie conquistas e recompensas do sistema gamificado
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
                        <Badge 
                          variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                        >
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
                            onClick={() => {
                              setSelectedAchievement(achievement);
                              setShowAchievementForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAchievement(achievement.id)}
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

        <TabsContent value="titles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Títulos de Usuário</CardTitle>
              <CardDescription>
                Gerencie títulos especiais e badges de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTitles.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell className="font-medium">{title.display_name}</TableCell>
                      <TableCell>{title.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{title.rarity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={title.is_active ? "default" : "secondary"}>
                          {title.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas Recentes</CardTitle>
              <CardDescription>
                Acompanhe as conquistas desbloqueadas pelos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Conquista</TableHead>
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
                        {userAchievement.user?.full_name || userAchievement.user?.username || 'N/A'}
                      </TableCell>
                      <TableCell>{userAchievement.achievement?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {userAchievement.achievement?.rarity || 'N/A'}
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
    </div>
  );
}
