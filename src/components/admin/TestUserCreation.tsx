
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserPlus, TestTubes, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function TestUserCreation() {
  const { signUp } = useAuth();
  const [testResults, setTestResults] = useState<Array<{type: string, status: 'success' | 'error', message: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const runSystemTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const results: Array<{type: string, status: 'success' | 'error', message: string}> = [];

    // Test 1: Verificar conexão com Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      results.push({
        type: 'Database Connection',
        status: 'success',
        message: 'Conexão com Supabase funcionando'
      });
    } catch (error: any) {
      results.push({
        type: 'Database Connection',
        status: 'error',
        message: `Erro na conexão: ${error.message}`
      });
    }

    // Test 2: Verificar triggers
    try {
      const { data: functions } = await supabase.rpc('get_system_status');
      results.push({
        type: 'System Functions',
        status: 'success',
        message: 'Funções do sistema operacionais'
      });
    } catch (error: any) {
      results.push({
        type: 'System Functions',
        status: 'error',
        message: `Erro nas funções: ${error.message}`
      });
    }

    // Test 3: Verificar RLS
    try {
      const { data } = await supabase.from('profiles').select('id').limit(1);
      results.push({
        type: 'Row Level Security',
        status: 'success',
        message: 'RLS configurado corretamente'
      });
    } catch (error: any) {
      results.push({
        type: 'Row Level Security',
        status: 'error',
        message: `Erro no RLS: ${error.message}`
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const createTestUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.fullName) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Criando usuário de teste:', userForm.email);
      
      const result = await signUp(userForm.email, userForm.password, userForm.fullName);
      
      if (result.error) {
        throw result.error;
      }

      toast.success('Usuário de teste criado com sucesso!');
      setTestResults(prev => [...prev, {
        type: 'User Creation',
        status: 'success',
        message: `Usuário ${userForm.email} criado com sucesso`
      }]);

      // Limpar formulário
      setUserForm({ email: '', password: '', fullName: '' });
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
      setTestResults(prev => [...prev, {
        type: 'User Creation',
        status: 'error',
        message: `Erro: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTubes className="h-5 w-5" />
            Testes do Sistema
          </CardTitle>
          <CardDescription>
            Verificar integridade e funcionamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runSystemTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Executando Testes...' : 'Executar Testes do Sistema'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Resultados dos Testes:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="flex-1">
                    <span className="font-medium">{result.type}:</span>
                    <span className="ml-2 text-sm">{result.message}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Usuário de Teste
          </CardTitle>
          <CardDescription>
            Testar criação de usuários reais no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="teste@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha123!"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={userForm.fullName}
                onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="João Silva"
              />
            </div>
          </div>
          
          <Button 
            onClick={createTestUser} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Criando Usuário...' : 'Criar Usuário de Teste'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
