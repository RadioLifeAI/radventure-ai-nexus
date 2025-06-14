
import { Rocket, User, Globe, Star, TrendingUp, Award, PieChart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Demo/fake data. No backend, apenas estático para mostrar o visual.
  const user = {
    name: "Dra. Maria Futurista",
    city: "São Paulo",
    state: "SP",
    totalPoints: 3690,
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    ranking: 7,
  };

  const top3 = [
    { name: "Dr. Visionário", avatar: "https://randomuser.me/api/portraits/men/75.jpg", points: 5320 },
    { name: "Dra. Inovadora", avatar: "https://randomuser.me/api/portraits/women/88.jpg", points: 4870 },
    { name: "Dr. Pioneiro", avatar: "https://randomuser.me/api/portraits/men/70.jpg", points: 4430 },
  ];

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

      <main className="flex-1 flex flex-col gap-7 px-4 md:px-16 py-8 md:py-12">
        {/* User Profile Summary */}
        <section className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex items-center gap-6">
            <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg" />
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">{user.name} <Star className="text-yellow-300" size={24}/></h2>
              <div className="flex items-center gap-2 mt-1 text-cyan-100">
                <MapPin size={16} className="text-cyan-300" />
                {user.city}, {user.state} · <span className="ml-2 flex items-center gap-1"><PieChart size={16} className="text-green-400"/> {user.totalPoints} pts</span>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="bg-cyan-700/50 px-3 py-1 rounded-2xl flex items-center gap-1"><TrendingUp size={14}/> Ranking Nacional: <b>{user.ranking}º</b></span>
                <span className="bg-cyan-800/40 px-3 py-1 rounded-2xl flex items-center gap-1"><Award size={14}/> Próxima conquista: <b>Expert Radiologista</b></span>
              </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg px-8 py-3 text-lg font-extrabold hover:scale-105 transition">
            Começar Novo Desafio
          </Button>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
          <Card className="bg-black/70 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Globe className="text-cyan-300 mb-2" size={36}/>
              <CardTitle>Leaderboard Global</CardTitle>
              <CardDescription className="mt-1">Compare seu desempenho com radiologistas do mundo inteiro!</CardDescription>
              <Button asChild size="sm" variant="outline" className="mt-4 border-cyan-400 text-cyan-200 hover:bg-cyan-900/30">
                <Link to="#">Ver Ranking</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/70 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Award className="text-yellow-300 mb-2" size={36}/>
              <CardTitle>Minhas Conquistas</CardTitle>
              <CardDescription className="mt-1">Colecione badges exclusivos ao superar desafios e eventos.</CardDescription>
              <Button asChild size="sm" variant="outline" className="mt-4 border-yellow-400 text-yellow-200 hover:bg-yellow-900/20">
                <Link to="#">Ver Conquistas</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-black/70 rounded-xl shadow-md border-none hover:scale-105 transition">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <PieChart className="text-green-300 mb-2" size={36}/>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription className="mt-1">Monitore sua evolução, acertos, streaks e gráficos de performance.</CardDescription>
              <Button asChild size="sm" variant="outline" className="mt-4 border-green-400 text-green-200 hover:bg-green-900/30">
                <Link to="#">Minhas Estatísticas</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Ranking Highlights */}
        <section className="mt-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3 text-center text-white">Top 3 Players do Mês</h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            {top3.map((p, idx) => (
              <div key={p.name} className="flex flex-col items-center bg-cyan-900/30 rounded-xl px-6 py-4 shadow-md">
                <img src={p.avatar} alt={p.name} className="w-16 h-16 rounded-full border-2 border-yellow-400 mb-2" />
                <span className="font-bold text-lg">{p.name}</span>
                <span className="text-yellow-200 font-bold text-2xl flex items-center gap-1">
                  <Star size={20} /> {p.points}
                </span>
                <span className="text-cyan-200 mt-1">#{idx+1} do mês</span>
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
