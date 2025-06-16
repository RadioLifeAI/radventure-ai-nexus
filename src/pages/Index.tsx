
import { Button } from "@/components/ui/button";
import { Rocket, Globe, Users, ShieldCheck, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500 p-2 rounded-full shadow-md"><Rocket className="text-white" size={28}/></span>
          <span className="text-2xl font-bold tracking-tight">RadVenture</span>
        </div>
        <nav className="mt-4 md:mt-0 flex gap-4 items-center">
          {user ? (
            <Button asChild className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold px-5 py-2 rounded-lg">
              <Link to="/dashboard">Ir para Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link to="/auth" className="text-cyan-100 hover:text-white transition text-base font-medium">Entrar</Link>
              <Button asChild className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold px-5 py-2 rounded-lg">
                <Link to="/auth">Começar Agora</Link>
              </Button>
            </>
          )}
        </nav>
      </header>
      
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-12 pb-9 md:py-20">
        <h1 className="text-3xl md:text-6xl font-extrabold mb-6 animate-fade-in">
          Domine a <span className="text-cyan-300">Radiologia</span> Jogando
        </h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto mb-8 text-cyan-100">
          O futuro da educação médica gamificada está aqui. Resolva casos, evolua na carreira e conquiste prêmios em uma plataforma global para especialistas do amanhã.
        </p>
        <div className="flex gap-4 justify-center mb-12">
          {user ? (
            <Button asChild className="bg-gradient-to-r from-cyan-400 to-blue-500 font-bold px-7 py-3 text-lg drop-shadow-lg hover:scale-105 transition hover:bg-cyan-500">
              <Link to="/dashboard">Continuar Jornada</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="bg-gradient-to-r from-cyan-400 to-blue-500 font-bold px-7 py-3 text-lg drop-shadow-lg hover:scale-105 transition hover:bg-cyan-500">
                <Link to="/auth">Começar Gratuito</Link>
              </Button>
              <Button asChild variant="outline" className="border-cyan-300 text-cyan-100 hover:bg-cyan-700 hover:text-white font-bold px-7 py-3 text-lg drop-shadow-md">
                <Link to="/dashboard">Ver Prévia</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="max-w-5xl w-full mx-auto pb-16 px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-6 text-center">Funcionalidades RadVenture</h2>
        <p className="text-lg text-cyan-100 text-center mb-10">
          Tudo o que você precisa para aprender radiologia de forma divertida, segura e avançada.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <Award className="text-yellow-400 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Desafios Gamificados</span>
            <span className="text-sm text-cyan-100">Casos reais e missões diárias que motivam seu avanço!</span>
          </div>
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <TrendingUp className="text-green-400 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Rankings Globais</span>
            <span className="text-sm text-cyan-100">Dispute no topo do mundo médico, suba no leaderboard e conquiste prêmios.</span>
          </div>
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <Users className="text-cyan-300 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Comunidade Colaborativa</span>
            <span className="text-sm text-cyan-100">Troque experiências e dicas com médicos de todo o planeta.</span>
          </div>
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <Rocket className="text-violet-400 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Aventura Progressiva</span>
            <span className="text-sm text-cyan-100">Avance do nível básico ao mestre radiologista e desbloqueie conquistas.</span>
          </div>
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <ShieldCheck className="text-cyan-200 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Segurança Total</span>
            <span className="text-sm text-cyan-100">Dados protegidos com criptografia e ambiente seguro.</span>
          </div>
          <div className="bg-black/80 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <Globe className="text-blue-300 mb-3" size={32}/>
            <span className="font-bold text-lg mb-1">Quizzes para Todos</span>
            <span className="text-sm text-cyan-100">Conteúdo 100% adaptável para radiologistas iniciantes e experts, 24h, em qualquer lugar.</span>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <footer className="bg-gradient-to-t from-[#131f3a] to-transparent px-4 py-12 text-center mt-auto">
        <h3 className="text-xl md:text-3xl font-bold mb-3 text-white">Pronto para revolucionar seu aprendizado?</h3>
        <p className="text-cyan-100 mb-6 text-lg max-w-2xl mx-auto">
          Junte-se agora à revolução global gamificada para estudantes e médicos de radiologia. Seu próximo desafio começa aqui!
        </p>
        <Button asChild className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-9 py-3 text-lg font-bold">
          <Link to="/auth">Começar Agora – É Grátis</Link>
        </Button>
      </footer>
    </div>
  );
}
