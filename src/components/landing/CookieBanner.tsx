
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    functional: true, // Sempre ativo
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      functional: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const savedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(savedPreferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'functional') return; // Não pode ser desabilitado
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-2xl border-2 border-gray-200 dark:border-gray-600">
        <CardContent className="p-6">
          {!showSettings ? (
            // Banner Principal
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <Cookie className="text-white" size={24} />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🍪 Utilizamos Cookies para Melhorar sua Experiência
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento da plataforma e cookies opcionais 
                  para análise e personalização. Você pode escolher quais tipos aceitar. 
                  Consulte nossa <Link to="/cookies" className="text-cyan-600 hover:underline">Política de Cookies</Link> 
                  {' '}e <Link to="/privacidade" className="text-cyan-600 hover:underline">Política de Privacidade</Link> para mais detalhes.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Preferências
                </Button>
                <Button
                  onClick={handleRejectOptional}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Apenas Essenciais
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                >
                  Aceitar Todos
                </Button>
              </div>
            </div>
          ) : (
            // Configurações Detalhadas
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurações de Cookies
                </h3>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Cookies Funcionais */}
                <div className="flex items-start justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Cookies Funcionais</h4>
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Sempre Ativo
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Essenciais para login, segurança e funcionamento básico da plataforma.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Cookies Analíticos */}
                <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cookies Analíticos</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Ajudam-nos a melhorar a plataforma analisando como você a utiliza (Google Analytics).
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleTogglePreference('analytics')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-blue-500 justify-end pr-1' : 'bg-gray-300 dark:bg-gray-600 justify-start pl-1'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cookies de Marketing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Permitem mostrar conteúdo e anúncios mais relevantes para você.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleTogglePreference('marketing')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-blue-500 justify-end pr-1' : 'bg-gray-300 dark:bg-gray-600 justify-start pl-1'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={handleRejectOptional}
                  variant="outline"
                  className="border-gray-300 text-gray-700 dark:text-gray-300"
                >
                  Apenas Essenciais
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                >
                  Salvar Preferências
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
