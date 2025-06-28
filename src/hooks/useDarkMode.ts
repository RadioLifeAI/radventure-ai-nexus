
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useDarkMode() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Páginas onde o tema escuro é permitido (apenas landing page)
  const isDarkModeAllowed = () => {
    const allowedRoutes = ['/', '/sobre', '/contato', '/termos', '/privacidade', '/cookies', '/funcionalidades'];
    return allowedRoutes.includes(location.pathname);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Aplicar tema escuro apenas em rotas permitidas
    if (isDark && isDarkModeAllowed()) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar preferência apenas se estiver em rota permitida
    if (isDarkModeAllowed()) {
      localStorage.setItem('darkMode', isDark.toString());
    }
  }, [isDark, location.pathname]);

  // Forçar tema claro quando sair das páginas permitidas
  useEffect(() => {
    if (!isDarkModeAllowed()) {
      const root = window.document.documentElement;
      root.classList.remove('dark');
    }
  }, [location.pathname]);

  const toggleDarkMode = () => {
    // Só permitir toggle em páginas permitidas
    if (isDarkModeAllowed()) {
      setIsDark(!isDark);
    }
  };

  return { 
    isDark: isDark && isDarkModeAllowed(), 
    toggleDarkMode 
  };
}
