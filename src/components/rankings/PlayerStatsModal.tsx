
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Target, Zap, Star, Calendar, TrendingUp, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type PlayerStats = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
  radcoin_balance: number;
  casesResolved: number;
  accuracy: number;
  streak: number;
  specialtyBreakdown?: { specialty: string; cases: number; accuracy: number }[];
  performanceHistory?: { date: string; points: number; rank: number }[];
  achievements?: { name: string; description: string; unlocked_at: string }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats | null;
};

export function PlayerStatsModal({ isOpen, onClose, playerStats }: Props) {
  if (!playerStats) return null;

  const performanceData = playerStats.performanceHistory || [
    { date: '01/12', points: 1200, rank: 15 },
    { date: '08/12', points: 1450, rank: 12 },
    { date: '15/12', points: 1680, rank: 8 },
    { date: '22/12', points: 1890, rank: 6 },
    { date: '29/12', points: 2100, rank: 4 },
  ];

  const specialtyData = playerStats.specialtyBreakdown || [
    { specialty: 'Neurorradiologia', cases: 45, accuracy: 87 },
    { specialty: 'Tórax', cases: 32, accuracy: 92 },
    { specialty: 'Abdome', cases: 28, accuracy: 85 },
    { specialty: 'Musculoesquelético', cases: 25, accuracy: 89 },
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const getPlayerLevel = (points: number) => {
    if (points >= 5000) return { level: "Expert", color: "bg-purple-500", icon: Award };
    if (points >= 2000) return { level: "Especialista", color: "bg-blue-500", icon: Star };
    if (points >= 500) return { level: "Intermediário", color: "bg-green-500", icon: Target };
    return { level: "Iniciante", color: "bg-gray-500", icon: Zap };
  };

  const playerLevel = getPlayerLevel(playerStats.total_points);
  const LevelIcon = playerLevel.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={playerStats.avatar_url} />
              <AvatarFallback>{playerStats.full_name?.[0] || playerStats.username?.[0] || "J"}</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-xl">{playerStats.full_name || playerStats.username}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-white ${playerLevel.color}`}>
                  <LevelIcon size={14} className="mr-1" />
                  {playerLevel.level}
                </Badge>
                <Badge variant="outline">#{playerStats.rank} no ranking</Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-yellow-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Total de Pontos</span>
            </div>
            <div className="text-2xl font-bold text-cyan-700">{playerStats.total_points}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-green-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Casos Resolvidos</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{playerStats.casesResolved}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Precisão</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">{playerStats.accuracy}%</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-orange-500" size={20} />
              <span className="text-sm font-medium text-gray-600">Sequência</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{playerStats.streak}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-500" size={20} />
              Evolução de Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#06b6d4" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Specialty Breakdown */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="text-purple-500" size={20} />
              Especialidades
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ specialty, cases }) => `${specialty.split(' ')[0]} (${cases})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cases"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Specialty Stats */}
        <div className="mt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            Estatísticas por Especialidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialtyData.map((specialty, index) => (
              <div key={specialty.specialty} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{specialty.specialty}</span>
                  <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Casos:</span>
                    <div className="font-bold text-gray-800">{specialty.cases}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Precisão:</span>
                    <div className="font-bold text-gray-800">{specialty.accuracy}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
