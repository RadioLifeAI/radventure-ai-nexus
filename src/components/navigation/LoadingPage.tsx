
import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        <p className="text-white text-lg">Carregando...</p>
      </div>
    </div>
  );
}
