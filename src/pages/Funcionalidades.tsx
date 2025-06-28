
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  GamepadIcon,
  Sparkles,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

export default function Funcionalidades() {
  useEffect(() => {
    document.title = "Funcionalidades - RadVenture | Plataforma Educacional de Radiologia";
    window.scrollTo(0, 0);
  }, []);

  const funcionalidades = [
    {
      id: 'casos-medicos',
      icon: Brain,
      title: "Central de Casos Médicos Avançada",
      subtitle: "Biblioteca com 500+ casos clínicos reais",
      description: "Explore nossa extensa biblioteca de casos radiológicos organizados por especialidade, modalidade e nível de dificuldade. Cada caso inclui imagens de alta qualidade, história clínica detalhada e explicações didáticas completas.",
      features: [
        "500+ casos clínicos autorizados e próprios",
        "Filtros avançados por especialidade e modalidade",
        "Imagens em alta resolução com zoom interativo",
        "Sistema de progressão personalizada",
        "Casos gerados por IA com validação médica"
      ],
      gradient: "from-purple-500 to-pink-500",
      stats: { cases: "500+", specialties: "15+", completion: "95%" }
    },
    {
      id: 'gamificacao',
      icon: GamepadIcon,
      title: "Gamificação e RadCoins",
      subtitle: "Sistema de recompensas e progressão",
      description: "Transforme seu aprendizado em uma jornada épica! Ganhe RadCoins, desbloqueie conquistas e suba de nível enquanto domina a radiologia. Cada diagnóstico correto é uma vitória que aproxima você do título de Mestre Radiologista.",
      features: [
        "Sistema de RadCoins para cada acerto",
        "Conquistas e badges exclusivos",
        "Níveis de progressão: Interno → Residente → Especialista → Mestre",
        "Loja virtual com benefícios educacionais",
        "Streaks diários e desafios semanais"
      ],
      gradient: "from-yellow-500 to-orange-500",
      stats: { radcoins: "10K+", achievements: "50+", levels: "25" }
    },
    {
      id: 'eventos-competitivos',
      icon: Trophy,
      title: "Eventos Competitivos",
      subtitle: "Campeonatos e desafios globais",
      description: "Participe de eventos competitivos exclusivos e teste suas habilidades contra médicos do mundo todo. Eventos temáticos, campeonatos relâmpago e desafios especiais com prêmios em RadCoins e reconhecimento.",
      features: [
        "Eventos temáticos semanais",
        "Campeonatos globais com rankings",
        "Desafios relâmpago de 15 minutos",
        "Prêmios exclusivos e títulos especiais",
        "Sistema de classificação por performance"
      ],
      gradient: "from-cyan-500 to-blue-500",
      stats: { events: "24/7", participants: "1000+", prizes: "Premium" }
    },
    {
      id: 'ia-educacional',
      icon: Sparkles,
      title: "IA Educacional Ética",
      subtitle: "Tutor pessoal inteligente",
      description: "Nossa IA educacional, desenvolvida especificamente para ensino médico, oferece dicas personalizadas, explica conceitos complexos e adapta o conteúdo ao seu ritmo de aprendizado, sempre respeitando as diretrizes do CFM e CBR.",
      features: [
        "Tutor IA personalizado para cada usuário",
        "Dicas contextuais durante os casos",
        "Explicações adaptadas ao seu nível",
        "Sistema de eliminação inteligente",
        "Conformidade total com diretrizes médicas"
      ],
      gradient: "from-green-500 to-teal-500",
      stats: { accuracy: "98%", hints: "Unlimited", learning: "Adaptive" }
    },
    {
      id: 'rankings-comunidade',
      icon: Users,
      title: "Rankings e Comunidade",
      subtitle: "Conecte-se com médicos globalmente",
      description: "Faça parte de uma comunidade global de profissionais da saúde. Compare seu progresso, participe de discussões acadêmicas e colabore em um ambiente educacional seguro e respeitoso.",
      features: [
        "Rankings globais e regionais em tempo real",
        "Sistema de estatísticas detalhadas",
        "Comunidade acadêmica verificada",
        "Perfis profissionais personalizáveis",
        "Networking educacional seguro"
      ],
      gradient: "from-blue-500 to-indigo-500",
      stats: { users: "5000+", countries: "25+", engagement: "92%" }
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Zap className="text-yellow-300" size={16} />
            <span className="text-sm font-medium text-cyan-100">Plataforma Completa de Educação Médica</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Funcionalidades <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">Revolucionárias</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto mb-8 leading-relaxed">
            Descubra como o RadVenture transforma o aprendizado em radiologia com tecnologia de ponta, 
            gamificação inteligente e uma experiência educacional única no mundo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Link to="/login">
                <Play className="mr-2" size={20} />
                Experimentar Agora
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 text-lg transition-all duration-300"
            >
              <Link to="/#sobre">
                Saiba Mais
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Funcionalidades Principais */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-6">
              <Target className="text-cyan-600 dark:text-cyan-400" size={16} />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">5 Pilares Tecnológicos</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tecnologia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">Ponta Educacional</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Cada funcionalidade foi desenvolvida com foco na excelência educacional, 
              ética médica e experiência do usuário.
            </p>
          </div>

          <div className="space-y-24">
            {funcionalidades.map((func, index) => (
              <div key={func.id} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                {/* Conteúdo */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${func.gradient} shadow-lg`}>
                      <func.icon className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {func.title}
                      </h3>
                      <p className="text-lg text-cyan-600 dark:text-cyan-400 font-medium">
                        {func.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {func.description}
                  </p>
                  
                  <div className="space-y-3">
                    {func.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      asChild
                      className={`bg-gradient-to-r ${func.gradient} hover:scale-105 transition-all duration-300 text-white font-semibold shadow-lg`}
                    >
                      <Link to="/login">
                        Explorar Funcionalidade
                        <ArrowRight className="ml-2" size={16} />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex-1 max-w-lg">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      {Object.entries(func.stats).map(([key, value], idx) => (
                        <div key={idx} className="space-y-2">
                          <div className={`text-3xl font-bold bg-gradient-to-r ${func.gradient} bg-clip-text text-transparent`}>
                            {value}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {key === 'cases' ? 'Casos' : 
                             key === 'specialties' ? 'Especialidades' :
                             key === 'completion' ? 'Taxa Sucesso' :
                             key === 'radcoins' ? 'RadCoins' :
                             key === 'achievements' ? 'Conquistas' :
                             key === 'levels' ? 'Níveis' :
                             key === 'events' ? 'Eventos' :
                             key === 'participants' ? 'Participantes' :
                             key === 'prizes' ? 'Prêmios' :
                             key === 'accuracy' ? 'Precisão IA' :
                             key === 'hints' ? 'Dicas IA' :
                             key === 'learning' ? 'Aprendizado' :
                             key === 'users' ? 'Usuários' :
                             key === 'countries' ? 'Países' :
                             key === 'engagement' ? 'Engajamento' : key}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Star className="text-yellow-500" size={16} />
                        <span className="font-medium">Funcionalidade Premium Inclusa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#181842] via-[#262975] to-[#1cbad6] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Clock className="text-yellow-300" size={16} />
            <span className="text-sm font-medium text-cyan-100">Pronto para começar em 2 minutos</span>
          </div>
          
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Transforme sua Carreira <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">Hoje Mesmo</span>
          </h3>
          
          <p className="text-xl text-cyan-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Junte-se a mais de 5.000 profissionais que já estão revolucionando 
            seu aprendizado em radiologia. Cadastro gratuito e acesso imediato.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-12 py-4 text-xl shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Link to="/login">
                <Zap className="mr-2" size={20} />
                Começar Agora – Grátis
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 text-cyan-200 text-sm">
            ✓ Sem cartão de crédito • ✓ Acesso imediato • ✓ 100% gratuito
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
