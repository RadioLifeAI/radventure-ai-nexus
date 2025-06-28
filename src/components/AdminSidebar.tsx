
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

// Menu admin otimizado - links relativos para rotas aninhadas
const adminMenu = [
  { label: "Analytics", icon: <BarChart3 size={18} />, to: "analytics" },
  { label: "Criar Eventos", icon: <Calendar size={18} />, to: "create-event" },
  { label: "Gestão de Eventos", icon: <BookOpen size={18} />, to: "events" },
  { label: "Casos Médicos", icon: <FileText size={18} />, to: "casos-medicos" },
  { label: "Gestão de Casos", icon: <Settings size={18} />, to: "gestao-casos" },
  { label: "Usuários", icon: <Users size={18} />, to: "usuarios" },
  { label: "Assinaturas", icon: <CreditCard size={18} />, to: "assinaturas" },
  { label: "Tutor IA", icon: <Brain size={18} />, to: "tutor-ia" },
  { label: "Conquistas", icon: <Trophy size={18} />, to: "conquistas" },
  { label: "Monitoramento", icon: <Monitor size={18} />, to: "monitoramento" },
  { label: "Recompensas", icon: <Gift size={18} />, to: "recompensas" },
  { label: "Configurações", icon: <Settings size={18} />, to: "configuracoes" },
  { label: "Chaves API", icon: <KeyRound size={18} />, to: "chaves-api" },
  { label: "Config. Stripe", icon: <CreditCard size={18} />, to: "config-stripe" },
];

export function AdminSidebar() {
  const location = useLocation();
  
  // Função otimizada para verificar se a rota está ativa
  const isActiveRoute = (to: string) => {
    const fullPath = `/admin/${to}`;
    return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
  };

  return (
    <aside className="h-screen bg-white shadow-lg border-r border-gray-200 w-[235px] flex flex-col fixed top-0 left-0 z-40">
      <div className="flex items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <ShieldIcon />
        <span className="ml-2 font-bold text-lg text-gray-800">Admin Panel</span>
      </div>
      <nav className="flex-1 flex flex-col px-3 py-4 gap-1 overflow-y-auto bg-white">
        {adminMenu.map((item) => (
          <Link
            to={item.to}
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActiveRoute(item.to)
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-[1.02]"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700"
            }`}
          >
            <span className={`${isActiveRoute(item.to) ? 'text-white' : 'text-gray-500'}`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Shield Icon otimizada para melhor performance
function ShieldIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="flex-shrink-0">
      <path 
        fill="url(#shield-gradient)" 
        d="M12 2l7 4v6c0 4.97-3.13 9.35-7 10-3.87-.65-7-5.03-7-10V6l7-4z"
      />
      <defs>
        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
