
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Shield } from "lucide-react";

interface UserEditModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserEditModal({ user, isOpen, onClose, onUserUpdated }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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
    }
  }, [user, isOpen]);

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

  const handleMakeAdmin = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Atualizar tipo do usuário para ADMIN
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          type: "ADMIN",
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Adicionar role administrativa básica
      const { error: roleError } = await supabase
        .from("admin_user_roles")
        .insert({
          user_id: user.id,
          admin_role: "TechAdmin",
          assigned_by: user.id,
          is_active: true,
          assigned_at: new Date().toISOString(),
        });

      if (roleError) {
        console.warn("Aviso ao adicionar role:", roleError);
      }

      toast.success("Usuário promovido a administrador!");
      onUserUpdated();
    } catch (error: any) {
      toast.error(`Erro ao promover usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuário: {user.full_name || user.username}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Perfil
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
                  <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
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

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Administração</CardTitle>
                <CardDescription>Permissões e configurações administrativas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Usuário Atual</Label>
                  <div className="p-3 bg-gray-50 rounded mt-2">
                    <span className="font-semibold">
                      {user.type === "ADMIN" ? "👑 Administrador" : "👤 Usuário Padrão"}
                    </span>
                  </div>
                </div>

                {user.type !== "ADMIN" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Promover para Administrador</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Esta ação dará ao usuário acesso total ao painel administrativo.
                    </p>
                    <Button onClick={handleMakeAdmin} disabled={loading} variant="outline">
                      {loading ? "Processando..." : "Tornar Administrador"}
                    </Button>
                  </div>
                )}

                {user.type === "ADMIN" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Usuário Administrador</h4>
                    <p className="text-sm text-green-700">
                      Este usuário possui acesso total ao sistema administrativo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
