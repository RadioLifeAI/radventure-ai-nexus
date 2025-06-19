
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Target, TrendingUp, Award } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white flex">
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
