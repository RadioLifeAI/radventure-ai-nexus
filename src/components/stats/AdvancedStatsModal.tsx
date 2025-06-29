
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Award, 
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface AdvancedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedStatsModal({ isOpen, onClose }: AdvancedStatsModalProps) {
  const { stats, isLoading } = useRealUserStats();

  if (isLoading || !stats) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando Estatísticas...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Estatísticas Avançadas
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Real Data
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de Overview com Dados Reais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Total de Casos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.totalCases}
                </div>
                <p className="text-xs text-blue-600">casos resolvidos</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Precisão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {stats.accuracy}%
                </div>
                <p className="text-xs text-green-600">de acertos</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">
                  {stats.totalPoints.toLocaleString()}
                </div>
                <p className="text-xs text-yellow-600">pontos ganhos</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {stats.recentAchievements.length}
                </div>
                <p className="text-xs text-purple-600">desbloqueadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Atividade Semanal com Dados Reais */}
          <Card className="border-2 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-500" />
                Atividade dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      formatter={(value, name) => [value, name === 'cases' ? 'Casos' : 'Pontos']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cases" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#0891b2' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance por Especialidade com Dados Reais */}
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Performance por Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.specialtyBreakdown.slice(0, 8).map((specialty, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{specialty.specialty}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={specialty.accuracy >= 80 ? "default" : specialty.accuracy >= 60 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {specialty.accuracy}%
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {specialty.cases} casos
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          {specialty.points} pts
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={specialty.accuracy} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendências Mensais com Dados Reais */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Tendências dos Últimos 6 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(month) => {
                        const [year, monthNum] = month.split('-');
                        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { month: 'short' });
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(month) => {
                        const [year, monthNum] = month.split('-');
                        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      }}
                      formatter={(value, name) => {
                        switch(name) {
                          case 'cases': return [value, 'Casos'];
                          case 'points': return [value, 'Pontos'];
                          case 'accuracy': return [`${value}%`, 'Precisão'];
                          default: return [value, name];
                        }
                      }}
                    />
                    <Bar dataKey="cases" fill="#3b82f6" />
                    <Bar dataKey="accuracy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas com Dados Reais */}
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Conquistas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentAchievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-800">
                        {achievement.name}
                      </div>
                      <div className="text-sm text-amber-600">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-amber-500 mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
