import React, { useState } from "react";
import {
  Activity,
  BookOpen,
  Calendar,
  Headphones,
  Image as ImageIcon,
  FileText,
  SquarePlus,
  SquareCheck,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { UserProfile } from "@/components/UserProfile";
import { EventsSectionPlayer } from "@/components/EventsSectionPlayer";

// Especialidades por Imagem
const imageSpecialties = [
  {
    name: "Tórax",
    description: "Radiologia torácica",
    icon: <SquareCheck size={36} className="text-[#13c7a7]" />,
    bg: "bg-gradient-to-t from-[#e5f6f5] to-white",
    cases: 1,
  },
  {
    name: "Abdome",
    description: "Radiologia abdominal",
    icon: <FileText size={36} className="text-[#f29e3b]" />,
    bg: "bg-gradient-to-t from-[#fff7ed] to-white",
    cases: 0,
  },
  {
    name: "Neuro",
    description: "Neuroimagem",
    icon: <Brain size={36} className="text-[#8f5cf7]" />,
    bg: "bg-gradient-to-t from-[#f4f0fd] to-white",
    cases: 11,
  },
  {
    name: "Musculoesquelético",
    description: "Traumatologia e ortopedia",
    icon: <SquarePlus size={36} className="text-[#414c64]" />,
    bg: "bg-gradient-to-t from-[#ecf2fb] to-white",
    cases: 0,
  },
  {
    name: "Coluna",
    description: "Radiologia da coluna",
    icon: <SquareMinus size={36} className="text-[#757575]" />,
    bg: "bg-gradient-to-t from-[#e7e7ea] to-white",
    cases: 0,
  },
];

// Diagnóstico por Imagem (Categorias radiológicas principais)
const imagingCategories = [
  {
    name: "Neurorradiologia",
    icon: <Brain size={33} className="text-[#8f5cf7]" />,
    bg: "bg-gradient-to-t from-[#f4f0fd] to-white",
  },
  {
    name: "Coluna",
    icon: <SquareMinus size={33} className="text-[#757575]" />,
    bg: "bg-gradient-to-t from-[#e7e7ea] to-white",
  },
  {
    name: "Cabeça e Pescoço",
    icon: <Shield size={33} className="text-[#11d3fc]" />,
    bg: "bg-gradient-to-t from-[#e5f6f5] to-white",
  },
  {
    name: "Tórax",
    icon: <HeartPulse size={33} className="text-[#13c7a7]" />,
    bg: "bg-gradient-to-t from-[#e5f6f5] to-white",
  },
  {
    name: "Abdome",
    icon: <FileText size={33} className="text-[#f29e3b]" />,
    bg: "bg-gradient-to-t from-[#fff7ed] to-white",
  },
  {
    name: "Musculoesquelético",
    icon: <SquarePlus size={33} className="text-[#414c64]" />,
    bg: "bg-gradient-to-t from-[#ecf2fb] to-white",
  },
  {
    name: "Intervencionista",
    icon: <Syringe size={33} className="text-[#db1c69]" />,
    bg: "bg-gradient-to-t from-[#ffe1ed] to-white",
  },
];

// Especialidades Médicas (completa e atualizada)
const medicalSpecialties = [
  {
    name: "Medicina de Emergência",
    icon: <Activity size={32} className="text-[#fd8a42]" />,
    bg: "bg-gradient-to-t from-[#fff1e5] to-white",
  },
  {
    name: "Pediatria",
    icon: <Baby size={32} className="text-[#25bfff]" />,
    bg: "bg-gradient-to-t from-[#e6fafd] to-white",
  },
  {
    name: "Trauma",
    icon: <TestTube size={32} className="text-[#9e90fa]" />,
    bg: "bg-gradient-to-t from-[#efe9ff] to-white",
  },
  {
    name: "Saúde da Mulher",
    icon: <HeartPulse size={32} className="text-[#db1c69]" />,
    bg: "bg-gradient-to-t from-[#ffe1ed] to-white",
  },
  {
    name: "Obstetrícia",
    icon: <Baby size={32} className="text-[#17bbea]" />,
    bg: "bg-gradient-to-t from-[#e6f7fb] to-white",
  },
  {
    name: "Ginecologia",
    icon: <Users size={32} className="text-[#ff3276]" />,
    bg: "bg-gradient-to-t from-[#ffe7ee] to-white",
  },
  {
    name: "Hematologia",
    icon: <Droplets size={32} className="text-[#ed212c]" />,
    bg: "bg-gradient-to-t from-[#ffe6e7] to-white",
  },
  {
    name: "Gastrointestinal",
    icon: <TestTube size={32} className="text-[#35b37c]" />,
    bg: "bg-gradient-to-t from-[#e5fff5] to-white",
  },
  {
    name: "Hepatobiliar",
    icon: <FileText size={32} className="text-[#aa7f4f]" />,
    bg: "bg-gradient-to-t from-[#fff7ed] to-white",
  },
  {
    name: "Dermatologia",
    icon: <Shield size={32} className="text-[#f29e3b]" />,
    bg: "bg-gradient-to-t from-[#fff7ed] to-white",
  },
  {
    name: "Otorrinolaringologia",
    icon: <Headphones size={32} className="text-[#22b5bf]" />,
    bg: "bg-gradient-to-t from-[#e5f6f5] to-white",
  },
  {
    name: "Oncologia",
    icon: <TestTube size={32} className="text-[#693bff]" />,
    bg: "bg-gradient-to-t from-[#efe9ff] to-white",
  },
  {
    name: "Urologia",
    icon: <Droplets size={32} className="text-[#2797ed]" />,
    bg: "bg-gradient-to-t from-[#e6f7fb] to-white",
  },
  {
    name: "Vascular",
    icon: <Users size={32} className="text-[#e8417a]" />,
    bg: "bg-gradient-to-t from-[#fbe6f7] to-white",
  },
  {
    name: "Cirurgia",
    icon: <SquarePlus size={32} className="text-[#112dfc]" />,
    bg: "bg-gradient-to-t from-[#e6e9fd] to-white",
  },
  {
    name: "Clínica Médica",
    icon: <Stethoscope size={32} className="text-[#214461]" />,
    bg: "bg-gradient-to-t from-[#e6fafd] to-white",
  },
  {
    name: "Reumatologia",
    icon: <HeartPulse size={32} className="text-[#8fcc18]" />,
    bg: "bg-gradient-to-t from-[#f6ffe5] to-white",
  },
  {
    name: "Nefrologia",
    icon: <Droplets size={32} className="text-[#179ad6]" />,
    bg: "bg-gradient-to-t from-[#e6fafd] to-white",
  },
  {
    name: "Cardiologia",
    icon: <HeartPulse size={32} className="text-[#fc2d1a]" />,
    bg: "bg-gradient-to-t from-[#ffe5e5] to-white",
  },
  {
    name: "Neurologia",
    icon: <Brain size={32} className="text-[#965cf1]" />,
    bg: "bg-gradient-to-t from-[#f4f0fd] to-white",
  },
  {
    name: "Endocrinologia",
    icon: <TestTube size={32} className="text-[#ffa101]" />,
    bg: "bg-gradient-to-t from-[#fffbe5] to-white",
  },
  {
    name: "Infectologia",
    icon: <Shield size={32} className="text-[#67d01c]" />,
    bg: "bg-gradient-to-t from-[#e7fbe6] to-white",
  },
  {
    name: "Psiquiatria",
    icon: <Brain size={32} className="text-[#b815f6]" />,
    bg: "bg-gradient-to-t from-[#fdeaff] to-white",
  },
  {
    name: "Outros",
    icon: <Circle size={32} className="text-[#757575]" />,
    bg: "bg-gradient-to-t from-[#ededed] to-white",
  },
];

// Componente Card de Especialidade
function SpecialtyCard({ icon, name, description, bg, cases }: any) {
  return (
    <div
      className={`rounded-2xl shadow hover:shadow-lg transition-all duration-200 ${bg} p-5 flex flex-col justify-between min-h-[140px]`}
    >
      <div className="flex gap-3 items-center">
        <div className="rounded-xl bg-white shadow p-2 flex items-center justify-center">{icon}</div>
        <div>
          <div className="font-bold text-lg text-gray-800">{name}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-5">
        <span className="text-xs font-semibold text-gray-600">
          {cases} caso{cases === 1 ? "" : "s"} disponível{cases === 1 ? "" : "is"}
        </span>
        <Button size="sm" className="bg-gradient-to-r from-[#11d3fc] to-[#26b2fe] text-white font-bold px-4 py-1 rounded-lg shadow hover:scale-105 transition outline-none border-none">
          Começar
        </Button>
      </div>
    </div>
  );
}

// Cards Ações rápidas logo abaixo do perfil
function ActionCard({ icon, title, description, link, color }: any) {
  return (
    <div className="bg-[#161f38] rounded-2xl shadow-lg flex flex-col items-center p-6 min-h-[186px]">
      <div className={`mb-2`}>{React.cloneElement(icon, { size: 38, className: color })}</div>
      <span className="mt-2 text-lg font-extrabold text-white drop-shadow-sm text-center">{title}</span>
      <span className="mt-1 text-sm text-cyan-100 text-center">{description}</span>
      <Button asChild size="sm" variant="outline"
        className={`mt-4 border-none text-[#11d3fc] bg-white hover:bg-[#d1f6fd] font-bold px-4 rounded-xl shadow`}
      >
        <Link to={link || "#"}>{title === "Central de Casos" ? (<><Activity size={15} className="mr-1" />Explorar</>) : title === "Crie sua Jornada" ? "Nova Jornada" : "Ver Eventos"}</Link>
      </Button>
    </div>
  )
}

export default function Dashboard() {
  const user = {
    name: "Dra. Maria Futurista",
    city: "São Paulo",
    state: "SP",
    totalPoints: 3690,
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    ranking: 7,
  };

  // handler para futura navegação ao evento
  function handleEnterEvent(eventId: string) {
    // Aqui em breve: navegação para página/quadro do evento
    alert(`Entrar no evento ${eventId}: (implementar página de evento/quiz...)`);
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
            link="#"
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
            link="#"
            color="text-[#11d3fc]"
          />
        </section>

        {/* Filtros de Diagnóstico por Imagem */}
        <section className="w-full mt-4">
          <h2 className="font-extrabold text-2xl text-white mb-2">Diagnóstico por Imagem</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4">
            {imagingCategories.map((cat) => (
              <div key={cat.name}
                className={`flex flex-col items-center justify-center p-4 rounded-xl shadow ${cat.bg} hover:scale-105 transition cursor-pointer`}>
                {cat.icon}
                <span className="mt-2 text-base font-semibold text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Especialidades Médicas */}
        <section className="w-full mt-8 mb-4">
          <h2 className="font-extrabold text-2xl text-white mb-2">Especialidades Médicas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {medicalSpecialties.map((spec) => (
              <div key={spec.name}
                className={`flex flex-col items-center justify-center p-4 rounded-xl shadow ${spec.bg} hover:scale-105 transition cursor-pointer`}>
                {spec.icon}
                <span className="mt-2 text-base font-semibold text-gray-700">{spec.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-gradient-to-t from-[#131f3a] to-transparent px-4 py-10 text-center mt-auto">
        <span className="text-cyan-100 text-sm">
          Powered by RadVenture · Experiência para médicos do futuro 🚀
        </span>
      </footer>
    </div>
  );
}
