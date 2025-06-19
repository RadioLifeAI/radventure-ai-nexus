
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Search,
  BookOpen,
  Send,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface Props {
  userProgress: any;
}

export function AIPersonalizationPanel({ userProgress }: Props) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "ai",
      message: "Olá! Sou seu assistente de estudos especializado em radiologia. Como posso ajudar hoje?",
      timestamp: new Date()
    }
  ]);

  const smartRecommendations = [
    {
      type: "weakness",
      title: "Foco em RM Neurológica",
      description: "Seus últimos casos mostram dificuldade em RM de crânio. Recomendo revisar anatomia do SNC.",
      cases: ["TC Crânio AVC", "RM Tumor Cerebral", "RM Esclerose"],
      priority: "high"
    },
    {
      type: "strength",
      title: "Consolidar TC Torácica",
      description: "Excelente performance! Que tal casos mais complexos para manter o nível?",
      cases: ["TC Alta Resolução", "Angiotomografia", "TC Funcional"],
      priority: "medium"
    },
    {
      type: "discovery",
      title: "Nova Área: Medicina Nuclear",
      description: "Baseado no seu progresso, você está pronto para explorar PET/CT.",
      cases: ["PET Oncológico", "SPECT Cardíaco", "Cintilografia"],
      priority: "low"
    }
  ];

  const adaptiveChallenges = [
    {
      title: "Desafio Semanal: Diagnóstico Diferencial",
      description: "5 casos com sintomas similares, diferentes diagnósticos",
      difficulty: 4,
      reward: "50 RadCoins + Badge Especialista",
      timeLeft: "3 dias"
    },
    {
      title: "Speed Round: RX Urgência",
      description: "10 casos de emergência em 15 minutos",
      difficulty: 3,
      reward: "30 RadCoins + Streak Bonus",
      timeLeft: "1 dia"
    }
  ];

  const similarCases = [
    {
      id: "1",
      title: "TC Abdome - Pancreatite",
      similarity: 95,
      reason: "Mesmo padrão de densidade, localização similar"
    },
    {
      id: "2", 
      title: "RM Abdome - Hepatite",
      similarity: 87,
      reason: "Sinais inflamatórios comparáveis"
    },
    {
      id: "3",
      title: "US Abdome - Colecistite",
      similarity: 78,
      reason: "Quadro clínico relacionado"
    }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    setChatHistory(prev => [...prev, {
      type: "user",
      message: chatMessage,
      timestamp: new Date()
    }]);

    // Simular resposta da IA
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        type: "ai",
        message: "Baseado no seu histórico, sugiro focar em casos de TC abdominal com contraste. Você tem 85% de acerto nessa área e pode chegar aos 95% com mais prática!",
        timestamp: new Date()
      }]);
    }, 1000);

    setChatMessage("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Companion Chat */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Study Companion - IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-white/5 rounded-lg">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-purple-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Pergunte sobre casos, diagnósticos, técnicas..."
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Recomendações Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {smartRecommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <p className="text-cyan-200 text-xs mb-3">{rec.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.cases.slice(0, 3).map((case_, caseIndex) => (
                    <Badge key={caseIndex} variant="outline" className="text-xs border-cyan-300 text-cyan-300">
                      {case_}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                  <BookOpen className="h-3 w-3 mr-2" />
                  Começar Estudo
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Adaptive Challenges */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border-orange-300/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            Desafios Adaptativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adaptiveChallenges.map((challenge, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/10 border border-orange-300/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{challenge.title}</h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: challenge.difficulty }).map((_, i) => (
                      <Zap key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-orange-200 text-sm mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="border-green-300 text-green-300 text-xs">
                    {challenge.reward}
                  </Badge>
                  <span className="text-orange-300 text-xs">{challenge.timeLeft} restantes</span>
                </div>
                <Button size="sm" className="w-full bg-gradient-to-r from-orange-600 to-red-600">
                  <Sparkles className="h-3 w-3 mr-2" />
                  Aceitar Desafio
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Similar Cases Discovery */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-green-400" />
            Descoberta de Casos Similares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {similarCases.map((case_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{case_.title}</h4>
                  <p className="text-green-200 text-xs">{case_.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-green-300 text-green-300">
                    {case_.similarity}% similar
                  </Badge>
                  <Button size="sm" variant="ghost" className="text-white">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
