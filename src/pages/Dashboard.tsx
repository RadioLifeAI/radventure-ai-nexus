
import React, { useState } from "react";
import {
  Activity,
  BookOpen,
  Calendar,
  Stethoscope,
  Brain,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { UserProfile } from "@/components/UserProfile";
import { EventsSectionPlayer } from "@/components/EventsSectionPlayer";
import { SpecialtyCard } from "@/components/dashboard/SpecialtyCard";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCasesData } from "@/hooks/useCasesData";

// Componente Card de Ações rápidas
function ActionCard({ icon, title, description, link, color, onClick }: any) {
  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-4 sm:p-6 min-h-[160px] sm:min-h-[186px] hover:scale-105 transition-transform duration-200 hover:shadow-xl group">
      <div className={`mb-2 group-hover:scale-110 transition-transform duration-200`}>
        {React.cloneElement(icon, { size: 32, className: `sm:size-9 ${color}` })}
      </div>
      <span className="mt-2 text-base sm:text-lg font-extrabold text-white drop-shadow-sm text-center leading-tight">{title}</span>
      <span className="mt-1 text-xs sm:text-sm text-cyan-100 text-center leading-relaxed px-1">{description}</span>
      {onClick ? (
        <Button
          onClick={onClick}
          size="sm"
          variant="outline"
          className="mt-3 sm:mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
        >
          <Activity size={12} className="sm:size-4 mr-1" />
          {title === "Central de Casos" ? "Explorar" : title === "Crie sua Jornada" ? "Nova Jornada" : "Ver Eventos"}
        </Button>
      ) : (
        <Button asChild size="sm" variant="outline"
          className="mt-3 sm:mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-3 sm:px-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
        >
          <Link to={link || "#"}>
            <Activity size={12} className="sm:size-4 mr-1" />
            {title === "Central de Casos" ? "Explorar" : title === "Crie sua Jornada" ? "Nova Jornada" : "Ver Eventos"}
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { specialties, events, profile, isLoading: dashboardLoading } = useDashboardData();
  const { userProgress, isLoading: progressLoading } = useCasesData();
  const navigate = useNavigate();

  const isLoading = dashboardLoading || progressLoading;

  // Combinar dados de especialidades com progresso do usuário
  const specialtiesWithProgress = specialties.map(specialty => ({
    ...specialty,
    userProgress: userProgress?.bySpecialty?.[specialty.name] ? {
      total: userProgress.bySpecialty[specialty.name].total,
      correct: userProgress.bySpecialty[specialty.name].correct,
      accuracy: Math.round((userProgress.bySpecialty[specialty.name].correct / userProgress.bySpecialty[specialty.name].total) * 100)
    } : undefined
  }));

  // Handler para eventos
  function handleEnterEvent(eventId: string) {
    navigate(`/evento/${eventId}`);
  }

  // Handlers para botões de ação - CORRIGIDO
  const handleCentralCasos = () => {
    navigate('/app/casos');
  };

  const handleCriarJornada = () => {
    navigate('/app/jornada/criar');
  };

  const handleEventos = () => {
    navigate('/app/eventos');
  };

  // Separar especialidades por tipo
  const imagingSpecialties = specialties.filter(spec => 
    spec.name.includes('Radiologia') || 
    spec.name.includes('Neurorradiologia') ||
    spec.name.includes('Imagem')
  );

  const medicalSpecialties = specialties.filter(spec => 
    !imagingSpecialties.some(img => img.name === spec.name)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
        <HeaderNav />
        <main className="flex-1 w-full px-2 md:px-4 lg:px-8 xl:px-16 pt-4 pb-10 overflow-x-hidden">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 w-full flex flex-col gap-4 px-2 md:px-4 lg:px-8 xl:px-16 pt-4 pb-10 overflow-x-hidden">
        {/* Perfil principal - Agora usando dados reais */}
        <UserProfile />

        {/* SEÇÃO DE EVENTOS GAMIFICADOS */}
        <EventsSectionPlayer onEnterEvent={handleEnterEvent} />

        {/* Actions Cards - Agora com handlers funcionais e responsivos */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-2 mb-4">
          <ActionCard
            icon={<Activity />}
            title="Central de Casos"
            description="Resolva desafios reais, aprenda e suba de nível!"
            onClick={handleCentralCasos}
            color="text-[#11d3fc]"
          />
          <ActionCard
            icon={<BookOpen />}
            title="Crie sua Jornada"
            description="Personalize seu aprendizado com módulos e trilhas temáticas."
            onClick={handleCriarJornada}
            color="text-[#a189fa]"
          />
          <ActionCard
            icon={<Calendar />}
            title="Eventos"
            description="Participe de eventos exclusivos e concorra no ranking."
            onClick={handleEventos}
            color="text-[#11d3fc]"
          />
        </section>

        {/* Diagnóstico por Imagem */}
        {imagingSpecialties.length > 0 && (
          <section className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
                Diagnóstico por Imagem
              </h2>
              <div className="text-sm text-cyan-200 flex items-center gap-2">
                <span className="bg-cyan-500/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {imagingSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {imagingSpecialties.map((specialty) => (
                <SpecialtyCard 
                  key={specialty.id || specialty.name} 
                  specialty={specialtiesWithProgress.find(s => s.name === specialty.name) || specialty} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Especialidades Médicas */}
        {medicalSpecialties.length > 0 && (
          <section className="w-full mt-8 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
                Especialidades Médicas
              </h2>
              <div className="text-sm text-cyan-200 flex items-center gap-2">
                <span className="bg-cyan-500/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {medicalSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {medicalSpecialties.map((specialty) => (
                <SpecialtyCard 
                  key={specialty.id || specialty.name} 
                  specialty={specialtiesWithProgress.find(s => s.name === specialty.name) || specialty} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Mensagem quando não há dados */}
        {specialties.length === 0 && (
          <section className="w-full mt-8 mb-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300">
              <Brain className="h-16 w-16 text-cyan-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">
                Especialidades em Preparação
              </h3>
              <p className="text-cyan-200 mb-4">
                Estamos organizando os casos médicos por especialidade.
              </p>
              <Button 
                onClick={() => navigate('/admin/casos-medicos')} 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Adicionar Casos
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer aprimorado */}
      <footer className="w-full bg-gradient-to-t from-[#131f3a] to-transparent px-4 py-10 text-center mt-auto border-t border-white/10 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <span className="text-cyan-100 text-sm flex items-center justify-center gap-2">
            Powered by RadVenture · Experiência para médicos do futuro 
            <span className="text-lg animate-bounce">🚀</span>
          </span>
          <div className="mt-2 text-xs text-cyan-300">
            {specialties.length} especialidades • {specialties.reduce((sum, spec) => sum + spec.cases, 0)} casos • {events.length} eventos
          </div>
          {profile && (
            <div className="mt-1 text-xs text-cyan-400">
              Bem-vindo, {profile.full_name || profile.username || 'Usuário'}!
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
