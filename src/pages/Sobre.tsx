
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, BookOpen, Award, Target } from 'lucide-react';

export default function Sobre() {
  useEffect(() => {
    document.title = "Sobre o RadVenture - Educação em Radiologia";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">RadVenture</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed">
              Uma iniciativa independente e educacional dedicada a tornar o aprendizado 
              em radiologia mais ético, acessível e envolvente.
            </p>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                  Nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Missão</span>
                </h2>
                <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  <p>
                    Transformar o ensino da radiologia por meio da gamificação, inteligência artificial 
                    e interatividade, oferecendo uma experiência moderna, ética e acessível para 
                    estudantes e médicos em formação.
                  </p>
                  <p>
                    O RadVenture nasceu da necessidade de democratizar o conhecimento em radiologia, 
                    criando uma plataforma que respeita integralmente as diretrizes do CFM, CBR e LGPD.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Target, title: "Foco Educacional", desc: "100% voltado para o aprendizado médico" },
                  { icon: Shield, title: "Ética e Conformidade", desc: "Segue rigorosamente CFM, CBR e LGPD" },
                  { icon: Heart, title: "Sem Fins Lucrativos", desc: "Projeto mantido com recursos próprios" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Nossos Valores
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Princípios que guiam cada decisão e desenvolvimento da plataforma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: "Educação Acessível",
                  description: "Conhecimento em radiologia deve ser acessível a todos os estudantes e profissionais, independente de sua condição socioeconômica."
                },
                {
                  icon: Shield,
                  title: "Ética e Responsabilidade",
                  description: "Conformidade total com regulamentações médicas, proteção de dados e uso responsável de casos clínicos."
                },
                {
                  icon: Users,
                  title: "Respeito à Comunidade",
                  description: "Valorização da comunidade médica, respeitando direitos autorais e promovendo colaboração ética."
                }
              ].map((valor, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
                    <valor.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{valor.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{valor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quem Somos */}
        <section className="py-20 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
              Quem Somos
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p className="text-lg">
                  O RadVenture foi idealizado pelo <strong className="text-cyan-600 dark:text-cyan-400">Dr. Nailson Costa</strong>, 
                  radiologista, educador e entusiasta de tecnologias aplicadas à medicina.
                </p>
                
                <p>
                  Como radiologista em atividade, Dr. Nailson identificou a necessidade de ferramentas 
                  educacionais modernas e éticas que pudessem auxiliar na formação de novos profissionais, 
                  respeitando integralmente as diretrizes médicas brasileiras.
                </p>
                
                <p>
                  O projeto é mantido com recursos próprios e não possui fins lucrativos. 
                  Todo conteúdo é validado com base em evidências científicas e regulamentações 
                  do CFM e CBR, garantindo qualidade e conformidade ética.
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contato Direto</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">contato@radventure.com.br</p>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">WhatsApp</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">+55 77 98864-0691</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compromissos */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Nossos Compromissos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Transparência Total",
                  description: "Todas as práticas, fontes de conteúdo e políticas são transparentes e acessíveis aos usuários."
                },
                {
                  title: "Qualidade Científica",
                  description: "Todo conteúdo é baseado em evidências científicas e revisado por profissionais qualificados."
                },
                {
                  title: "Proteção de Dados",
                  description: "Conformidade rigorosa com a LGPD, garantindo privacidade e segurança dos dados dos usuários."
                },
                {
                  title: "Melhoria Contínua",
                  description: "Feedback da comunidade médica é essencial para o aprimoramento constante da plataforma."
                },
                {
                  title: "Acessibilidade",
                  description: "Compromisso em manter a plataforma gratuita e acessível para toda a comunidade médica."
                },
                {
                  title: "Responsabilidade Social",
                  description: "Contribuir para a formação de profissionais mais capacitados e para a melhoria da saúde pública."
                }
              ].map((compromisso, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {compromisso.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {compromisso.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-[#181842] via-[#262975] to-[#1cbad6] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl md:text-5xl font-bold mb-6">
              Faça Parte desta Iniciativa
            </h3>
            <p className="text-xl text-cyan-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Contribua para o futuro da educação médica brasileira. 
              Sua participação fortalece nossa comunidade educacional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Link to="/login">Começar a Aprender</Link>
              </Button>
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 font-semibold px-8 py-4 text-lg transition-all duration-300"
              >
                <Link to="/contato">Entre em Contato</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
