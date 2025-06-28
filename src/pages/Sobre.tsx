
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { 
  Users, 
  Target, 
  Award, 
  Brain, 
  Heart, 
  Lightbulb,
  BookOpen,
  Globe
} from 'lucide-react';

export default function Sobre() {
  useEffect(() => {
    document.title = "Sobre Nós - RadVenture";
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      name: "Dr. Carlos Medeiros",
      role: "CEO & Fundador",
      specialty: "Radiologia | MD, PhD",
      description: "15 anos de experiência em radiologia e inovação educacional médica."
    },
    {
      name: "Dra. Ana Silva",
      role: "Diretora Médica",
      specialty: "Educação Médica | MD, MEd",
      description: "Especialista em metodologias ativas e tecnologia educacional."
    },
    {
      name: "Prof. Roberto Tech",
      role: "CTO",
      specialty: "Inteligência Artificial | PhD",
      description: "Expert em IA aplicada à educação e processamento de imagens médicas."
    },
    {
      name: "Dra. Mariana Costa",
      role: "Head de Conteúdo",
      specialty: "Radiologia Diagnóstica | MD",
      description: "Responsável pela curadoria e validação de casos clínicos."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Fundação",
      description: "Nascimento da ideia durante residência médica em radiologia"
    },
    {
      year: "2024",
      title: "Primeiro Protótipo",
      description: "Desenvolvimento da versão inicial com 100 casos clínicos"
    },
    {
      year: "2024",
      title: "Lançamento Beta",
      description: "1.000 estudantes testaram a plataforma com feedback excepcional"
    },
    {
      year: "2025",
      title: "Expansão Nacional",
      description: "10.000+ usuários ativos e parcerias com principais universidades"
    }
  ];

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
              Revolucionando a educação médica através de tecnologia, 
              gamificação e inteligência artificial
            </p>
          </div>
        </section>

        {/* Missão, Visão e Valores */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-6">
                  <Target className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Missão</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Democratizar o acesso ao ensino médico de qualidade, tornando 
                  o aprendizado de radiologia mais eficiente, divertido e acessível 
                  para estudantes de todo o Brasil.
                </p>
              </div>

              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
                  <Lightbulb className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Visão</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ser a plataforma educacional médica mais inovadora da América Latina, 
                  preparando a próxima geração de radiologistas com excelência 
                  e tecnologia de ponta.
                </p>
              </div>

              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mb-6">
                  <Heart className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Valores</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Excelência educacional, inovação tecnológica, acessibilidade, 
                  colaboração comunitária e compromisso com o futuro da medicina 
                  brasileira.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Nossa História
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Do problema real de um residente em radiologia nasceu a solução 
                que está transformando a educação médica no Brasil
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                    </div>
                    
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Nossa Equipe
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Médicos, educadores e desenvolvedores unidos pela paixão 
                em transformar a educação médica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <div className="text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                    {member.role}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {member.specialty}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impacto e Números */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Nosso Impacto
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Números que demonstram nossa contribuição para a educação médica brasileira
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, number: "10.000+", label: "Estudantes Ativos", color: "from-blue-500 to-cyan-500" },
                { icon: BookOpen, number: "500+", label: "Casos Clínicos", color: "from-green-500 to-teal-500" },
                { icon: Award, number: "95%", label: "Taxa de Satisfação", color: "from-yellow-500 to-orange-500" },
                { icon: Globe, number: "27", label: "Estados Atendidos", color: "from-purple-500 to-pink-500" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} mb-4`}>
                    <stat.icon className="text-white" size={32} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Futuro */}
        <section className="py-20 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              O Futuro da Educação Médica
            </h2>
            <div className="space-y-6 text-xl text-cyan-100 leading-relaxed">
              <p>
                Estamos apenas começando. Nossa visão inclui expansão para outras 
                especialidades médicas, parcerias internacionais e tecnologias 
                emergentes como realidade virtual e aumentada.
              </p>
              <p>
                Com inteligência artificial cada vez mais avançada, pretendemos 
                criar experiências de aprendizado completamente personalizadas, 
                adaptadas ao ritmo e estilo de cada estudante.
              </p>
              <p>
                <strong>O futuro da medicina começa com a educação de hoje.</strong> 
                E o RadVenture está liderando essa transformação.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
