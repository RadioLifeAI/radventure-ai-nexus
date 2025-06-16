
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Menu,
  X,
  Zap,
  Trophy
} from 'lucide-react';

export function HeaderNav() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminPermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-[#111C44] to-[#162850] border-b border-cyan-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-cyan-400">
              🧠 RadVenture
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/casos" 
              className="text-white hover:text-cyan-400 transition-colors font-medium"
            >
              Casos
            </Link>
            <Link 
              to="/eventos" 
              className="text-white hover:text-cyan-400 transition-colors font-medium"
            >
              Eventos
            </Link>
            <Link 
              to="/rankings" 
              className="text-white hover:text-cyan-400 transition-colors font-medium"
            >
              Rankings
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* RadCoins Balance */}
            <div className="hidden sm:flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
              <Zap className="text-yellow-400" size={16} />
              <span className="text-yellow-400 font-bold">
                {profile?.radcoin_balance || 0}
              </span>
            </div>

            {/* Points Balance */}
            <div className="hidden sm:flex items-center space-x-2 bg-cyan-500/20 px-3 py-1 rounded-full">
              <Trophy className="text-cyan-400" size={16} />
              <span className="text-cyan-400 font-bold">
                {profile?.total_points || 0}
              </span>
            </div>

            {/* Admin Access Button - Only show if user is admin */}
            {!adminLoading && isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
              >
                <Link to="/admin">
                  <Shield size={16} className="mr-2" />
                  Admin
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="text-white font-medium">
                  {profile?.full_name?.split(' ')[0] || 'Usuário'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:text-red-400"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/30">
            <div className="flex flex-col space-y-3">
              {/* Mobile Balance Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Zap className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 font-bold">
                    {profile?.radcoin_balance || 0} RadCoins
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-cyan-500/20 px-3 py-1 rounded-full">
                  <Trophy className="text-cyan-400" size={16} />
                  <span className="text-cyan-400 font-bold">
                    {profile?.total_points || 0} pts
                  </span>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <Link 
                to="/casos" 
                className="text-white hover:text-cyan-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Casos
              </Link>
              <Link 
                to="/eventos" 
                className="text-white hover:text-cyan-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link 
                to="/rankings" 
                className="text-white hover:text-cyan-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Rankings
              </Link>

              {/* Mobile Admin Access */}
              {!adminLoading && isAdmin && (
                <Link 
                  to="/admin"
                  className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield size={16} />
                  <span>Painel Admin</span>
                </Link>
              )}

              {/* Mobile User Info */}
              <div className="flex items-center justify-between pt-3 border-t border-cyan-500/30">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                    <User className="text-white" size={16} />
                  </div>
                  <span className="text-white font-medium">
                    {profile?.full_name?.split(' ')[0] || 'Usuário'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:text-red-400"
                >
                  <LogOut size={16} />
                  <span className="ml-2">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
