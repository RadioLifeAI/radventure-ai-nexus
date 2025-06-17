
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  UserX, 
  Shield, 
  Ban, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2,
  Crown,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface UserAdvancedActionsProps {
  userId: string;
  userEmail: string;
  userRole: string;
  userName: string;
}

export function UserManagementAdvanced() {
  const [createUserModal, setCreateUserModal] = useState(false);
  const [banUserModal, setBanUserModal] = useState<string | null>(null);
  const [punishUserModal, setPunishUserModal] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "USER"
  });
  const [banReason, setBanReason] = useState("");
  const [punishmentData, setPunishmentData] = useState({
    type: "warning",
    reason: "",
    duration: ""
  });

  const queryClient = useQueryClient();

  // Buscar usuários
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Usuário criado com sucesso!" });
      setCreateUserModal(false);
      setNewUserData({ email: "", password: "", full_name: "", role: "USER" });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar usuário", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Banir usuário
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          type: 'BANNED',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log da ação
      await supabase
        .from('admin_role_changes_log')
        .insert({
          target_user_id: userId,
          admin_role: 'BANNED',
          action: 'USER_BANNED',
          reason: reason,
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });
    },
    onSuccess: () => {
      toast({ title: "Usuário banido com sucesso!" });
      setBanUserModal(null);
      setBanReason("");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao banir usuário", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Alterar role do usuário
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          type: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log da ação
      await supabase
        .from('admin_role_changes_log')
        .insert({
          target_user_id: userId,
          admin_role: newRole,
          action: 'ROLE_CHANGED',
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });
    },
    onSuccess: () => {
      toast({ title: "Role alterada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao alterar role", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateUser = () => {
    if (!newUserData.email || !newUserData.password || !newUserData.full_name) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos",
        variant: "destructive" 
      });
      return;
    }
    createUserMutation.mutate(newUserData);
  };

  const handleBanUser = (userId: string) => {
    if (!banReason.trim()) {
      toast({ 
        title: "Motivo obrigatório", 
        description: "Informe o motivo do banimento",
        variant: "destructive" 
      });
      return;
    }
    banUserMutation.mutate({ userId, reason: banReason });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATOR': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BANNED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-4 w-4" />;
      case 'MODERATOR': return <Shield className="h-4 w-4" />;
      case 'BANNED': return <Ban className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão Avançada de Usuários</h2>
          <p className="text-gray-600">Controle total sobre usuários, roles e permissões</p>
        </div>
        
        <Dialog open={createUserModal} onOpenChange={setCreateUserModal}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Crie um novo usuário com acesso ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Senha"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Input
                placeholder="Nome completo"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
              />
              <Select 
                value={newUserData.role} 
                onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="MODERATOR">Moderador</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreateUser} 
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Gerencie usuários, roles e aplicar punições
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.full_name || user.email}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.type)}>
                          {user.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Criado em {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Alterar Role */}
                    <Select 
                      value={user.type} 
                      onValueChange={(value) => changeRoleMutation.mutate({ userId: user.id, newRole: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Usuário</SelectItem>
                        <SelectItem value="MODERATOR">Moderador</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Banir usuário */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Banir Usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação banirá permanentemente o usuário {user.full_name || user.email}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Motivo do banimento..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setBanReason("")}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleBanUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Banir Usuário
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
