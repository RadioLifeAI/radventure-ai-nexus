
import { useState, useEffect, useCallback } from 'react';

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    // Inicialização otimizada no primeiro render
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }
    return 'desktop';
  });

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    let newSize: 'mobile' | 'tablet' | 'desktop';
    
    if (width < 768) {
      newSize = 'mobile';
    } else if (width < 1024) {
      newSize = 'tablet';
    } else {
      newSize = 'desktop';
    }
    
    // Só atualiza se mudou para evitar re-renders desnecessários
    setScreenSize(prevSize => prevSize !== newSize ? newSize : prevSize);
  }, []);

  useEffect(() => {
    // Throttle para melhor performance
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScreenSize]);

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet', 
    isDesktop: screenSize === 'desktop',
    screenSize
  };
}
