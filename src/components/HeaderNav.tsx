
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUsuariosApp } from "@/hooks/useUsuariosApp";
import { LoginModal } from "@/components/auth/LoginModal";
import { User, LogOut, Settings, Shield, Crown, Coins } from "lucide-react";

export default function HeaderNav() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { usuario, logout, isAuthenticated, isAdmin } = useUsuariosApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'SUPER_ADMIN': return 'bg-red-500 text-white';
      case 'ADMIN': return 'bg-purple-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      default: return 'Usuário';
    }
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RadVenture</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link to="/casos" className="text-gray-700 hover:text-blue-600 font-medium">
                Casos
              </Link>
              <Link to="/eventos" className="text-gray-700 hover:text-blue-600 font-medium">
                Eventos
              </Link>
              <Link to="/rankings" className="text-gray-700 hover:text-blue-600 font-medium">
                Rankings
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* RadCoins */}
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    {usuario?.radcoin_balance?.toLocaleString() || 0}
                  </span>
                </div>

                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={usuario?.avatar_url} 
                          alt={usuario?.nome_completo || "Usuário"} 
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(usuario?.nome_completo || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <div className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={usuario?.avatar_url} 
                            alt={usuario?.nome_completo || "Usuário"} 
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(usuario?.nome_completo || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {usuario?.nome_completo}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {usuario?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getUserTypeColor(usuario?.tipo || 'USER')}>
                              {usuario?.tipo === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                              {usuario?.tipo === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                              {getUserTypeLabel(usuario?.tipo || 'USER')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {usuario?.total_points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-purple-600"
                          onClick={() => navigate('/admin')}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Painel Admin
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setIsLoginModalOpen(true)}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
