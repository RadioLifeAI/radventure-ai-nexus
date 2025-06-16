
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SignupLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  error_message: string | null;
  created_at: string;
}

export function SignupDebugPanel() {
  const [logs, setLogs] = useState<SignupLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('signup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        setError('Erro ao carregar logs: ' + error.message);
        console.error('Error fetching signup logs:', error);
      } else {
        setLogs(data || []);
      }
    } catch (err: any) {
      setError('Erro inesperado: ' + err.message);
      console.error('Unexpected error:', err);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('error')) return 'text-red-400';
    if (eventType.includes('success')) return 'text-green-400';
    return 'text-yellow-400';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Só mostra o painel se estivermos em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 bg-slate-900/90 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database size={20} />
          Debug Panel - Logs de Cadastro
        </CardTitle>
        <CardDescription className="text-slate-300">
          Monitoramento em tempo real dos eventos de cadastro (apenas em desenvolvimento)
        </CardDescription>
        <Button 
          onClick={fetchLogs} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-fit"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Logs
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-500/20 border-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-100">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-4">
              Nenhum log encontrado
            </p>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="bg-slate-800 rounded-lg p-3 border border-slate-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-mono text-sm ${getEventTypeColor(log.event_type)}`}>
                    {log.event_type}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatTimestamp(log.created_at)}
                  </span>
                </div>
                
                {log.user_id && (
                  <div className="text-slate-300 text-xs mb-1">
                    User ID: {log.user_id}
                  </div>
                )}
                
                {log.error_message && (
                  <div className="text-red-300 text-sm mb-2 font-mono bg-red-900/20 p-2 rounded">
                    Erro: {log.error_message}
                  </div>
                )}
                
                {log.event_data && (
                  <details className="text-slate-400 text-xs">
                    <summary className="cursor-pointer hover:text-slate-300">
                      Dados do evento
                    </summary>
                    <pre className="mt-2 bg-slate-900 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.event_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
