
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
  Bell,
  Coins,
  Shield,
} from "lucide-react";

// Menu admin - links relativos para rotas aninhadas
const adminMenu = [
  { label: "Analytics", icon: <BarChart3 size={20} />, to: "/admin/analytics" },
  { label: "Criar Eventos", icon: <Calendar size={20} />, to: "/admin/create-event" },
  { label: "Gestão de Eventos", icon: <BookOpen size={20} />, to: "/admin/events" },
  { label: "Casos Médicos", icon: <FileText size={20} />, to: "/admin/casos-medicos" },
  { label: "Gestão de Casos", icon: <Settings size={20} />, to: "/admin/gestao-casos" },
  { label: "Usuários & Reports", icon: <Users size={20} />, to: "/admin/usuarios" },
  { label: "Assinaturas", icon: <CreditCard size={20} />, to: "/admin/assinaturas" },
  { label: "Tutor IA", icon: <Brain size={20} />, to: "/admin/tutor-ia" },
  { label: "Conquistas", icon: <Trophy size={20} />, to: "/admin/conquistas" },
  { label: "Controle de Desafios", icon: <Brain size={20} />, to: "/admin/desafios-diarios" },
  { label: "Notificações", icon: <Bell size={20} />, to: "/admin/notificacoes" },
  { label: "Monitoramento", icon: <Monitor size={20} />, to: "/admin/monitoramento" },
  { label: "Monitor Educacional", icon: <Shield size={20} />, to: "/admin/monitor-educacional" },
  { label: "Recompensas", icon: <Gift size={20} />, to: "/admin/recompensas" },
  { label: "Sistema de Recompensas", icon: <Coins size={20} />, to: "/admin/sistema-recompensas" },
  { label: "Loja RadCoin", icon: <Coins size={20} />, to: "/admin/radcoin-loja" },
  { label: "Configurações", icon: <Settings size={20} />, to: "/admin/configuracoes" },
  { label: "Chaves API", icon: <KeyRound size={20} />, to: "/admin/chaves-api" },
  { label: "Config. Stripe", icon: <CreditCard size={20} />, to: "/admin/config-stripe" },
];

export function AdminSidebar() {
  const location = useLocation();
  
  // Função para verificar se a rota está ativa considerando rotas aninhadas
  const isActiveRoute = (to: string) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <aside className="h-screen bg-white shadow-lg border-r border-gray-200 w-[235px] flex flex-col fixed top-0 left-0 z-30">
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <ShieldIcon />
        <span className="ml-2 font-bold text-lg text-gray-800">Admin Panel</span>
      </div>
      <nav className="flex-1 flex flex-col px-2 py-4 gap-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {adminMenu.map((item) => (
          <Link
            to={item.to}
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActiveRoute(item.to)
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className={`${isActiveRoute(item.to) ? "text-white" : "text-gray-500"}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="text-xs text-gray-500 text-center">
          RadVenture Admin v2.0
        </div>
      </div>
    </aside>
  );
}

// Shield Icon para o admin
function ShieldIcon() {
  return (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
      <path fill="#3b82f6" d="M12 2l7 4v6c0 4.97-3.13 9.35-7 10-3.87-.65-7-5.03-7-10V6l7-4z"/>
    </svg>
  )
}
