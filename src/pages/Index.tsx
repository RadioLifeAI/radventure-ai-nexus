
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Users, Brain, Zap, Target, BookOpen, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CookieBanner } from "@/components/landing/CookieBanner";

export default function Index() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "RadVenture - Plataforma Educacional de Radiologia Gamificada";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Plataforma educacional interativa para ensino de radiologia. Aprenda com casos clínicos reais, gamificação e IA. Projeto sem fins comerciais do Dr. Nailson Costa.');
    }

    // Open Graph Meta Tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'RadVenture - Educação em Radiologia Gamificada');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Plataforma educacional gratuita para aprendizado em radiologia com IA e gamificação.');
    if (!document.head.contains(ogDescription)) document.head.appendChild(ogDescription);

    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      
      {/* Hero Section com melhorias visuais */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white overflow-hidden">
        {/* Efeitos de fundo gamificados */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-yellow-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 animate-on-scroll">
            {/* Badge moderno */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="text-yellow-400 animate-pulse" size={16} />
              <span className="text-sm font-medium text-cyan-100">Projeto Educacional do Dr. Nailson Costa</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              Aprenda <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 animate-pulse">Radiologia</span>
              <br />de Forma Interativa
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-cyan-100 leading-relaxed">
              Plataforma educacional gratuita com casos clínicos reais, gamificação inteligente 
              e IA para estudantes e médicos em formação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <Link to="/login">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Começar Agora – É Gratuito</span>
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 text-lg transition-all duration-300"
              >
                <Link to="/funcionalidades">
                  Ver Funcionalidades
                </Link>
              </Button>
            </div>
            
            {/* Estatísticas em destaque */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              {[
                { number: "500+", label: "Casos Clínicos" },
                { number: "5000+", label: "Estudantes" },
                { number: "25+", label: "Países" }
              ].map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <div className="text-2xl font-bold text-cyan-300">{stat.number}</div>
                  <div className="text-sm text-cyan-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section com melhorias */}
      <section id="funcionalidades" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-6">
              <Trophy className="text-cyan-600 dark:text-cyan-400" size={16} />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Tecnologia Educacional Avançada</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Por que escolher o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">RadVenture</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Plataforma educacional moderna e ética, desenvolvida especificamente 
              para o ensino de radiologia no Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "IA Educacional Ética",
                description: "Assistente de inteligência artificial desenvolvido especificamente para educação médica, respeitando diretrizes do CFM e CBR.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Trophy,
                title: "Gamificação Inteligente",
                description: "Sistema de pontos, conquistas e rankings que motivam o aprendizado contínuo sem comprometer a seriedade educacional.",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Users,
                title: "Comunidade Acadêmica",
                description: "Conecte-se com estudantes, residentes e radiologistas em um ambiente colaborativo e educacional.",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: Target,
                title: "Casos Clínicos Autorizados",
                description: "Biblioteca com casos próprios, gerados por IA e casos licenciados sob Creative Commons, todos devidamente autorizados.",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: TrendingUp,
                title: "Progresso Personalizado",
                description: "Acompanhe sua evolução com métricas detalhadas e relatórios de desempenho focados no aprendizado.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Zap,
                title: "100% Gratuito",
                description: "Projeto educacional sem fins comerciais, mantido com recursos próprios para democratizar o ensino da radiologia.",
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group animate-on-scroll bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
              >
                {/* Efeito de hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* CTA para página de funcionalidades */}
          <div className="text-center mt-16 animate-on-scroll">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Link to="/funcionalidades">
                Ver Todas as Funcionalidades
                <Sparkles className="ml-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 px-4 py-2 rounded-full mb-6">
                <BookOpen className="text-green-600 dark:text-green-400" size={16} />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Projeto Educacional</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                Educação <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Ética e Acessível</span>
              </h2>
              <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                <p>
                  O RadVenture é uma iniciativa educacional independente idealizada pelo 
                  <strong className="text-cyan-600 dark:text-cyan-400"> Dr. Nailson Costa</strong>, 
                  radiologista e educador, para democratizar o ensino da radiologia.
                </p>
                <p>
                  Nossa plataforma combina tecnologia moderna com responsabilidade ética, 
                  seguindo rigorosamente as diretrizes do CFM, CBR e LGPD para oferecer 
                  educação médica de qualidade e gratuita.
                </p>
                <p>
                  <strong className="text-cyan-600 dark:text-cyan-400">Projeto sem fins comerciais</strong> mantido 
                  com recursos próprios, focado exclusivamente no avanço da educação médica brasileira.
                </p>
              </div>
              <div className="pt-8">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 hover:scale-105 transition-all duration-300"
                >
                  <Link to="/login">Comece a Aprender</Link>
                </Button>
              </div>
            </div>
            
            <div className="animate-on-scroll">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "100%", label: "Gratuito", color: "from-green-500 to-emerald-500" },
                  { number: "500+", label: "Casos Clínicos", color: "from-blue-500 to-cyan-500" },
                  { number: "LGPD", label: "Conformidade", color: "from-purple-500 to-indigo-500" },
                  { number: "CFM/CBR", label: "Diretrizes", color: "from-orange-500 to-red-500" }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-600 hover:scale-105 transition-transform duration-300 group"
                  >
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#181842] via-[#262975] to-[#1cbad6] text-white relative overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Award className="text-yellow-400 animate-pulse" size={16} />
            <span className="text-sm font-medium text-cyan-100">Junte-se a 5.000+ estudantes</span>
          </div>
          
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para revolucionar seu aprendizado?
          </h3>
          <p className="text-xl text-cyan-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Junte-se a uma comunidade dedicada ao aprendizado ético e responsável da radiologia. 
            Comece agora mesmo, é completamente gratuito!
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-12 py-4 text-xl shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
          >
            <Link to="/login">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Começar Agora – É Gratuito</span>
            </Link>
          </Button>
          
          <div className="mt-6 text-cyan-200 text-sm">
            ✓ Sem cartão de crédito • ✓ Acesso imediato • ✓ 500+ casos disponíveis
          </div>
        </div>
      </section>

      <Footer />
      <CookieBanner />

      {/* Custom CSS para animações melhoradas */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }
        
        /* Efeitos de hover melhorados */
        .group:hover .animate-pulse {
          animation-duration: 1s;
        }
      `}</style>
    </div>
  );
}
