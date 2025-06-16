
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingPage() {
  const [showEmergencyActions, setShowEmergencyActions] = useState(false);

  useEffect(() => {
    // Show emergency actions after 15 seconds of loading
    const timer = setTimeout(() => {
      setShowEmergencyActions(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyReset = () => {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Force reload
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during emergency reset:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4 text-center">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        <p className="text-white text-lg">Carregando...</p>
        
        {showEmergencyActions && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-200 font-medium">Problemas de conexão?</p>
            </div>
            <p className="text-red-300 text-sm mb-4">
              Se a página não carregar, tente limpar os dados da sessão.
            </p>
            <Button
              onClick={handleEmergencyReset}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Dados e Reiniciar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
