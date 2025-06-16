
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function SignInForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const getErrorMessage = (error: any) => {
    if (!error) return '';
    
    const message = error.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos. Verifique suas credenciais.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    if (message.includes('Too many requests')) {
      return 'Muitas tentativas. Aguarde alguns minutos.';
    }
    
    return 'Erro no login. Tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.email.trim() || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting signin for:', formData.email);
      
      const { error } = await signIn(formData.email.trim(), formData.password);

      if (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        setSuccess(true);
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta! Redirecionando...",
        });
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (unexpectedError) {
      console.error('Unexpected error during signin:', unexpectedError);
      setError('Erro inesperado. Tente novamente.');
      
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/10 border-green-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Login Realizado!</h3>
            <p className="text-green-200">Redirecionando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 border-cyan-500/30 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Entrar</CardTitle>
        <CardDescription className="text-cyan-200">
          Acesse sua conta RadVenture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-500/20 border-red-500 text-red-100">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cyan-100 flex items-center gap-2">
              <Mail size={16} />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-cyan-100 flex items-center gap-2">
              <Lock size={16} />
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="Sua senha"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-500 hover:to-violet-600 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
