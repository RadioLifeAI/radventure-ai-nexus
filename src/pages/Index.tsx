
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Users, Brain, Zap, Target, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CookieBanner } from "@/components/landing/CookieBanner";

export default function Index() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "RadVenture - Domine a Radiologia Jogando | Plataforma Educacional Médica";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Aprenda radiologia de forma gamificada. Resolva casos clínicos, avance de nível e se prepare para o futuro da medicina com IA e comunidade global.');
    }

    // Open Graph Meta Tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'RadVenture - Domine a Radiologia Jogando');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'A plataforma educacional médica mais inovadora do Brasil. Aprenda radiologia jogando!');
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
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 animate-on-scroll">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              Domine a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Radiologia</span>
              <br />Jogando
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-cyan-100 leading-relaxed">
              Resolva casos clínicos reais, avance de nível e se prepare para o futuro da medicina 
              com inteligência artificial e gamificação inovadora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Link to="/login">Começar Agora – É Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section id="funcionalidades" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Por que escolher o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">RadVenture</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tecnologia de ponta, gamificação inteligente e comunidade médica global 
              em uma única plataforma educacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "IA Educacional Avançada",
                description: "Assistente de IA personalizado que adapta o conteúdo ao seu nível de conhecimento e oferece dicas inteligentes.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Trophy,
                title: "Gamificação Completa",
                description: "Sistema de pontos, conquistas, rankings e desafios que tornam o aprendizado divertido e motivador.",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Users,
                title: "Comunidade Global",
                description: "Conecte-se com estudantes e médicos do mundo todo, participe de discussões e compartilhe experiências.",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: Target,
                title: "Casos Clínicos Reais",
                description: "Biblioteca extensa com casos reais de hospitais parceiros, categorizados por especialidade e dificuldade.",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: TrendingUp,
                title: "Progresso Personalizado",
                description: "Acompanhe sua evolução com métricas detalhadas e relatórios de desempenho personalizados.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Zap,
                title: "Aprendizado Acelerado",
                description: "Metodologia científica comprovada que acelera a retenção de conhecimento em até 300%.",
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group animate-on-scroll bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                Revolucionando a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Educação Médica</span>
              </h2>
              <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                <p>
                  O RadVenture nasceu da necessidade de modernizar o ensino médico, 
                  combinando tecnologia de ponta com metodologias pedagógicas comprovadas.
                </p>
                <p>
                  Nossa plataforma utiliza inteligência artificial, gamificação e 
                  comunidade colaborativa para criar a experiência de aprendizado 
                  mais eficiente e envolvente do mercado.
                </p>
                <p>
                  Mais de <strong className="text-cyan-600 dark:text-cyan-400">10.000 estudantes</strong> já 
                  confiam no RadVenture para acelerar sua preparação médica.
                </p>
              </div>
              <div className="pt-8">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3"
                >
                  <Link to="/login">Junte-se a Nós</Link>
                </Button>
              </div>
            </div>
            
            <div className="animate-on-scroll">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "10K+", label: "Estudantes Ativos" },
                  { number: "500+", label: "Casos Clínicos" },
                  { number: "50+", label: "Especialidades" },
                  { number: "95%", label: "Taxa de Aprovação" }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center border border-cyan-200 dark:border-gray-600"
                  >
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
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
      <section className="py-20 bg-gradient-to-r from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para revolucionar seu aprendizado?
          </h3>
          <p className="text-xl text-cyan-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Junte-se a milhares de estudantes que já descobriram o futuro da educação médica. 
            Comece agora mesmo, é completamente gratuito!
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-12 py-4 text-xl shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Link to="/login">Começar Agora – É Grátis</Link>
          </Button>
        </div>
      </section>

      <Footer />
      <CookieBanner />

      {/* Custom CSS for animations */}
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
      `}</style>
    </div>
  );
}
