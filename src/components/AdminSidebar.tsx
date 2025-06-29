
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Trophy,
  Calendar,
  FileText,
  Settings,
  Shield,
  CreditCard,
  Bell,
  Activity
} from "lucide-react";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: BarChart3,
      path: "/admin",
      exact: true
    },
    {
      label: "Usuários",
      icon: Users,
      path: "/admin/usuarios"
    },
    {
      label: "Casos Médicos",
      icon: FileText,
      path: "/admin/casos"
    },
    {
      label: "Eventos",
      icon: Calendar,
      path: "/admin/eventos"
    },
    {
      label: "Conquistas",
      icon: Trophy,
      path: "/admin/conquistas"
    },
    {
      label: "Notificações",
      icon: Bell,
      path: "/admin/notificacoes"
    },
    {
      label: "Monitoramento",
      icon: Activity,
      path: "/admin/monitoramento"
    },
    {
      label: "Segurança",
      icon: Shield,
      path: "/admin/seguranca"
    },
    {
      label: "Assinaturas",
      icon: CreditCard,
      path: "/admin/assinaturas"
    },
    {
      label: "Configurações",
      icon: Settings,
      path: "/admin/configuracoes"
    }
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">Painel Admin</h2>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path, item.exact) ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-2 text-left"
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
