
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, Coins, Zap, Shield, Trophy, Gift, Settings, User } from "lucide-react";

interface UserEditModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

interface UserBenefits {
  ai_credits: number;
  elimination_aids: number;
  skip_aids: number;
  max_ai_hints_per_day: number;
  max_eliminations_per_case: number;
  max_skips_per_session: number;
  bonus_points_multiplier: number;
  has_premium_features: boolean;
  custom_title: string;
  badge_collection: string[];
  expires_at: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
}

export function UserEditModal({ user, isOpen, onClose, onUserUpdated }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userBenefits, setUserBenefits] = useState<UserBenefits | null>(null);
  const [availableTitles, setAvailableTitles] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    type: "USER" as "USER" | "ADMIN",
    medical_specialty: "",
    academic_stage: "Student" as "Student" | "Intern" | "Resident" | "Specialist",
    total_points: 0,
    radcoin_balance: 0,
    bio: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        username: user.username || "",
        type: user.type as "USER" | "ADMIN",
        medical_specialty: user.medical_specialty || "",
        academic_stage: user.academic_stage as any || "Student",
        total_points: user.total_points || 0,
        radcoin_balance: user.radcoin_balance || 0,
        bio: user.bio || "",
      });
      loadUserData();
    }
  }, [user, isOpen]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Carregar benefícios do usuário
      const { data: benefits } = await supabase
        .from("user_benefits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (benefits) {
        setUserBenefits({
          ai_credits: benefits.ai_credits,
          elimination_aids: benefits.elimination_aids,
          skip_aids: benefits.skip_aids,
          max_ai_hints_per_day: benefits.max_ai_hints_per_day,
          max_eliminations_per_case: benefits.max_eliminations_per_case,
          max_skips_per_session: benefits.max_skips_per_session,
          bonus_points_multiplier: benefits.bonus_points_multiplier,
          has_premium_features: benefits.has_premium_features,
          custom_title: benefits.custom_title || "",
          badge_collection: Array.isArray(benefits.badge_collection) ? benefits.badge_collection : [],
          expires_at: benefits.expires_at
        });
      }

      // Carregar títulos disponíveis
      const { data: titles } = await supabase
        .from("user_titles")
        .select("*")
        .eq("is_active", true);

      setAvailableTitles(titles || []);

      // Carregar planos de assinatura (sem tier)
      const { data: plans } = await supabase
        .from("subscription_plans")
        .select("id, name, display_name")
        .eq("is_active", true)
        .order("sort_order");

      setSubscriptionPlans(plans || []);

      // Carregar assinatura atual
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*, plan:subscription_plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setCurrentSubscription(subscription);

    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          type: formData.type,
          medical_specialty: formData.medical_specialty,
          academic_stage: formData.academic_stage,
          total_points: formData.total_points,
          radcoin_balance: formData.radcoin_balance,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      onUserUpdated();
    } catch (error: any) {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBenefits = async () => {
    if (!user || !userBenefits) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_benefits")
        .upsert({
          user_id: user.id,
          ...userBenefits,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Benefícios atualizados com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar benefícios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBenefits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("sync_user_benefits", {
        p_user_id: user.id
      });

      if (error) throw error;

      toast.success("Benefícios sincronizados com o plano!");
      loadUserData();
    } catch (error: any) {
      toast.error(`Erro ao sincronizar benefícios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = async (titleCode: string) => {
    if (!user) return;

    try {
      const title = availableTitles.find(t => t.code === titleCode);
      if (!title) return;

      // Adicionar à coleção de badges
      const updatedBadges = [...(userBenefits?.badge_collection || []), titleCode];
      
      if (userBenefits) {
        setUserBenefits({
          ...userBenefits,
          badge_collection: updatedBadges
        });
      }

      toast.success(`Conquista "${title.display_name}" adicionada!`);
    } catch (error: any) {
      toast.error(`Erro ao adicionar conquista: ${error.message}`);
    }
  };

  const removeAchievement = (titleCode: string) => {
    if (!userBenefits) return;

    const updatedBadges = userBenefits.badge_collection.filter(code => code !== titleCode);
    setUserBenefits({
      ...userBenefits,
      badge_collection: updatedBadges
    });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuário: {user.full_name || user.username}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="benefits" className="flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              Assinatura
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados pessoais e perfil do usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medical_specialty">Especialidade Médica</Label>
                    <Input
                      id="medical_specialty"
                      value={formData.medical_specialty}
                      onChange={(e) => setFormData({...formData, medical_specialty: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
                    <Select value={formData.academic_stage} onValueChange={(value: any) => setFormData({...formData, academic_stage: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Estudante</SelectItem>
                        <SelectItem value="Intern">Interno</SelectItem>
                        <SelectItem value="Resident">Residente</SelectItem>
                        <SelectItem value="Specialist">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_points">Total de Pontos</Label>
                    <Input
                      id="total_points"
                      type="number"
                      value={formData.total_points}
                      onChange={(e) => setFormData({...formData, total_points: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="radcoin_balance">Saldo RadCoins</Label>
                    <Input
                      id="radcoin_balance"
                      type="number"
                      value={formData.radcoin_balance}
                      onChange={(e) => setFormData({...formData, radcoin_balance: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Perfil"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Benefícios e Limites</h3>
                <p className="text-sm text-gray-600">Configure benefícios específicos para este usuário</p>
              </div>
              <Button variant="outline" onClick={handleSyncBenefits} disabled={loading}>
                <Zap className="h-4 w-4 mr-2" />
                Sincronizar com Plano
              </Button>
            </div>

            {userBenefits && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Créditos IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Créditos Disponíveis</Label>
                      <Input
                        type="number"
                        value={userBenefits.ai_credits}
                        onChange={(e) => setUserBenefits({...userBenefits, ai_credits: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Máximo de Dicas IA por Dia</Label>
                      <Input
                        type="number"
                        value={userBenefits.max_ai_hints_per_day}
                        onChange={(e) => setUserBenefits({...userBenefits, max_ai_hints_per_day: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-green-500" />
                      Ajudas de Jogo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Ajudas de Eliminação</Label>
                      <Input
                        type="number"
                        value={userBenefits.elimination_aids}
                        onChange={(e) => setUserBenefits({...userBenefits, elimination_aids: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Ajudas de Pular</Label>
                      <Input
                        type="number"
                        value={userBenefits.skip_aids}
                        onChange={(e) => setUserBenefits({...userBenefits, skip_aids: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      Limites por Caso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Max. Eliminações por Caso</Label>
                      <Input
                        type="number"
                        value={userBenefits.max_eliminations_per_case}
                        onChange={(e) => setUserBenefits({...userBenefits, max_eliminations_per_case: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Max. Pulos por Sessão</Label>
                      <Input
                        type="number"
                        value={userBenefits.max_skips_per_session}
                        onChange={(e) => setUserBenefits({...userBenefits, max_skips_per_session: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-600" />
                      Bônus e Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Multiplicador de Pontos</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={userBenefits.bonus_points_multiplier}
                        onChange={(e) => setUserBenefits({...userBenefits, bonus_points_multiplier: parseFloat(e.target.value) || 1.0})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={userBenefits.has_premium_features}
                        onCheckedChange={(checked) => setUserBenefits({...userBenefits, has_premium_features: checked})}
                      />
                      <Label>Recursos Premium</Label>
                    </div>
                    <div>
                      <Label>Título Personalizado</Label>
                      <Input
                        value={userBenefits.custom_title || ""}
                        onChange={(e) => setUserBenefits({...userBenefits, custom_title: e.target.value})}
                        placeholder="Ex: Mestre Radiologista"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button onClick={handleSaveBenefits} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Benefícios"}
            </Button>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conquistas do Usuário</CardTitle>
                <CardDescription>Gerencie as conquistas e badges do usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Conquistas Atuais</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userBenefits?.badge_collection?.map((code) => {
                        const title = availableTitles.find(t => t.code === code);
                        return title ? (
                          <Badge
                            key={code}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAchievement(code)}
                          >
                            {title.display_name} ×
                          </Badge>
                        ) : null;
                      }) || <p className="text-gray-500">Nenhuma conquista</p>}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Adicionar Conquista</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableTitles.map((title) => (
                        <Button
                          key={title.code}
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(title.code)}
                          disabled={userBenefits?.badge_collection?.includes(title.code)}
                        >
                          {title.display_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Assinatura</CardTitle>
                <CardDescription>Status e histórico de assinatura do usuário</CardDescription>
              </CardHeader>
              <CardContent>
                {currentSubscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Plano Atual</Label>
                        <p className="font-semibold">{currentSubscription.tier}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                          {currentSubscription.status}
                        </Badge>
                      </div>
                    </div>
                    {currentSubscription.current_period_end && (
                      <div>
                        <Label>Próxima Cobrança</Label>
                        <p>{new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Usuário sem assinatura ativa</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Administração</CardTitle>
                <CardDescription>Permissões e configurações administrativas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Usuário</Label>
                  <Select value={formData.type} onValueChange={(value: "USER" | "ADMIN") => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Configurações Admin"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
