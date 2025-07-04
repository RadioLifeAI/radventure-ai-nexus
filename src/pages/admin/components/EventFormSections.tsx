
import React from "react";
import { CaseFormGamifiedLayout } from "./CaseFormGamifiedLayout";
import { EventBannerUpload } from "./EventBannerUpload";
import { EventFormPrizeDistribution } from "./EventFormPrizeDistribution";

interface BasicInfoSectionProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  bannerUrl: string;
  setBannerUrl: (value: string) => void;
  eventId?: string; // Para permitir upload do banner
}

export function BasicInfoSection({ name, setName, description, setDescription, bannerUrl, setBannerUrl, eventId }: BasicInfoSectionProps) {
  return (
    <CaseFormGamifiedLayout
      section="basic"
      title="Informações Básicas do Evento"
      description="Configure o título, descrição e banner do evento"
      progress={100}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
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
          <label className="block text-sm font-medium text-blue-700 mb-2">
            📝 Descrição do evento
          </label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] transition-all"
            placeholder="Descreva os objetivos e detalhes do evento..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            🖼️ Banner do evento
          </label>
          {eventId ? (
            <EventBannerUpload value={bannerUrl} onChange={setBannerUrl} eventId={eventId} />
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">
                Banner será habilitado após salvar o evento
              </p>
            </div>
          )}
        </div>
      </div>
    </CaseFormGamifiedLayout>
  );
}

interface ScheduleSectionProps {
  scheduledStart: string;
  setScheduledStart: (value: string) => void;
  scheduledEnd: string;
  setScheduledEnd: (value: string) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  autoStart: boolean;
  setAutoStart: (value: boolean) => void;
}

export function ScheduleSection({ 
  scheduledStart, setScheduledStart, scheduledEnd, setScheduledEnd, 
  durationMinutes, setDurationMinutes, autoStart, setAutoStart 
}: ScheduleSectionProps) {
  return (
    <CaseFormGamifiedLayout
      section="clinical"
      title="Cronograma do Evento"
      description="Defina as datas e horários para o evento"
      progress={100}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            🚀 Data/Hora de Início *
          </label>
          <input 
            type="datetime-local" 
            value={scheduledStart} 
            onChange={e => setScheduledStart(e.target.value)} 
            required 
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            🏁 Data/Hora de Término *
          </label>
          <input 
            type="datetime-local" 
            value={scheduledEnd} 
            onChange={e => setScheduledEnd(e.target.value)} 
            required 
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            ⏱️ Duração Total (minutos)
          </label>
          <input 
            type="number" 
            value={durationMinutes} 
            onChange={e => setDurationMinutes(Number(e.target.value))} 
            min={1} 
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <input 
            type="checkbox" 
            checked={autoStart} 
            onChange={e => setAutoStart(e.target.checked)} 
            id="autoStart" 
            className="w-5 h-5 text-green-600 border-2 border-green-300 rounded focus:ring-green-500"
          />
          <label htmlFor="autoStart" className="text-sm font-medium text-green-700">
            ⚡ Início automático (recomendado)
          </label>
        </div>
      </div>
    </CaseFormGamifiedLayout>
  );
}

interface GameConfigSectionProps {
  numberOfCases: number;
  setNumberOfCases: (value: number) => void;
  maxParticipants: string | number;
  setMaxParticipants: (value: string | number) => void;
  prizeRadcoins: number;
  setPrizeRadcoins: (value: number) => void;
}

export function GameConfigSection({ 
  numberOfCases, setNumberOfCases, maxParticipants, setMaxParticipants, 
  prizeRadcoins, setPrizeRadcoins 
}: GameConfigSectionProps) {
  return (
    <CaseFormGamifiedLayout
      section="gamification"
      title="Configurações de Gamificação"
      description="Configure as regras e prêmios do evento"
      progress={100}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-amber-700 mb-2">
            🧠 Número de Casos
          </label>
          <input 
            type="number" 
            value={numberOfCases} 
            onChange={e => setNumberOfCases(Number(e.target.value))} 
            min={1} 
            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-amber-700 mb-2">
            👥 Limite de Participantes
          </label>
          <input 
            type="number" 
            value={maxParticipants === null ? "" : maxParticipants} 
            onChange={e => setMaxParticipants(e.target.value === "" ? "" : Number(e.target.value))} 
            min={1} 
            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="Sem limite"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-amber-700 mb-2">
            💰 Total em RadCoins para Premiação
          </label>
          <input 
            type="number" 
            value={prizeRadcoins} 
            onChange={e => setPrizeRadcoins(Number(e.target.value))} 
            min={0} 
            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg font-bold"
          />
          <p className="text-sm text-amber-600 mt-2">
            💡 Será distribuído automaticamente entre os primeiros colocados
          </p>
        </div>
      </div>
    </CaseFormGamifiedLayout>
  );
}

interface PrizeDistributionSectionProps {
  prizeDistribution: Array<{ position: number; prize: number }>;
  onPrizeChange: (index: number, value: number) => void;
}

export function PrizeDistributionSection({ prizeDistribution, onPrizeChange }: PrizeDistributionSectionProps) {
  return (
    <CaseFormGamifiedLayout
      section="advanced"
      title="Distribuição de Prêmios"
      description="Configure a premiação para cada posição no ranking"
      progress={100}
    >
      <EventFormPrizeDistribution 
        prizeDistribution={prizeDistribution} 
        onPrizeChange={onPrizeChange} 
      />
    </CaseFormGamifiedLayout>
  );
}
