
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Target,
  BarChart3
} from "lucide-react";

interface TimeSlot {
  time: string;
  score: number;
  expectedParticipants: number;
  competitionLevel: "low" | "medium" | "high";
  audienceAvailability: number;
  reasons: string[];
}

interface ScheduleRecommendation {
  date: Date;
  dayOfWeek: string;
  timeSlots: TimeSlot[];
  overallScore: number;
  specialEvents: string[];
  warnings: string[];
}

const MOCK_SCHEDULE_DATA: ScheduleRecommendation[] = [
  {
    date: new Date(2024, 11, 10), // 10 de dezembro de 2024
    dayOfWeek: "Terça-feira",
    overallScore: 92,
    specialEvents: [],
    warnings: [],
    timeSlots: [
      {
        time: "19:30",
        score: 95,
        expectedParticipants: 87,
        competitionLevel: "low",
        audienceAvailability: 89,
        reasons: ["Pico de atividade noturna", "Baixa concorrência", "Alta disponibilidade do público-alvo"]
      },
      {
        time: "20:00",
        score: 88,
        expectedParticipants: 76,
        competitionLevel: "medium",
        audienceAvailability: 82,
        reasons: ["Boa atividade noturna", "Concorrência moderada"]
      },
      {
        time: "14:00",
        score: 72,
        expectedParticipants: 54,
        competitionLevel: "high",
        audienceAvailability: 65,
        reasons: ["Horário de trabalho", "Alta concorrência"]
      }
    ]
  },
  {
    date: new Date(2024, 11, 12), // 12 de dezembro de 2024
    dayOfWeek: "Quinta-feira",
    overallScore: 85,
    specialEvents: ["Congresso de Radiologia (Online)"],
    warnings: ["Evento concorrente detectado"],
    timeSlots: [
      {
        time: "19:00",
        score: 89,
        expectedParticipants: 82,
        competitionLevel: "medium",
        audienceAvailability: 87,
        reasons: ["Boa atividade noturna", "Evento concorrente às 20h"]
      },
      {
        time: "21:00",
        score: 78,
        expectedParticipants: 68,
        competitionLevel: "low",
        audienceAvailability: 75,
        reasons: ["Tarde para alguns fusos", "Baixa concorrência"]
      }
    ]
  },
  {
    date: new Date(2024, 11, 14), // 14 de dezembro de 2024
    dayOfWeek: "Sábado",
    overallScore: 68,
    specialEvents: [],
    warnings: ["Menor engajamento em fins de semana"],
    timeSlots: [
      {
        time: "10:00",
        score: 75,
        expectedParticipants: 45,
        competitionLevel: "low",
        audienceAvailability: 58,
        reasons: ["Fim de semana", "Manhã de sábado tem boa receptividade"]
      },
      {
        time: "15:00",
        score: 62,
        expectedParticipants: 38,
        competitionLevel: "low",
        audienceAvailability: 48,
        reasons: ["Tarde de sábado", "Engajamento reduzido"]
      }
    ]
  }
];

interface Props {
  onSelectSchedule: (date: Date, time: string) => void;
  onGenerateOptions: (preferences: any) => void;
  currentEvent?: any;
}

export function EventSmartScheduler({ onSelectSchedule, onGenerateOptions, currentEvent }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [recommendations, setRecommendations] = useState<ScheduleRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    targetAudience: "residents",
    duration: "30",
    priority: "engagement"
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // Simular carregamento de recomendações
    setLoading(true);
    setTimeout(() => {
      setRecommendations(MOCK_SCHEDULE_DATA);
      setLoading(false);
    }, 1500);
  }, [preferences]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 75) return "bg-yellow-100";
    if (score >= 60) return "bg-orange-100";
    return "bg-red-100";
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "high": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Agendamento Inteligente com IA
          </CardTitle>
          <p className="text-sm text-gray-600">
            Encontre os melhores horários baseado em dados históricos e padrões de comportamento
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Público-alvo</label>
              <Select 
                value={preferences.targetAudience} 
                onValueChange={(value) => setPreferences({...preferences, targetAudience: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Estudantes</SelectItem>
                  <SelectItem value="residents">Residentes</SelectItem>
                  <SelectItem value="specialists">Especialistas</SelectItem>
                  <SelectItem value="mixed">Público Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duração do evento</label>
              <Select 
                value={preferences.duration} 
                onValueChange={(value) => setPreferences({...preferences, duration: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Prioridade</label>
              <Select 
                value={preferences.priority} 
                onValueChange={(value) => setPreferences({...preferences, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Máximo Engajamento</SelectItem>
                  <SelectItem value="participants">Máximos Participantes</SelectItem>
                  <SelectItem value="completion">Taxa de Conclusão</SelectItem>
                  <SelectItem value="competition">Baixa Concorrência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button 
              onClick={() => onGenerateOptions(preferences)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Gerar Recomendações
            </Button>
            
            <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ver Calendário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Selecionar Data</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações por data */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    {formatDate(recommendation.date)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Score geral: <span className={`font-semibold ${getScoreColor(recommendation.overallScore)}`}>
                      {recommendation.overallScore}/100
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(recommendation.overallScore)}`}>
                    {recommendation.overallScore}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>

              {/* Avisos e eventos especiais */}
              {recommendation.warnings.length > 0 && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {recommendation.warnings.join(", ")}
                  </AlertDescription>
                </Alert>
              )}

              {recommendation.specialEvents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-blue-600 mb-1">Eventos Especiais:</p>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.specialEvents.map((event, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {recommendation.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className={`p-4 rounded-lg border ${getScoreBg(slot.score)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-gray-800">
                          {slot.time}
                        </div>
                        <Badge className={getCompetitionColor(slot.competitionLevel)}>
                          {slot.competitionLevel === "low" ? "Baixa Concorrência" :
                           slot.competitionLevel === "medium" ? "Média Concorrência" :
                           "Alta Concorrência"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-bold ${getScoreColor(slot.score)}`}>
                          {slot.score}/100
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => onSelectSchedule(recommendation.date, slot.time)}
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          <span className="font-medium">{slot.expectedParticipants}</span> participantes esperados
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          <span className="font-medium">{slot.audienceAvailability}%</span> disponibilidade
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Por que este horário:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {slot.reasons.map((reason, reasonIndex) => (
                          <li key={reasonIndex}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analisando dados e gerando recomendações...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
