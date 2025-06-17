
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Users, Clock, Calendar, DollarSign, Settings, Target } from "lucide-react";

interface EventFormBodyProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  scheduledStart: string;
  setScheduledStart: (value: string) => void;
  scheduledEnd: string;
  setScheduledEnd: (value: string) => void;
  prizeRadcoins: number;
  setPrizeRadcoins: (value: number) => void;
  numberOfCases: number;
  setNumberOfCases: (value: number) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  maxParticipants: string | number;
  setMaxParticipants: (value: string | number) => void;
  autoStart: boolean;
  setAutoStart: (value: boolean) => void;
  loading: boolean;
}

export function EventFormBody({
  name, setName, description, setDescription, scheduledStart, setScheduledStart,
  scheduledEnd, setScheduledEnd, prizeRadcoins, setPrizeRadcoins, numberOfCases,
  setNumberOfCases, durationMinutes, setDurationMinutes, maxParticipants,
  setMaxParticipants, autoStart, setAutoStart, loading
}: EventFormBodyProps) {
  return (
    <div className="grid gap-6">
      {/* Informações Básicas */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-5 w-5 text-yellow-500" />
            Informações Básicas
            <Badge className="bg-blue-500 text-white">Essencial</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">
              🎯 Título do evento *
            </label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Desafio de Radiologia Torácica"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">
              📝 Descrição do evento
            </label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] transition-all"
              placeholder="Descreva os objetivos e detalhes do evento..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Cronograma */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Calendar className="h-5 w-5 text-purple-500" />
            Cronograma do Evento
            <Badge className="bg-purple-500 text-white">Timing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-2">
              🚀 Data/Hora de Início *
            </label>
            <input 
              type="datetime-local" 
              value={scheduledStart} 
              onChange={e => setScheduledStart(e.target.value)} 
              required 
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-2">
              🏁 Data/Hora de Término *
            </label>
            <input 
              type="datetime-local" 
              value={scheduledEnd} 
              onChange={e => setScheduledEnd(e.target.value)} 
              required 
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-2">
              ⏱️ Duração Total (minutos)
            </label>
            <input 
              type="number" 
              value={durationMinutes} 
              onChange={e => setDurationMinutes(Number(e.target.value))} 
              min={1} 
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <input 
              type="checkbox" 
              checked={autoStart} 
              onChange={e => setAutoStart(e.target.checked)} 
              id="autoStart" 
              className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="autoStart" className="text-sm font-semibold text-purple-700 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Início automático (recomendado)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Jogo */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5 text-green-500" />
            Configurações de Gamificação
            <Badge className="bg-green-500 text-white">Gameplay</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2">
              🧠 Número de Casos
            </label>
            <input 
              type="number" 
              value={numberOfCases} 
              onChange={e => setNumberOfCases(Number(e.target.value))} 
              min={1} 
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2">
              👥 Limite de Participantes
            </label>
            <input 
              type="number" 
              value={maxParticipants === null ? "" : maxParticipants} 
              onChange={e => setMaxParticipants(e.target.value === "" ? "" : Number(e.target.value))} 
              min={1} 
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Sem limite"
            />
          </div>
        </CardContent>
      </Card>

      {/* Premiação */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Sistema de Premiação
            <Badge className="bg-yellow-500 text-white">RadCoins</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-semibold text-yellow-700 mb-2">
              💰 Total em RadCoins para Premiação
            </label>
            <input 
              type="number" 
              value={prizeRadcoins} 
              onChange={e => setPrizeRadcoins(Number(e.target.value))} 
              min={0} 
              className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-lg font-bold"
            />
            <p className="text-sm text-yellow-600 mt-2">
              💡 Será distribuído automaticamente entre os primeiros colocados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
