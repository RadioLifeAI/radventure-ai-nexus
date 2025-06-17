
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventBannerUpload } from "./EventBannerUpload";
import { EventTemplatesModal } from "./EventTemplatesModal";
import { EventAISuggestions } from "./EventAISuggestions";
import { CaseFiltersGamifiedSection } from "./CaseFiltersGamifiedSection";
import { CaseFilterStatsBar } from "./CaseFilterStatsBar";
import { useCaseFiltersStats } from "../hooks/useCaseFiltersStats";
import { EventConfigProgressBar } from "./EventConfigProgressBar";
import { useEventConfigProgress } from "../hooks/useEventConfigProgress";
import { ConfigAlertBanner } from "./ConfigAlertBanner";
import { EventConfigMotivationPhrase } from "./EventConfigMotivationPhrase";

export type Prize = { position: number, prize: number };

type Props = {
  mode: "create" | "edit";
  initialValues?: any;
  loading?: boolean;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
};

export function EventForm({ mode, initialValues = {}, loading, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialValues.name ?? "");
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [scheduledStart, setScheduledStart] = useState(initialValues.scheduled_start ?? "");
  const [scheduledEnd, setScheduledEnd] = useState(initialValues.scheduled_end ?? "");
  const [prizeRadcoins, setPrizeRadcoins] = useState(initialValues.prize_radcoins ?? 1000);
  const [numberOfCases, setNumberOfCases] = useState(initialValues.number_of_cases ?? 10);
  const [durationMinutes, setDurationMinutes] = useState(initialValues.duration_minutes ?? 30);
  const [maxParticipants, setMaxParticipants] = useState(
    initialValues.max_participants === null || initialValues.max_participants === undefined
      ? ""
      : initialValues.max_participants
  );
  const [bannerUrl, setBannerUrl] = useState(initialValues.banner_url ?? "");
  const [autoStart, setAutoStart] = useState(initialValues.auto_start ?? true);
  const [prizeDistribution, setPrizeDistribution] = useState<Prize[]>(
    initialValues.prize_distribution ??
      [
        { position: 1, prize: 500 },
        { position: 2, prize: 200 },
        { position: 3, prize: 100 },
        { position: 4, prize: 50 },
        { position: 5, prize: 40 },
        { position: 6, prize: 30 },
        { position: 7, prize: 30 },
        { position: 8, prize: 20 },
        { position: 9, prize: 15 },
        { position: 10, prize: 10 },
      ]
  );
  const [caseFilters, setCaseFilters] = useState(initialValues.case_filters ?? {});
  const [showTemplates, setShowTemplates] = useState(false);

  // Estatísticas filtros (real time)
  const { stats, loading: statsLoading } = useCaseFiltersStats(caseFilters);
  const progress = useEventConfigProgress({
    name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, caseFilters
  });

  // Validação rápida e warnings
  let alertMsg = "";
  if ((!!caseFilters && Object.keys(caseFilters).length > 0) && stats.count < numberOfCases) {
    alertMsg = `Atenção: Apenas ${stats.count} casos disponíveis para os filtros selecionados (menos que o número de casos do evento).`;
  }

  function handlePrizeChange(index: number, value: number) {
    setPrizeDistribution((old) =>
      old.map((p, i) => (i === index ? { ...p, prize: value } : p))
    );
  }

  function handleApplyTemplate(tpl: any) {
    setCaseFilters(tpl.filters || {});
    setName(tpl.title || "");
    setNumberOfCases(tpl.numberOfCases || 10);
    setDurationMinutes(tpl.durationMinutes || 30);
    setPrizeRadcoins(tpl.prizeRadcoins || 500);
    setAutoStart(tpl.autoStart ?? true);
    setShowTemplates(false);
  }

  function handleAISuggestion(suggestion: any) {
    setName(suggestion.name || "");
    setDescription(suggestion.description || "");
    setNumberOfCases(suggestion.numberOfCases || 10);
    setDurationMinutes(suggestion.durationMinutes || 30);
    setPrizeRadcoins(suggestion.prizeRadcoins || 500);
    
    // Aplicar filtros baseados na sugestão
    if (suggestion.specialty || suggestion.modality) {
      setCaseFilters({
        ...caseFilters,
        ...(suggestion.specialty && { specialty: [suggestion.specialty] }),
        ...(suggestion.modality && { modality: [suggestion.modality] })
      });
    }
  }

  function handleAutoFill(data: any) {
    setName(data.name || "");
    setDescription(data.description || "");
    setNumberOfCases(data.numberOfCases || 10);
    setDurationMinutes(data.durationMinutes || 30);
    setPrizeRadcoins(data.prizeRadcoins || 500);
    setAutoStart(data.autoStart ?? true);
    if (data.caseFilters) {
      setCaseFilters(data.caseFilters);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      prize_radcoins: prizeRadcoins,
      number_of_cases: numberOfCases,
      duration_minutes: durationMinutes,
      max_participants: maxParticipants === "" ? null : maxParticipants,
      banner_url: bannerUrl,
      auto_start: autoStart,
      prize_distribution: prizeDistribution,
      case_filters: caseFilters,
      // O modo edit pode receber id e campos extras
      ...(mode === "edit" ? { id: initialValues.id } : {})
    });
  }

  // Atualizar valores quando mudar evento editado
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setName(initialValues.name ?? "");
      setDescription(initialValues.description ?? "");
      setScheduledStart(initialValues.scheduled_start ?? "");
      setScheduledEnd(initialValues.scheduled_end ?? "");
      setPrizeRadcoins(initialValues.prize_radcoins ?? 1000);
      setNumberOfCases(initialValues.number_of_cases ?? 10);
      setDurationMinutes(initialValues.duration_minutes ?? 30);
      setMaxParticipants(
        initialValues.max_participants === null || initialValues.max_participants === undefined
          ? ""
          : initialValues.max_participants
      );
      setBannerUrl(initialValues.banner_url ?? "");
      setAutoStart(initialValues.auto_start ?? true);
      setPrizeDistribution(
        initialValues.prize_distribution ??
        [
          { position: 1, prize: 500 },
          { position: 2, prize: 200 },
          { position: 3, prize: 100 },
          { position: 4, prize: 50 },
          { position: 5, prize: 40 },
          { position: 6, prize: 30 },
          { position: 7, prize: 30 },
          { position: 8, prize: 20 },
          { position: 9, prize: 15 },
          { position: 10, prize: 10 },
        ]
      );
      setCaseFilters(initialValues.case_filters ?? {});
    }
  }, [mode, initialValues]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="space-y-4">
        <EventConfigMotivationPhrase />
        <EventConfigProgressBar percent={progress} />
        <CaseFilterStatsBar stats={stats} loading={statsLoading} />
        <ConfigAlertBanner message={alertMsg} />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Novo Evento" : "Editar Evento"}
        </h2>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowTemplates(true)}
          >
            Templates Rápidos
          </Button>
        </div>
      </div>

      {/* Assistente IA */}
      <EventAISuggestions 
        onApplySuggestion={handleAISuggestion}
        onAutoFill={handleAutoFill}
        currentFilters={caseFilters}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CaseFiltersGamifiedSection value={caseFilters} onChange={setCaseFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do evento *
            </label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do evento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner do evento
            </label>
            <EventBannerUpload value={bannerUrl} onChange={setBannerUrl} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Descreva o evento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Início *
            </label>
            <input 
              type="datetime-local" 
              value={scheduledStart} 
              onChange={e => setScheduledStart(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Término *
            </label>
            <input 
              type="datetime-local" 
              value={scheduledEnd} 
              onChange={e => setScheduledEnd(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total em RadCoins
            </label>
            <input 
              type="number" 
              value={prizeRadcoins} 
              onChange={e => setPrizeRadcoins(Number(e.target.value))} 
              min={0} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nº de casos do evento
            </label>
            <input 
              type="number" 
              value={numberOfCases} 
              onChange={e => setNumberOfCases(Number(e.target.value))} 
              min={1} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração total (minutos)
            </label>
            <input 
              type="number" 
              value={durationMinutes} 
              onChange={e => setDurationMinutes(Number(e.target.value))} 
              min={1} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de participantes
            </label>
            <input 
              type="number" 
              value={maxParticipants === null ? "" : maxParticipants} 
              onChange={e => setMaxParticipants(e.target.value === "" ? "" : Number(e.target.value))} 
              min={1} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sem limite"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={autoStart} 
                onChange={e => setAutoStart(e.target.checked)} 
                id="autoStart" 
                className="rounded"
              />
              <label htmlFor="autoStart" className="text-sm font-medium text-gray-700">
                Início automático
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Premiação (RadCoins para cada posição)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {prizeDistribution.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.position}º:</span>
                  <input
                    type="number"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={p.prize}
                    min={0}
                    onChange={e => handlePrizeChange(i, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              mode === "create" ? "Criar Evento" : "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>

      {showTemplates && (
        <EventTemplatesModal
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
