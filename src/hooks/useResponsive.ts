
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

  // Valores específicos para breakpoints
  const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  };

  const getCurrentWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024;
  };

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet', 
    isDesktop: screenSize === 'desktop',
    screenSize,
    breakpoints,
    currentWidth: getCurrentWidth(),
    // Helpers para classes responsivas
    getModalSize: () => {
      if (screenSize === 'mobile') return 'max-w-[95vw] max-h-[95vh]';
      if (screenSize === 'tablet') return 'max-w-4xl max-h-[90vh]';
      return 'max-w-5xl h-[90vh]';
    },
    getChatSize: () => {
      if (screenSize === 'mobile') return 'w-[95vw] h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      if (screenSize === 'tablet') return 'w-80 h-[450px] fixed bottom-4 right-4';
      return 'w-96 h-[500px] fixed bottom-4 right-4';
    },
    getTabsLayout: () => {
      if (screenSize === 'mobile') return 'grid-cols-2 gap-1';
      if (screenSize === 'tablet') return 'grid-cols-3 gap-2';
      return 'grid-cols-5';
    }
  };
}
