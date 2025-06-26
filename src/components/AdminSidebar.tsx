
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Gift, 
  CreditCard, 
  Activity, 
  Settings, 
  Brain, 
  Trophy, 
  Building, 
  Key,
  Database,
  BarChart3,
  Trash2,
  FileText,
  Folder,
  Calendar,
  Plus
} from "lucide-react";

const menuItems = [
  { name: "Dashboard Real", href: "/admin", icon: Database },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Usuários", href: "/admin/usuarios", icon: Users },
  { name: "Casos Médicos", href: "/admin/casos-medicos", icon: FileText },
  { name: "Gestão de Casos", href: "/admin/gestao-casos", icon: Folder },
  { name: "Criar Evento", href: "/admin/create-event", icon: Plus },
  { name: "Gestão de Eventos", href: "/admin/events", icon: Calendar },
  { name: "Recompensas", href: "/admin/recompensas", icon: Gift },
  { name: "Assinaturas", href: "/admin/assinaturas", icon: CreditCard },
  { name: "Monitoramento", href: "/admin/monitoramento", icon: Activity },
  { name: "IA Tutor", href: "/admin/tutor-ia", icon: Brain },
  { name: "Conquistas", href: "/admin/conquistas", icon: Trophy },
  { name: "Stripe", href: "/admin/config-stripe", icon: Building },
  { name: "API Keys", href: "/admin/chaves-api", icon: Key },
  { name: "Status Limpeza", href: "/admin/cleanup-status", icon: Trash2 },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-center mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
