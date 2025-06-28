
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

  // Definir rotas onde o tema escuro é permitido (apenas landing page)
  const isLandingPage = () => {
    const path = location.pathname;
    return path === '/' || 
           path === '/sobre' || 
           path === '/contato' || 
           path === '/funcionalidades' || 
           path === '/termos' || 
           path === '/privacidade' || 
           path === '/cookies';
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Aplicar tema escuro APENAS em páginas da landing
    if (isLandingPage() && isDark) {
      root.classList.add('dark');
    } else {
      // Sempre remover tema escuro em páginas internas
      root.classList.remove('dark');
    }
    
    // Salvar preferência apenas se estivermos na landing page
    if (isLandingPage()) {
      localStorage.setItem('darkMode', isDark.toString());
    }
  }, [isDark, location.pathname]);

  const toggleDarkMode = () => {
    // Só permitir alteração do tema se estivermos na landing page
    if (isLandingPage()) {
      setIsDark(!isDark);
    }
  };

  return { 
    isDark: isLandingPage() ? isDark : false, // Forçar tema claro fora da landing
    toggleDarkMode 
  };
}
