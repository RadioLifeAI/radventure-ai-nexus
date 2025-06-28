
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Se estamos na página inicial, faz scroll para a seção
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    } else {
      // Se não estamos na página inicial, navega para lá e depois faz scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      setIsMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTop}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-full shadow-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
            >
              <Rocket className="text-white" size={24}/>
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              RadVenture
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/funcionalidades"
              className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
            >
              Funcionalidades
            </Link>
            <button
              onClick={() => scrollToSection('sobre')}
              className="text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Sobre
            </button>
            <Link
              to="/contato"
              className="text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-cyan-600"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 shadow-lg"
              >
                Começar Agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/funcionalidades"
                className="text-left text-gray-700 hover:text-cyan-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Funcionalidades
              </Link>
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-left text-gray-700 hover:text-cyan-600 transition-colors"
              >
                Sobre
              </button>
              <Link
                to="/contato"
                className="text-gray-700 hover:text-cyan-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="justify-start text-gray-700"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold"
                >
                  Começar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
