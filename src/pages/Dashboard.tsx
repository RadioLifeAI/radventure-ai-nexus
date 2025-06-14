
import { Rocket, PieChart, Activity, BookOpen, Calendar, Search, Grid2x2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import React, { useState } from "react";

const imageSpecialties = [
  { name: "Neurorradiologia", color: "from-purple-600 to-pink-500" },
  { name: "Coluna", color: "from-blue-700 to-cyan-500" },
  { name: "Cabeça e Pescoço", color: "from-fuchsia-600 to-blue-400" },
  { name: "Tórax", color: "from-indigo-700 to-blue-300" },
  { name: "Abdome", color: "from-yellow-400 to-orange-600" },
  { name: "Musculoesquelético", color: "from-green-400 to-teal-600" },
  { name: "Intervencionista", color: "from-gray-600 to-cyan-900" },
];

const medicalSpecialties = [
  "Medicina de Emergência",
  "Pediatria",
  "Trauma",
  "Saúde da Mulher",
  "Obstetrícia",
  "Ginecologia",
  "Hematologia",
  "Gastrointestinal",
  "Hepatobiliar",
  "Dermatologia",
  "Otorrinolaringologia",
  "Oncologia",
  "Urologia",
  "Vascular",
  "Cirurgia",
  "Clínica Médica",
  "Outros"
];

export default function Dashboard() {
  const user = {
    name: "Dra. Maria Futurista",
    city: "São Paulo",
    state: "SP",
    totalPoints: 3690,
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    ranking: 7,
  };

  // Futurista: Filtros de categoria (imagem | médica)
  const [filter, setFilter] = useState<"imagem" | "medica">("imagem");

  const cardTitleClass = "mt-2 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(44,220,255,0.25)]";
  const cardDescClass = "mt-1 text-sm md:text-base text-cyan-100";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 md:px-16 py-6 border-b border-cyan-600/40">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500 p-2 rounded-full shadow-md"><Rocket className="text-white" size={28}/></span>
          <span className="text-2xl font-bold tracking-tight">RadVenture</span>
        </div>
        <nav className="mt-4 md:mt-0 flex gap-4 items-center">
          <Button asChild className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold px-5 py-2 rounded-lg">
            <Link to="/">Voltar à Home</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col gap-9 px-4 md:px-16 py-8 md:py-12">
        {/* Perfil resumido */}
        <section className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex items-center gap-6">
            <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg" />
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
                {user.name}
                <PieChart className="text-yellow-300" size={24}/>
              </h2>
              <div className="flex items-center gap-2 mt-1 text-cyan-100">
                <span className="flex items-center gap-1"><Activity size={16}/> {user.totalPoints} pts</span>
                <span className="ml-2 flex items-center gap-1"><Grid2x2 size={16} className="text-cyan-300"/> {user.city}, {user.state}</span>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="bg-cyan-700/50 px-3 py-1 rounded-2xl flex items-center gap-1"><PieChart size={14}/> Ranking Nacional: <b>{user.ranking}º</b></span>
                <span className="bg-cyan-800/40 px-3 py-1 rounded-2xl flex items-center gap-1"><BookOpen size={14}/> Próxima conquista: <b>Expert Radiologista</b></span>
              </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg px-8 py-3 text-lg font-extrabold hover:scale-105 transition">
            Começar Novo Desafio
          </Button>
        </section>

        {/* Filtros rápidos */}
        <section>
          <div className="flex gap-4 flex-wrap justify-center md:justify-start mb-4">
            <Button
              variant={filter === "imagem" ? "default" : "outline"}
              className={`font-extrabold text-base px-6 py-2 transition-all duration-200 ${filter === "imagem" ? "bg-gradient-to-r from-violet-500 to-cyan-500 border-0" : ""}`}
              onClick={() => setFilter("imagem")}
            >
              Diagnóstico por Imagem
            </Button>
            <Button
              variant={filter === "medica" ? "default" : "outline"}
              className={`font-extrabold text-base px-6 py-2 transition-all duration-200 ${filter === "medica" ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-0" : ""}`}
              onClick={() => setFilter("medica")}
            >
              Especialidades Médicas
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(filter === "imagem" ? imageSpecialties : medicalSpecialties).map((cat, idx) => (
              <Card
                key={typeof cat === "string" ? cat : cat.name}
                className={`bg-gradient-to-br ${typeof cat === "string"
                  ? "from-cyan-900 to-cyan-500"
                  : cat.color} rounded-xl shadow-lg border-0 hover:scale-105 transition`}
              >
                <CardContent className="flex flex-col items-center p-5 py-8 text-center">
                  <Grid2x2 className="mb-2 text-cyan-200" size={32}/>
                  <span className="mt-1 mb-2 text-base font-extrabold text-white drop-shadow-[0_1px_2px_rgba(44,220,255,0.4)]">
                    {typeof cat === "string" ? cat : cat.name}
                  </span>
                  <Button asChild size="sm" variant="outline"
                    className="mt-2 border-cyan-200 text-cyan-100 hover:bg-cyan-900/30 font-bold"
                  >
                    <Link to="#">
                      <Search size={16} className="mr-1"/> Explorar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mt-3">
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Activity className="text-cyan-400 mb-2" size={36}/>
              <span className={cardTitleClass}>Central de Casos</span>
              <span className={cardDescClass}>Resolva desafios reais, aprenda e suba de nível!</span>
              <Button asChild size="sm" variant="outline" className="mt-4 border-cyan-300 text-cyan-200 hover:bg-cyan-900/30 font-bold">
                <Link to="#">Explorar Casos</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <BookOpen className="text-violet-400 mb-2" size={36}/>
              <span className={cardTitleClass}>Crie sua Jornada</span>
              <span className={cardDescClass}>Personalize seu aprendizado com módulos e trilhas temáticas.</span>
              <Button asChild size="sm" variant="outline" className="mt-4 border-violet-400 text-violet-200 hover:bg-violet-900/20 font-bold">
                <Link to="#">Nova Jornada</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/60 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Calendar className="text-blue-300 mb-2" size={36}/>
              <span className={cardTitleClass}>Eventos</span>
              <span className={cardDescClass}>Participe de eventos exclusivos e concorra no ranking.</span>
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
