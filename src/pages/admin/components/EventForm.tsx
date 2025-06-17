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
import { EventFormHeader } from "./EventFormHeader";
import { toast } from "@/hooks/use-toast";

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
    
    // CORREÇÃO CRÍTICA: Mapear specialty -> category e aplicar todos os filtros
    if (suggestion.specialty || suggestion.modality || suggestion.subtype || suggestion.difficulty) {
      const newFilters: any = { ...caseFilters };
      
      if (suggestion.specialty) {
        newFilters.category = [suggestion.specialty];
      }
      if (suggestion.modality) {
        newFilters.modality = [suggestion.modality];
      }
      if (suggestion.subtype) {
        newFilters.subtype = [suggestion.subtype];
      }
      if (suggestion.difficulty) {
        newFilters.difficulty = [suggestion.difficulty.toString()];
      }
      
      setCaseFilters(newFilters);
      
      toast({
        title: "Sugestão aplicada!",
        description: "Campos básicos e filtros preenchidos com dados da IA",
        className: "bg-blue-50 border-blue-200"
      });
    }
  }

  function handleAutoFill(data: any) {
    console.log("Auto-fill data received:", data);
    
    let fieldsUpdated: string[] = [];
    
    // Preencher campos básicos
    if (data.name) {
      setName(data.name);
      fieldsUpdated.push("nome");
    }
    if (data.description) {
      setDescription(data.description);
      fieldsUpdated.push("descrição");
    }
    if (data.numberOfCases) {
      setNumberOfCases(data.numberOfCases);
      fieldsUpdated.push("número de casos");
    }
    if (data.durationMinutes) {
      setDurationMinutes(data.durationMinutes);
      fieldsUpdated.push("duração");
    }
    if (data.prizeRadcoins) {
      setPrizeRadcoins(data.prizeRadcoins);
      fieldsUpdated.push("prêmio total");
    }
    
    // SEMPRE true para auto-preenchimento
    setAutoStart(true);
    fieldsUpdated.push("início automático");
    
    // CORREÇÃO CRÍTICA: Aplicar datas corretamente
    if (data.scheduled_start) {
      setScheduledStart(data.scheduled_start);
      fieldsUpdated.push("data de início");
    }
    if (data.scheduled_end) {
      setScheduledEnd(data.scheduled_end);
      fieldsUpdated.push("data de término");
    }
    
    // CORREÇÃO: Preencher max participants
    if (data.maxParticipants) {
      setMaxParticipants(data.maxParticipants);
      fieldsUpdated.push("limite de participantes");
    }
    
    // CORREÇÃO: Aplicar banner URL se fornecido
    if (data.bannerUrl !== undefined) {
      setBannerUrl(data.bannerUrl);
      if (data.bannerUrl) fieldsUpdated.push("banner");
    }
    
    // CORREÇÃO CRÍTICA: Aplicar distribuição de prêmios completa
    if (data.prize_distribution && Array.isArray(data.prize_distribution)) {
      setPrizeDistribution(data.prize_distribution);
      fieldsUpdated.push("distribuição de prêmios");
    }
    
    // CORREÇÃO CRÍTICA: Mapear filtros corretamente (specialty -> category)
    if (data.caseFilters) {
      const mappedFilters: any = {};
      
      // Mapear specialty para category (CORREÇÃO PRINCIPAL)
      if (data.caseFilters.specialty && Array.isArray(data.caseFilters.specialty)) {
        mappedFilters.category = data.caseFilters.specialty;
        fieldsUpdated.push("especialidades");
      }
      
      // Aplicar outros filtros diretamente
      if (data.caseFilters.modality) {
        mappedFilters.modality = data.caseFilters.modality;
        fieldsUpdated.push("modalidades");
      }
      if (data.caseFilters.subtype) {
        mappedFilters.subtype = data.caseFilters.subtype;
        fieldsUpdated.push("subtipos");
      }
      if (data.caseFilters.difficulty) {
        mappedFilters.difficulty = data.caseFilters.difficulty.map((d: any) => d.toString());
        fieldsUpdated.push("dificuldades");
      }
      
      setCaseFilters(mappedFilters);
    }
    
    // Toast específico de sucesso com campos preenchidos
    toast({
      title: "✨ Auto-preenchimento concluído!",
      description: `Campos preenchidos: ${fieldsUpdated.join(", ")}`,
      className: "bg-green-50 border-green-200"
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validação robusta antes do submit
    const missingFields: string[] = [];
    
    if (!name.trim()) missingFields.push("nome");
    if (!scheduledStart) missingFields.push("data de início");
    if (!scheduledEnd) missingFields.push("data de término");
    if (numberOfCases < 1) missingFields.push("número de casos válido");
    if (durationMinutes < 1) missingFields.push("duração válida");
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Preencha: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
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
    <div className="max-w-4xl mx-auto space-y-6">
      <EventFormHeader 
        mode={mode} 
        onShowTemplates={() => setShowTemplates(true)} 
      />

      <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
        <div className="space-y-4">
          <EventConfigMotivationPhrase />
          <EventConfigProgressBar percent={progress} />
          <CaseFilterStatsBar stats={stats} loading={statsLoading} />
          <ConfigAlertBanner message={alertMsg} />
        </div>

        <EventAISuggestions 
          onApplySuggestion={handleAISuggestion}
          onAutoFill={handleAutoFill}
          currentFilters={caseFilters}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Filtros de casos com dados reais unificados */}
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
                  Início automático (recomendado)
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
    </div>
  );
}
