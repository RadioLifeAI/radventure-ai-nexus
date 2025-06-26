
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

export function HeaderNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [showProfileSettings, setShowProfileSettings] = useState(false);

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
      <header className="bg-gradient-to-r from-[#1a2b5c] via-[#2c4aa6] to-[#0ea5e9] shadow-lg border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-full p-2">
                <Rocket className="h-8 w-8 text-cyan-300" />
              </div>
              <span className="text-2xl font-bold text-white">RadVenture</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
            <div className="flex items-center space-x-4">
              {/* RadCoins Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-white font-medium">
                  {userData.radcoins.toLocaleString()} RadCoins
                </span>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-white/10 rounded-full p-2"
                  >
                    {profileLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
                    ) : (
                      <Avatar className="h-8 w-8 border-2 border-cyan-300">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback className="bg-cyan-100 text-cyan-700">
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
                    <ChevronDown className="h-4 w-4 text-cyan-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
    </>
  );
}
