
// Utilitários de performance para monitoramento
export const PerformanceMonitor = {
  // Marcar início de uma operação
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  },

  // Marcar fim e calcular duração
  measure: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measures = window.performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        
        // Alertar sobre operações lentas
        if (duration > 100) {
          console.warn(`🐌 Operação lenta detectada: ${name} (${duration.toFixed(2)}ms)`);
        }
        
        return duration;
      }
    }
    return 0;
  },

  // Limpar marcadores
  clear: (name?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      if (name) {
        window.performance.clearMarks(`${name}-start`);
        window.performance.clearMarks(`${name}-end`);
        window.performance.clearMeasures(name);
      } else {
        window.performance.clearMarks();
        window.performance.clearMeasures();
      }
    }
  },

  // Monitorar Web Vitals básicos
  observeWebVitals: () => {
    if (typeof window !== 'undefined') {
      // Observar CLS (Cumulative Layout Shift)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            console.log('📊 CLS:', entry.value);
          }
        }
      }).observe({entryTypes: ['layout-shift']});

      // Observar LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('📊 LCP:', lastEntry.startTime);
      }).observe({entryTypes: ['largest-contentful-paint']});
    }
  }
};

// HOC para monitorar performance de componentes
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  const WrappedComponent = (props: T) => {
    React.useEffect(() => {
      PerformanceMonitor.mark(`${componentName}-render`);
      return () => {
        PerformanceMonitor.measure(`${componentName}-render`);
      };
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}

// Debounce otimizado para inputs
export function useOptimizedDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
