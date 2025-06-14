import {
  Circle,
  Square,
  SquarePlus,
  SquareCheck,
  SquareMinus,
  File,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React, { useState } from "react";

type Category = {
  name: string;
  color: string;
  icon: React.ReactNode;
  url?: string;
};

const imageSpecialties: Category[] = [
  {
    name: "Neurorradiologia",
    color: "bg-cyan-600",
    icon: <Circle className="text-white" size={32}/>,
  },
  {
    name: "Coluna",
    color: "bg-fuchsia-600",
    icon: <SquareMinus className="text-white" size={32}/>,
  },
  {
    name: "Cabeça e Pescoço",
    color: "bg-orange-500",
    icon: <ImageIcon className="text-white" size={32}/>,
  },
  {
    name: "Tórax",
    color: "bg-emerald-600",
    icon: <SquareCheck className="text-white" size={32}/>,
  },
  {
    name: "Abdome",
    color: "bg-violet-600",
    icon: <File className="text-white" size={32}/>,
  },
  {
    name: "Musculoesquelético",
    color: "bg-sky-500",
    icon: <SquarePlus className="text-white" size={32}/>,
  },
  {
    name: "Intervencionista",
    color: "bg-rose-600",
    icon: <FileText className="text-white" size={32}/>,
  },
];

const medicalSpecialties: Category[] = [
  {
    name: "Medicina de Emergência",
    color: "bg-cyan-800",
    icon: <Circle className="text-white" size={32}/>,
  },
  {
    name: "Pediatria",
    color: "bg-pink-600",
    icon: <SquarePlus className="text-white" size={32}/>,
  },
  {
    name: "Trauma",
    color: "bg-yellow-600",
    icon: <SquareCheck className="text-white" size={32}/>,
  },
  {
    name: "Saúde da Mulher",
    color: "bg-rose-700",
    icon: <File className="text-white" size={32}/>,
  },
  {
    name: "Obstetrícia",
    color: "bg-emerald-700",
    icon: <SquareMinus className="text-white" size={32}/>,
  },
  {
    name: "Ginecologia",
    color: "bg-violet-700",
    icon: <FileText className="text-white" size={32}/>,
  },
  {
    name: "Hematologia",
    color: "bg-fuchsia-800",
    icon: <Square className="text-white" size={32}/>,
  },
  {
    name: "Gastrointestinal",
    color: "bg-cyan-700",
    icon: <SquareMinus className="text-white" size={32}/>,
  },
  {
    name: "Hepatobiliar",
    color: "bg-orange-600",
    icon: <Circle className="text-white" size={32}/>,
  },
  {
    name: "Dermatologia",
    color: "bg-sky-700",
    icon: <SquareCheck className="text-white" size={32}/>,
  },
  {
    name: "Otorrinolaringologia",
    color: "bg-yellow-700",
    icon: <File className="text-white" size={32}/>,
  },
  {
    name: "Oncologia",
    color: "bg-cyan-900",
    icon: <SquarePlus className="text-white" size={32}/>,
  },
  {
    name: "Urologia",
    color: "bg-emerald-900",
    icon: <Circle className="text-white" size={32}/>,
  },
  {
    name: "Vascular",
    color: "bg-violet-800",
    icon: <SquareCheck className="text-white" size={32}/>,
  },
  {
    name: "Cirurgia",
    color: "bg-orange-900",
    icon: <FileText className="text-white" size={32}/>,
  },
  {
    name: "Clínica Médica",
    color: "bg-fuchsia-900",
    icon: <Square className="text-white" size={32}/>,
  },
  {
    name: "Outros",
    color: "bg-stone-700",
    icon: <SquareMinus className="text-white" size={32}/>,
  },
];

// MenuCard para cada especialidade/categoria
function CategoryMenuCard({ name, color, icon }: Category) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 px-4 py-5 ${color}`}
      tabIndex={0}
      role="button"
      aria-label={`Explorar casos de ${name}`}
      style={{ minHeight: 122 }}
    >
      <div className="mb-2 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-white font-bold text-center text-base drop-shadow-sm leading-tight">{name}</span>
    </div>
  );
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

  // Filtro das categorias
  const [filter, setFilter] = useState<"imagem" | "medica">("imagem");

  // Classes para o menu topo
  const menuButton =
    "flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-lg transition bg-cyan-700/90 text-white border-2 border-cyan-300 shadow hover:bg-cyan-800/90 hover:border-white";
  const menuButtonInactive =
    "bg-slate-200 text-cyan-900 border-slate-300 hover:bg-slate-300";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 md:px-16 py-6 border-b border-cyan-600/40">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500 p-2 rounded-full shadow-md"><ImageIcon className="text-white" size={28}/></span>
          <span className="text-2xl font-bold tracking-tight">RadVenture</span>
        </div>
        <nav className="mt-4 md:mt-0 flex gap-4 items-center">
          <Button asChild className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold px-5 py-2 rounded-lg">
            <Link to="/">Voltar à Home</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col gap-3 px-2 md:px-16 pt-4 pb-8">
        {/* Menus do topo para filtro */}
        <section className="flex justify-center gap-2 flex-wrap mb-2 animate-fade-in">
          <button
            className={`${menuButton} ${filter === "imagem" ? "" : menuButtonInactive}`}
            type="button"
            onClick={() => setFilter("imagem")}
            aria-label="Filtrar por Diagnóstico por Imagem"
          >
            <ImageIcon size={20} /> Diagnóstico por Imagem
          </button>
          <button
            className={`${menuButton} ${filter === "medica" ? "" : menuButtonInactive}`}
            type="button"
            onClick={() => setFilter("medica")}
            aria-label="Filtrar por Especialidades Médicas"
          >
            <File size={20} /> Especialidades Médicas
          </button>
        </section>
        {/* Grid cards categorias */}
        <section className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {(filter === "imagem" ? imageSpecialties : medicalSpecialties).map((cat) => (
            <CategoryMenuCard
              key={cat.name}
              name={cat.name}
              color={cat.color}
              icon={cat.icon}
            />
          ))}
        </section>

        {/* Perfil resumido */}
        <section className="flex flex-col md:flex-row gap-6 justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg" />
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-cyan-100">
                <span className="flex items-center gap-1">{user.totalPoints} pts</span>
                <span className="ml-2 flex items-center gap-1">{user.city}, {user.state}</span>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="bg-cyan-700/50 px-3 py-1 rounded-2xl flex items-center gap-1">Ranking Nacional: <b>{user.ranking}º</b></span>
                <span className="bg-cyan-800/40 px-3 py-1 rounded-2xl flex items-center gap-1">Próxima conquista: <b>Expert Radiologista</b></span>
              </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg px-8 py-3 text-lg font-extrabold hover:scale-105 transition">
            Começar Novo Desafio
          </Button>
        </section>

        {/* Ações rápidas (cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mt-6">
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Activity className="text-cyan-400 mb-2" size={36}/>
              <span className="mt-2 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(44,220,255,0.25)]">Central de Casos</span>
              <span className="mt-1 text-sm md:text-base text-cyan-100">Resolva desafios reais, aprenda e suba de nível!</span>
              <Button asChild size="sm" variant="outline"
                className="mt-4 border-cyan-300 text-cyan-200 hover:bg-cyan-900/30 font-bold"
              >
                <Link to="#">
                  <Search size={15} className="mr-1"/> Explorar
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <BookOpen className="text-violet-400 mb-2" size={36}/>
              <span className="mt-2 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(44,220,255,0.25)]">Crie sua Jornada</span>
              <span className="mt-1 text-sm md:text-base text-cyan-100">Personalize seu aprendizado com módulos e trilhas temáticas.</span>
              <Button asChild size="sm" variant="outline" className="mt-4 border-violet-400 text-violet-200 hover:bg-violet-900/20 font-bold">
                <Link to="#">Nova Jornada</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Calendar className="text-blue-300 mb-2" size={36}/>
              <span className="mt-2 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(44,220,255,0.25)]">Eventos</span>
              <span className="mt-1 text-sm md:text-base text-cyan-100">Participe de eventos exclusivos e concorra no ranking.</span>
              <Button asChild size="sm" variant="outline" className="mt-4 border-blue-400 text-blue-200 hover:bg-blue-900/30 font-bold">
                <Link to="#">Ver Eventos</Link>
              </Button>
            </CardContent>
          </Card>
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
