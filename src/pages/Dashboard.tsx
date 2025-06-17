import React, { useState } from "react";
import {
  Activity,
  BookOpen,
  Calendar,
  SquareCheck,
  FileText,
  SquarePlus,
  SquareMinus,
  Square,
  Circle,
  Stethoscope,
  Baby,
  Shield,
  Brain,
  HeartPulse,
  Users,
  TestTube,
  Syringe,
  Droplets,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { UserProfile } from "@/components/UserProfile";
import { EventsSectionPlayer } from "@/components/EventsSectionPlayer";
import { SpecialtyCard } from "@/components/dashboard/SpecialtyCard";
import { useDashboardData } from "@/hooks/useDashboardData";

// Componente Card de Ações rápidas
function ActionCard({ icon, title, description, link, color }: any) {
  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-6 min-h-[186px] hover:scale-105 transition-transform duration-200">
      <div className={`mb-2`}>{React.cloneElement(icon, { size: 38, className: color })}</div>
      <span className="mt-2 text-lg font-extrabold text-white drop-shadow-sm text-center">{title}</span>
      <span className="mt-1 text-sm text-cyan-100 text-center">{description}</span>
      <Button asChild size="sm" variant="outline"
        className={`mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-4 rounded-xl shadow`}
      >
        <Link to={link || "#"}>
          {title === "Central de Casos" ? (
            <>
              <Activity size={15} className="mr-1" />
              Explorar
            </>
          ) : title === "Crie sua Jornada" ? "Nova Jornada" : "Ver Eventos"}
        </Link>
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const { specialties, events, profile, isLoading } = useDashboardData();
  const navigate = useNavigate();

  // Dados do usuário (mantendo compatibilidade)
  const user = {
    name: profile?.full_name || "Dra. Maria Futurista",
    city: profile?.city || "São Paulo",
    state: profile?.state || "SP",
    totalPoints: profile?.total_points || 3690,
    avatar: profile?.avatar_url || "https://randomuser.me/api/portraits/women/90.jpg",
    ranking: 7,
  };

  // Handler para eventos
  function handleEnterEvent(eventId: string) {
    navigate(`/evento/${eventId}`);
  }

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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white w-full">
        <HeaderNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-300" />
            <p className="text-xl text-cyan-100">Carregando dashboard...</p>
            <p className="text-sm text-cyan-200 mt-2">Sincronizando dados em tempo real</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white w-full">
      <HeaderNav />
      <main className="flex-1 flex flex-col gap-4 px-2 md:px-16 pt-4 pb-10">
        {/* Perfil principal */}
        <UserProfile user={user} />

        {/* NOVA SEÇÃO DE EVENTOS GAMIFICADOS */}
        <EventsSectionPlayer onEnterEvent={handleEnterEvent} />

        {/* Actions Cards */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2 mb-4">
          <ActionCard
            icon={<Activity />}
            title="Central de Casos"
            description="Resolva desafios reais, aprenda e suba de nível!"
            link="/central-casos"
            color="text-[#11d3fc]"
          />
          <ActionCard
            icon={<BookOpen />}
            title="Crie sua Jornada"
            description="Personalize seu aprendizado com módulos e trilhas temáticas."
            link="#"
            color="text-[#a189fa]"
          />
          <ActionCard
            icon={<Calendar />}
            title="Eventos"
            description="Participe de eventos exclusivos e concorra no ranking."
            link="/eventos"
            color="text-[#11d3fc]"
          />
        </section>

        {/* Diagnóstico por Imagem */}
        {imagingSpecialties.length > 0 && (
          <section className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-2xl text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-cyan-300" />
                Diagnóstico por Imagem
              </h2>
              <div className="text-sm text-cyan-200">
                {imagingSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {imagingSpecialties.map((specialty) => (
                <SpecialtyCard key={specialty.id || specialty.name} specialty={specialty} />
              ))}
            </div>
          </section>
        )}

        {/* Especialidades Médicas */}
        {medicalSpecialties.length > 0 && (
          <section className="w-full mt-8 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-2xl text-white flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-cyan-300" />
                Especialidades Médicas
              </h2>
              <div className="text-sm text-cyan-200">
                {medicalSpecialties.reduce((sum, spec) => sum + spec.cases, 0)} casos disponíveis
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {medicalSpecialties.map((specialty) => (
                <SpecialtyCard key={specialty.id || specialty.name} specialty={specialty} />
              ))}
            </div>
          </section>
        )}

        {/* Mensagem quando não há dados */}
        {specialties.length === 0 && (
          <section className="w-full mt-8 mb-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <Brain className="h-16 w-16 text-cyan-300 mx-auto mb-4" />
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
      <footer className="bg-gradient-to-t from-[#131f3a] to-transparent px-4 py-10 text-center mt-auto border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <span className="text-cyan-100 text-sm flex items-center justify-center gap-2">
            Powered by RadVenture · Experiência para médicos do futuro 
            <span className="text-lg">🚀</span>
          </span>
          <div className="mt-2 text-xs text-cyan-300">
            {specialties.length} especialidades • {specialties.reduce((sum, spec) => sum + spec.cases, 0)} casos • {events.length} eventos
          </div>
        </div>
      </footer>
    </div>
  );
}
