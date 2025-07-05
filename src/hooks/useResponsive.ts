
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
    
    // Sistema de Classes Responsivas - NOVO
    getResponsiveText: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl') => {
      const sizes = {
        xs: 'text-xs sm:text-sm',
        sm: 'text-sm sm:text-base',
        base: 'text-base sm:text-lg',
        lg: 'text-lg sm:text-xl lg:text-2xl',
        xl: 'text-xl sm:text-2xl lg:text-3xl',
        '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
        '3xl': 'text-3xl sm:text-4xl lg:text-5xl'
      };
      return sizes[size];
    },
    
    getResponsiveSpacing: (size: 'sm' | 'md' | 'lg' | 'xl') => {
      const spacing = {
        sm: 'p-3 sm:p-4 lg:p-6',
        md: 'p-4 sm:p-6 lg:p-8',
        lg: 'p-6 sm:p-8 lg:p-12',
        xl: 'p-8 sm:p-12 lg:p-16'
      };
      return spacing[size];
    },
    
    getResponsiveGrid: (cols: 1 | 2 | 3 | 4) => {
      const grids = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      };
      return grids[cols];
    },
    
    getResponsiveButton: () => 'min-h-[44px] px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 text-sm sm:text-base',
    
    // Helpers existentes melhorados
    getModalSize: () => {
      if (screenSize === 'mobile') return 'max-w-[95vw] max-h-[90vh] w-full';
      if (screenSize === 'tablet') return 'max-w-3xl max-h-[85vh]';
      return 'max-w-5xl max-h-[90vh]';
    },
    
    getChatSize: () => {
      if (screenSize === 'mobile') return 'w-[95vw] h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      if (screenSize === 'tablet') return 'w-80 h-[450px] fixed bottom-4 right-4';
      return 'w-96 h-[500px] fixed bottom-4 right-4';
    },
    
    getTabsLayout: () => {
      if (screenSize === 'mobile') return 'grid-cols-2 gap-1 overflow-x-auto';
      if (screenSize === 'tablet') return 'grid-cols-3 gap-2';
      return 'grid-cols-5 gap-3';
    },
    
    getContainerPadding: () => 'px-4 sm:px-6 lg:px-8 xl:px-16',
    
    getCardSpacing: () => 'gap-3 sm:gap-4 lg:gap-6'
  };
}
