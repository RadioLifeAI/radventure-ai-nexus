
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Calendar,
  Users,
  User,
  FileText,
  Settings,
  Gift,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Zap,
  BookOpen,
} from "lucide-react";

// Definição dos itens do menu admin (pode ser expandida depois)
const adminMenu = [
  { label: "Analytics", icon: <LayoutDashboard size={20} />, to: "/admin/analytics" },
  { label: "Criar Eventos", icon: <Calendar size={20} />, to: "/admin/create-event" },
  { label: "Gestão de Eventos", icon: <BookOpen size={20} />, to: "/admin/events" },
  { label: "Casos Médicos", icon: <FileText size={20} />, to: "/admin/casos-medicos" },
  { label: "Usuários", icon: <Users size={20} />, to: "/admin/usuarios" },
  { label: "Assinaturas", icon: <CreditCard size={20} />, to: "/admin/assinaturas" },
  { label: "Recompensas", icon: <Gift size={20} />, to: "/admin/recompensas" },
  { label: "Configurações", icon: <Settings size={20} />, to: "/admin/configuracoes" },
  { label: "Textos da UI", icon: <MessageSquare size={20} />, to: "/admin/textos-ui" },
  { label: "Tutor IA", icon: <Zap size={20} />, to: "/admin/tutor-ia" },
  { label: "Config. Assinatura", icon: <CreditCard size={20} />, to: "/admin/config-assinatura" },
  { label: "Config. Stripe", icon: <CreditCard size={20} />, to: "/admin/config-stripe" },
  { label: "Chaves API", icon: <KeyRound size={20} />, to: "/admin/chaves-api" },
];

export function AdminSidebar() {
  const location = useLocation();
  return (
    <aside className="h-screen bg-white shadow border-r w-[235px] flex flex-col fixed top-0 left-0 z-30">
      <div className="flex items-center px-6 py-4 border-b">
        <ShieldIcon />
        <span className="ml-2 font-bold text-lg text-[#191a26]">Painel de Administração</span>
      </div>
      <nav className="flex-1 flex flex-col px-2 py-4 gap-1 overflow-y-auto">
        {adminMenu.map((item) => (
          <Link
            to={item.to}
            key={item.label}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold transition ${
              location.pathname === item.to
                ? "bg-cyan-600 text-white"
                : "text-gray-700 hover:bg-cyan-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Shield Icon separada para fácil alteração
function ShieldIcon() {
  return (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
      <path fill="#039be5" d="M12 2l7 4v6c0 4.97-3.13 9.35-7 10-3.87-.65-7-5.03-7-10V6l7-4z"/>
    </svg>
  )
}
