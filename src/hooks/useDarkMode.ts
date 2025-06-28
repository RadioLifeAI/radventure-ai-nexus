
import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Modo escuro completamente desabilitado - sempre retorna false
  const [isDark] = useState(false);

  useEffect(() => {
    // Garantir que a classe dark seja sempre removida
    const root = window.document.documentElement;
    root.classList.remove('dark');
    
    // Limpar localStorage para evitar conflitos
    localStorage.removeItem('darkMode');
  }, []);

  // Função vazia - não faz nada quando chamada
  const toggleDarkMode = () => {
    // Não faz nada - modo escuro desabilitado
  };

  return { isDark: false, toggleDarkMode };
}
