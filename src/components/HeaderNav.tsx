
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Trophy, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  User,
  ChevronDown,
  Loader2,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileSettingsModal } from "@/components/profile/ProfileSettingsModal";
import { RadCoinStoreModal } from "@/components/radcoin-shop/RadCoinStoreModal";
import { EventsNotificationSystem } from "@/components/eventos/EventsNotificationSystem";

export function HeaderNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showRadCoinShop, setShowRadCoinShop] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Casos", href: "/app/casos", icon: FileText },
    { name: "Eventos", href: "/app/eventos", icon: Calendar },
    { name: "Rankings", href: "/app/rankings", icon: Trophy },
    { name: "Estatísticas", href: "/app/estatisticas", icon: BarChart3 },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Dados do usuário - agora usando dados reais do perfil
  const userData = {
    name: profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Usuário',
    avatar: profile?.avatar_url,
    email: profile?.email || user?.email || '',
    points: profile?.total_points || 0,
    radcoins: profile?.radcoin_balance || 0
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1a2b5c] via-[#2c4aa6] to-[#0ea5e9] shadow-lg border-b border-cyan-400/20 h-16 flex-shrink-0">
        <div className="w-full h-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-white/10 rounded-full p-2">
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-300" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-white">RadVenture</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1 flex-1 justify-center max-w-2xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Sistema de Notificações - NOVO */}
              {user && <EventsNotificationSystem />}

              {/* RadCoins Display - AGORA CLICÁVEL */}
              <button
                onClick={() => setShowRadCoinShop(true)}
                className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full group-hover:animate-pulse"></div>
                <span className="text-xs sm:text-sm text-white font-medium">
                  {userData.radcoins.toLocaleString()} RadCoins
                </span>
                <div className="w-4 h-4 bg-yellow-400/20 rounded-full flex items-center justify-center group-hover:bg-yellow-400/40 transition-colors">
                  <span className="text-yellow-400 text-xs">+</span>
                </div>
              </button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-white/10 rounded-full p-2"
                  >
                    {profileLoading ? (
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-cyan-300" />
                    ) : (
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-cyan-300">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs sm:text-sm">
                          {userData.name[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-white">
                        {userData.name}
                      </div>
                      <div className="text-xs text-cyan-200">
                        {userData.points.toLocaleString()} pts
                      </div>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50" sideOffset={8}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userData.name}</p>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Gerenciar Conta</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/app/estatisticas')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {/* RadCoin Shop Modal */}
      <RadCoinStoreModal 
        isOpen={showRadCoinShop}
        onClose={() => setShowRadCoinShop(false)}
      />
    </>
  );
}
