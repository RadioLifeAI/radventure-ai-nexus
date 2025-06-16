
import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { SignupDebugPanel } from './SignupDebugPanel';
import { Button } from '@/components/ui/button';
import { Rocket, Globe, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Auth Section */}
      <div className="flex flex-col md:flex-row bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] min-h-screen">
        {/* Auth Panel */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:w-1/2">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white/10 rounded-full p-4 mb-4 shadow-lg">
              <Rocket className="text-cyan-400" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">RadVenture</h1>
            <span className="text-md text-cyan-200 mb-4">Bem-vindo à sua jornada global em radiologia!</span>
            <Link 
              to="/" 
              className="text-cyan-300 hover:text-cyan-100 underline transition text-sm"
            >
              ← Voltar para página inicial
            </Link>
          </div>

          {isSignUp ? <SignUpForm /> : <SignInForm />}

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-200 hover:text-cyan-100 hover:bg-cyan-900/30"
            >
              {isSignUp 
                ? 'Já tem conta? Fazer login' 
                : 'Não tem conta? Criar uma nova'
              }
            </Button>
          </div>
        </div>

        {/* Benefits Panel */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-12 py-12 min-h-screen bg-gradient-to-bl from-[#162850] via-[#1e366a] to-[#111C44] text-white relative">
          <div className="absolute top-8 right-12 flex items-center space-x-2">
            <Globe size={28} className="text-cyan-300" />
            <span className="text-lg font-semibold">Mundo RadVenture</span>
          </div>
          <div className="flex flex-col justify-center h-full space-y-6 z-10">
            <h2 className="text-2xl font-bold text-cyan-200">Gamifique sua evolução em radiologia!</h2>
            <ul className="space-y-4 font-medium">
              <li className="flex items-center gap-3">
                <Users className="text-cyan-300" size={24} />
                <span>Desafios reais, rankings e achievements globais</span>
              </li>
              <li className="flex items-center gap-3">
                <Rocket className="text-cyan-300" size={24} />
                <span>Progresso: do Iniciante ao Mestre Radiologista!</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="text-cyan-300" size={24} />
                <span>Comunidade internacional: coopere, dispute, vença!</span>
              </li>
              <li className="flex items-center gap-3">
                <Award className="text-cyan-300" size={24} />
                <span>IA tutora: dicas e feedback sem entregar respostas</span>
              </li>
            </ul>
            <div className="rounded-xl overflow-hidden mt-6 mx-auto w-full max-w-xs drop-shadow-lg">
              <img src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=500&q=80"
                alt="Futuristic Radiology" className="w-full h-40 object-cover"/>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel - apenas em desenvolvimento */}
      <SignupDebugPanel />
    </div>
  );
}
