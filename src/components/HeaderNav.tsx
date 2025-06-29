
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EventsNotificationSystem } from "@/components/eventos/EventsNotificationSystem";

export function HeaderNav() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              RadMed
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/app/eventos")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Eventos
            </button>
            <button
              onClick={() => navigate("/app/casos")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Casos
            </button>
            <button
              onClick={() => navigate("/app/conquistas")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Conquistas
            </button>
            <button
              onClick={() => navigate("/app/estatisticas")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Estatísticas
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Sistema de notificações global */}
            {user && <EventsNotificationSystem />}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Olá, {user.user_metadata?.full_name || 'Usuário'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
