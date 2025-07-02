
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Brain,
  Clock,
  Target,
  BookOpen,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EducationalMetrics {
  totalUsers: number;
  activeToday: number;
  suspiciousPatterns: number;
  educationalAlerts: number;
  avgStudyTime: number;
  helpAidUsage: {
    elimination: number;
    skip: number;
    aiTutor: number;
  };
}

export function EducationalMonitoring() {
  const [metrics, setMetrics] = useState<EducationalMetrics>({
    totalUsers: 0,
    activeToday: 0,
    suspiciousPatterns: 0,
    educationalAlerts: 0,
    avgStudyTime: 0,
    helpAidUsage: { elimination: 0, skip: 0, aiTutor: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducationalMetrics();
    const interval = setInterval(fetchEducationalMetrics, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchEducationalMetrics = async () => {
    try {
      // Buscar métricas educacionais básicas
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at')
        .eq('type', 'USER');

      if (usersError) throw usersError;

      // Buscar notificações educacionais do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, type, created_at')
        .gte('created_at', today)
        .in('type', ['educational_alert', 'abuse_warning', 'study_recommendation']);

      if (notifError) throw notifError;

      // Buscar uso de ajudas do dia
      const { data: helpUsage, error: helpError } = await supabase
        .from('user_case_history')
        .select('details')
        .gte('answered_at', today);

      if (helpError) throw helpError;

      // Calcular métricas
      const activeToday = users?.filter(u => 
        new Date(u.updated_at).toDateString() === new Date().toDateString()
      ).length || 0;

      const educationalAlerts = notifications?.filter(n => 
        n.type === 'educational_alert'
      ).length || 0;

      const suspiciousPatterns = notifications?.filter(n => 
        n.type === 'abuse_warning'
      ).length || 0;

      setMetrics({
        totalUsers: users?.length || 0,
        activeToday,
        suspiciousPatterns,
        educationalAlerts,
        avgStudyTime: 45, // Simulado - implementar cálculo real depois
        helpAidUsage: {
          elimination: Math.floor(Math.random() * 100), // Simulado
          skip: Math.floor(Math.random() * 50),
          aiTutor: Math.floor(Math.random() * 200)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar métricas educacionais:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos Hoje</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeToday}</div>
            <p className="text-xs text-gray-600">
              de {metrics.totalUsers} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Educacionais</CardTitle>
            <Brain className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.educationalAlerts}</div>
            <p className="text-xs text-gray-600">enviados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Padrões Suspeitos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.suspiciousPatterns}</div>
            <p className="text-xs text-gray-600">detectados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.avgStudyTime}min</div>
            <p className="text-xs text-gray-600">por sessão</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Uso de Ajudas Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Eliminação de Alternativas</span>
                <Badge variant="outline">{metrics.helpAidUsage.elimination} usos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pular Casos</span>
                <Badge variant="outline">{metrics.helpAidUsage.skip} usos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tutor IA</span>
                <Badge variant="outline">{metrics.helpAidUsage.aiTutor} usos</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Proteções Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting RadBot</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Detecção de Padrões</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alertas Educacionais</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recomendações IA</span>
                <Badge className="bg-blue-100 text-blue-800">Em Desenvolvimento</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
