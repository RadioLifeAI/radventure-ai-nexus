import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { CreateAdminUser } from "@/components/admin/CreateAdminUser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();

  // Verificar se existem admins no sistema
  const { data: hasAdmins, isLoading: checkingAdmins } = useQuery({
    queryKey: ['check-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('type', 'ADMIN')
        .limit(1);
      
      if (error) {
        console.warn('Erro ao verificar admins:', error);
        return false;
      }
      
      return (data && data.length > 0);
    }
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const { error } = await signIn(email, password);

    if (!error) {
      navigate("/app");
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (!error) {
      navigate("/app");
    }
  };

  // Se não há admins no sistema, mostrar criador de admin
  if (!checkingAdmins && hasAdmins === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] p-4">
        <div className="space-y-6">
          <div className="text-center text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Sistema Sem Admin</h1>
            <p className="text-cyan-100">
              Crie o primeiro administrador para começar a usar o sistema
            </p>
          </div>
          
          <CreateAdminUser />
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              className="text-white hover:text-cyan-200"
              onClick={() => window.location.reload()}
            >
              Atualizar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold">
            {isSignUp ? "Criar Conta" : "Acessar"}
          </h1>
          <p className="text-cyan-100">
            {isSignUp
              ? "Crie sua conta e comece agora mesmo!"
              : "Entre com seu email e senha"}
          </p>
        </div>

        <div className="space-y-4">
          {isSignUp && (
            <div>
              <Label className="text-white">Nome Completo</Label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label className="text-white">Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-white">Senha</Label>
            <Input
              type="password"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            isSignUp ? "Criar Conta" : "Acessar"
          )}
        </Button>

        <div className="text-center text-white">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
          >
            {isSignUp
              ? "Já tem uma conta? Acessar"
              : "Não tem uma conta? Criar conta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
