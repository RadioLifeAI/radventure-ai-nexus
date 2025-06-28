
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Target, TrendingUp, Award, Rocket, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, loading, isAuthenticated } = useAuth();

  // CORREÇÃO: Redirecionamento automático se já estiver logado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('✅ Usuário já autenticado, redirecionando...');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    console.log('🔑 Tentando fazer login...');
    const { error } = await signIn(email, password);

    if (!error) {
      console.log('✅ Login bem-sucedido, redirecionando...');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    console.log('📝 Tentando criar conta...');
    const { error } = await signUp(email, password, fullName);

    if (!error) {
      console.log('✅ Cadastro bem-sucedido, redirecionando...');
      // Aguardar um pouco para garantir que o perfil seja criado
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    }
  };

  const handleGoogleAuth = async () => {
    console.log('🌐 Iniciando autenticação Google...');
    const { error } = await signInWithGoogle();
    
    if (!error) {
      console.log('🚀 Redirecionamento Google iniciado');
      // O redirecionamento será automático
    }
  };

  const goBackToLanding = () => {
    navigate('/');
  };

  // Mostrar loader se estiver carregando ou já autenticado
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">
            {isAuthenticated ? 'Redirecionando...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white flex">
      {/* Botão Foguete - Voltar para Landing */}
      <button
        onClick={goBackToLanding}
        className="fixed top-4 left-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 hover:scale-110 group"
        title="Voltar para a página inicial"
      >
        <Rocket className="text-white group-hover:text-cyan-300 transition-colors" size={24} />
      </button>

      {/* Lado Esquerdo - Formulário de Login */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo RadVenture */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Brain className="text-white" size={32}/>
              </div>
              <span className="text-3xl font-bold tracking-tight">RadVenture</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {isSignUp ? "Criar conta" : "Bem vindo de volta!"}
              </h1>
              <p className="text-cyan-100 text-sm">
                {isSignUp ? "Junte-se à aventura radiológica" : "Acesse sua conta"}
              </p>
            </div>
          </div>

          {/* Botão Google */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold h-12 text-base rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-cyan-100">ou</span>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {isSignUp && (
              <Input
                type="text"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
              />
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
            />
            
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
            />

            <Button
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-500 hover:via-blue-600 hover:to-violet-600 text-white font-semibold h-12 text-base rounded-lg shadow-lg transition-all duration-200"
              onClick={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  → {isSignUp ? "Começar Aventura" : "Entrar no Jogo"}
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cyan-200 hover:text-white text-sm transition-colors"
              >
                {isSignUp
                  ? "Já tem conta? Fazer login"
                  : "Não tem conta? Criar uma nova"}
              </button>
            </div>

            {/* Link para voltar */}
            <div className="text-center pt-2">
              <button
                onClick={goBackToLanding}
                className="text-cyan-200/80 hover:text-cyan-100 text-sm transition-colors flex items-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} />
                Voltar para página inicial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Conteúdo Motivacional */}
      <div className="hidden lg:flex lg:w-3/5 items-center justify-center p-12">
        <div className="max-w-xl space-y-10">
          {/* Título Principal */}
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-tight">
              A JORNADA DO <span className="text-cyan-300">MESTRE RADIOLOGISTA</span> COMEÇA AQUI
            </h2>
            <p className="text-xl text-cyan-100">
              Entre no game. Vença cada diagnóstico.
            </p>
          </div>

          {/* Lista de Benefícios (3 principais) */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/20 p-3 rounded-full flex-shrink-0">
                <Target className="text-cyan-300" size={24}/>
              </div>
              <div>
                <h4 className="font-bold text-lg">Desafios Reais de Diagnóstico</h4>
                <p className="text-cyan-100">Domine radiologia com casos clínicos autênticos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-full flex-shrink-0">
                <TrendingUp className="text-green-300" size={24}/>
              </div>
              <div>
                <h4 className="font-bold text-lg">Progresso de Nível</h4>
                <p className="text-cyan-100">De Interno a Mestre Radiologista: evolua constantemente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-full flex-shrink-0">
                <Award className="text-yellow-300" size={24}/>
              </div>
              <div>
                <h4 className="font-bold text-lg">Rankings Globais</h4>
                <p className="text-cyan-100">Compete com médicos do mundo todo e conquiste prêmios</p>
              </div>
            </div>
          </div>

          {/* Imagem Central */}
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/lovable-uploads/700e8efa-9b79-4685-9b4f-81c2a6fb5967.png" 
                alt="Radiologista futurista analisando exames" 
                className="rounded-2xl shadow-2xl max-w-xs w-full border-2 border-cyan-400/30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Frase Motivacional Final */}
          <div className="border-l-4 border-cyan-400 pl-6">
            <p className="text-xl font-semibold">
              "Cada diagnóstico é uma vitória. Você está pronto?"
            </p>
            <p className="text-cyan-200 mt-2">
              Suba de nível na sua jornada médica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
