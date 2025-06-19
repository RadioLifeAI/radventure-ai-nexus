
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Shield, Mail, Lock } from "lucide-react";

export function CreateAdminUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    if (!email || !fullName || !password) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha email, senha e nome completo",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "❌ Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('Criando admin via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email,
          password,
          full_name: fullName,
          type: 'ADMIN'
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao chamar Edge Function');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha na criação do usuário');
      }

      console.log('Admin criado com sucesso:', data.user);
      
      toast({
        title: "✅ Admin criado com sucesso!",
        description: `Usuário ${fullName} (${email}) foi criado como administrador.`,
      });

      // Limpar campos
      setEmail("");
      setPassword("");
      setFullName("");

    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "❌ Erro ao criar admin",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold">Criar Admin Seguro</CardTitle>
        <CardDescription>
          Criar usuário administrador usando Edge Function segura
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <Input
            type="email"
            placeholder="admin@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isCreating}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Senha
          </label>
          <Input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isCreating}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome Completo
          </label>
          <Input
            type="text"
            placeholder="Administrador Sistema"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isCreating}
          />
        </div>
        
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating || !email || !fullName || !password}
          className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Criando Admin...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Criar Admin Seguro
            </>
          )}
        </Button>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          ✅ Usando Edge Function com auth.admin.createUser() + triggers automáticos
        </div>
      </CardContent>
    </Card>
  );
}
