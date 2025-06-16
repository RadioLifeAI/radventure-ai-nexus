
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  BookOpen,
  BarChart3,
  Gift,
  CreditCard,
  KeyRound,
  MessageSquare,
  Zap,
  Shield
} from "lucide-react";

const adminMenu = [
  { 
    label: "Dashboard", 
    icon: <LayoutDashboard size={20} />, 
    to: "/admin/analytics",
    description: "Visão geral e métricas"
  },
  { 
    label: "Usuários", 
    icon: <Users size={20} />, 
    to: "/admin/usuarios",
    description: "Gestão de usuários"
  },
  { 
    label: "Casos Médicos", 
    icon: <FileText size={20} />, 
    to: "/admin/casos-medicos",
    description: "Biblioteca de casos"
  },
  { 
    label: "Gestão de Casos", 
    icon: <Settings size={20} />, 
    to: "/admin/gestao-casos",
    description: "Configurações de casos"
  },
  { 
    label: "Eventos", 
    icon: <Calendar size={20} />, 
    to: "/admin/events",
    description: "Gestão de eventos"
  },
  { 
    label: "Criar Evento", 
    icon: <BookOpen size={20} />, 
    to: "/admin/create-event",
    description: "Novo evento"
  },
  { 
    label: "Analytics", 
    icon: <BarChart3 size={20} />, 
    to: "/admin/analytics",
    description: "Relatórios e métricas"
  },
  { 
    label: "Recompensas", 
    icon: <Gift size={20} />, 
    to: "/admin/recompensas",
    description: "Sistema de recompensas"
  },
  { 
    label: "Assinaturas", 
    icon: <CreditCard size={20} />, 
    to: "/admin/assinaturas",
    description: "Planos e pagamentos"
  },
  { 
    label: "Tutor IA", 
    icon: <Zap size={20} />, 
    to: "/admin/tutor-ia",
    description: "Configurações IA"
  },
  { 
    label: "Configurações", 
    icon: <Settings size={20} />, 
    to: "/admin/configuracoes",
    description: "Configurações gerais"
  },
  { 
    label: "Chaves API", 
    icon: <KeyRound size={20} />, 
    to: "/admin/chaves-api",
    description: "Gestão de APIs"
  }
];

export function AdminSidebar() {
  const location = useLocation();
  
  return (
    <aside className="h-screen bg-white shadow-lg border-r w-[235px] flex flex-col fixed top-0 left-0 z-30">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b bg-gradient-to-r from-cyan-600 to-blue-600">
        <Shield className="text-white mr-3" size={26} />
        <div className="text-white">
          <div className="font-bold text-lg">Admin Panel</div>
          <div className="text-xs text-cyan-100">RadVenture</div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-2 py-4 gap-1 overflow-y-auto">
        {adminMenu.map((item) => {
          const isActive = location.pathname === item.to || 
                          (item.to === "/admin/analytics" && location.pathname === "/admin");
          
          return (
            <Link
              to={item.to}
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
              }`}
            >
              <div className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-cyan-600"}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{item.label}</div>
                <div className={`text-xs ${isActive ? "text-cyan-100" : "text-gray-500"}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50">
        <Link 
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <LayoutDashboard size={16} />
          Voltar ao Dashboard
        </Link>
      </div>
    </aside>
  );
}
