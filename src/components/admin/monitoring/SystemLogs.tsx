
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface SystemLogsProps {
  logs: any[];
}

export function SystemLogs({ logs }: SystemLogsProps) {
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Logs do Sistema
        </CardTitle>
        <CardDescription>
          Logs em tempo real de todos os serviços
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div key={log.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getLogLevelBadge(log.level)}
                  <span className="font-medium">{log.service}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {log.timestamp.toLocaleTimeString('pt-BR')}
                </span>
              </div>
              <p className="text-sm">{log.message}</p>
              {log.details && (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
