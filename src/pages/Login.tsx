
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Rocket, Globe, User } from "lucide-react";

const Login = () => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0]">
      {/* Login Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:w-1/2">
        <div className="flex flex-col items-center">
          <div className="bg-white/10 rounded-full p-4 mb-4 shadow-lg">
            <Rocket className="text-cyan-400" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">RadVenture</h1>
          <span className="text-md text-cyan-200 mb-7">Bem-vindo à sua jornada global em radiologia!</span>
        </div>
        <form className="w-full max-w-sm">
          <label className="block text-cyan-100 mb-2">E-mail</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            className="mb-5 bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
          />
          <label className="block text-cyan-100 mb-2">Senha</label>
          <div className="relative mb-5">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Senha secreta"
              className="pr-10 bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-cyan-300"
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
          <Button className="w-full text-base font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-500 hover:to-violet-600">
            Entrar no Quiz
          </Button>
          <div className="mt-5 text-center">
            <a
              href="#"
              className="text-cyan-200 underline hover:text-cyan-100 transition"
            >
              Não tem conta? Criar uma nova
            </a>
          </div>
        </form>
      </div>
      {/* Benefits Panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-12 py-12 min-h-screen bg-gradient-to-bl from-[#162850] via-[#1e366a] to-[#111C44] text-white relative">
        <div className="absolute top-8 right-12 flex items-center space-x-2">
          <Globe size={28} className="text-cyan-300" />
          <span className="text-lg font-semibold">Mundo RadVenture</span>
        </div>
        <div className="flex flex-col justify-center h-full space-y-6 z-10">
          <h2 className="text-2xl font-bold text-cyan-200">Gamifique sua evolução em radiologia!</h2>
          <ul className="space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <User className="text-cyan-300" size={20} />
              Desafios reais, rankings e achievements globais
            </li>
            <li className="flex items-center gap-2">
              <Rocket className="text-cyan-300" size={20} />
              Progresso: do Iniciante ao Mestre Radiologista!
            </li>
            <li className="flex items-center gap-2">
              <Globe className="text-cyan-300" size={20} />
              Comunidade internacional: coopere, dispute, vença!
            </li>
            <li className="flex items-center gap-2">
              <Eye className="text-cyan-300" size={20} />
              IA tutora: dicas e feedback sem entregar respostas
            </li>
          </ul>
          <div className="rounded-xl overflow-hidden mt-6 mx-auto w-full max-w-xs drop-shadow-lg">
            <img src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=500&q=80"
              alt="Futuristic Radiology" className="w-full h-40 object-cover"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
