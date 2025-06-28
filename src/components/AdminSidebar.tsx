
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  Settings,
  Gift,
  CreditCard,
  KeyRound,
  BarChart3,
  Monitor,
  BookOpen,
  Trophy,
  Brain,
} from "lucide-react";

const adminMenu = [
  { label: "Analytics", icon: <BarChart3 size={20} />, to: "analytics" },
  { label: "Criar Eventos", icon: <Calendar size={20} />, to: "create-event" },
  { label: "Gestão de Eventos", icon: <BookOpen size={20} />, to: "events" },
  { label: "Casos Médicos", icon: <FileText size={20} />, to: "casos-medicos" },
  { label: "Gestão de Casos", icon: <Settings size={20} />, to: "gestao-casos" },
  { label: "Usuários", icon: <Users size={20} />, to: "usuarios" },
  { label: "Assinaturas", icon: <CreditCard size={20} />, to: "assinaturas" },
  { label: "Tutor IA", icon: <Brain size={20} />, to: "tutor-ia" },
  { label: "Conquistas", icon: <Trophy size={20} />, to: "conquistas" },
  { label: "Monitoramento", icon: <Monitor size={20} />, to: "monitoramento" },
  { label: "Recompensas", icon: <Gift size={20} />, to: "recompensas" },
  { label: "Configurações", icon: <Settings size={20} />, to: "configuracoes" },
  { label: "Chaves API", icon: <KeyRound size={20} />, to: "chaves-api" },
  { label: "Config. Stripe", icon: <CreditCard size={20} />, to: "config-stripe" },
];

export function AdminSidebar() {
  const location = useLocation();
  
  const isActiveRoute = (to: string) => {
    const fullPath = `/admin/${to}`;
    return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
  };

  return (
    <aside className="h-screen bg-white shadow-xl border-r border-gray-200 w-[235px] flex flex-col fixed top-0 left-0 z-30">
      {/* Header com fundo claro forçado */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
        <ShieldIcon />
        <span className="ml-2 font-bold text-lg text-gray-800">Painel Admin</span>
      </div>
      
      {/* Menu com scrolling otimizado */}
      <nav className="flex-1 flex flex-col px-2 py-4 gap-1 overflow-y-auto bg-white">
        {adminMenu.map((item) => (
          <Link
            to={item.to}
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActiveRoute(item.to)
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700"
            }`}
          >
            <div className={`transition-colors ${isActiveRoute(item.to) ? "text-white" : "text-gray-500"}`}>
              {item.icon}
            </div>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
      <path fill="#039be5" d="M12 2l7 4v6c0 4.97-3.13 9.35-7 10-3.87-.65-7-5.03-7-10V6l7-4z"/>
    </svg>
  );
}
