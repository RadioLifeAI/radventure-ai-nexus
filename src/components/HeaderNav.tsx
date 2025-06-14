
import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, Settings, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";

const navLinks = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <Zap size={20} />,
  },
  {
    label: "Eventos",
    to: "/eventos",
    icon: <Calendar size={20} />,
  },
  {
    label: "Ranking Eventos",
    to: "/ranking-eventos",
    icon: <Trophy size={20} />,
  },
  {
    label: "Rankings",
    to: "/rankings",
    icon: <Trophy size={20} />,
  },
  {
    label: "Admin",
    to: "/admin",
    icon: <Settings size={20} />,
  },
];

const user = {
  name: "Dra. Maria Futurista",
  avatar: "https://randomuser.me/api/portraits/women/90.jpg",
  type: "Médica",
  points: 3690,
};

export function HeaderNav() {
  return (
    <header className="w-full bg-gradient-to-r from-[#181842] via-[#262975] to-[#1cbad6] px-6 md:px-16 py-3 flex items-center justify-between border-b border-cyan-500/30">
      <div className="flex items-center gap-4">
        <span className="bg-cyan-500 p-2 rounded-full shadow-md">
          <Zap className="text-white" size={28}/>
        </span>
        <span className="text-2xl font-bold tracking-tight text-white">RadVenture</span>
        <nav className="hidden md:flex gap-2 ml-8">
          {navLinks.map((itm) => (
            <Link 
              to={itm.to} 
              key={itm.label}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-cyan-100 hover:bg-cyan-900/30 text-base font-semibold transition"
            >
              {itm.icon}
              <span className="ml-1">{itm.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-lg shadow px-5 py-2 text-base mr-2 hover:scale-105 transition">Upgrade</Button>
        {/* User dropdown */}
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <button className="flex items-center bg-cyan-700/80 px-3 py-2 rounded-full text-white gap-2 hover:bg-cyan-800/90 transition  shadow-lg">
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-cyan-400" />
              <span className="font-bold">{user.name}</span>
              <ChevronDown size={18} />
            </button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent className="z-50 min-w-[220px] bg-white text-neutral-900 shadow-lg rounded-xl mt-3 border">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-cyan-500" />
              <div>
                <div className="font-semibold text-base">{user.name}</div>
                <div className="text-xs text-cyan-800">{user.type}</div>
                <div className="text-[13px] text-cyan-800">{user.points} pts</div>
              </div>
            </div>
            <DropdownMenu.DropdownMenuSeparator />
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-100/60 rounded">
                <Users size={17}/> Perfil
              </Link>
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-100/60 rounded">
                <Settings size={17}/> Gerenciar Conta
              </Link>
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuSeparator />
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-100/60 rounded">
                <Calendar size={17}/> Eventos
              </Link>
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-100/60 rounded">
                <Trophy size={17}/> Ranking Eventos
              </Link>
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-100/60 rounded">
                <Trophy size={17}/> Rankings
              </Link>
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuSeparator />
            <DropdownMenu.DropdownMenuItem asChild>
              <Link to="#" className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 rounded">
                <Zap size={17}/> Sair
              </Link>
            </DropdownMenu.DropdownMenuItem>
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
      </div>
    </header>
  );
}
