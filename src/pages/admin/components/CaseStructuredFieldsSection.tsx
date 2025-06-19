
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { DynamicTagInput } from "./DynamicTagInput";
import { CaseStructuredDataAI } from "./CaseStructuredDataAI";
import { useDynamicSuggestions } from "../hooks/useDynamicSuggestions";
import { toast } from "@/components/ui/use-toast";

type Props = {
  form: any;
  setForm: (form: any) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
};

const TARGET_AUDIENCE_BASE = [
  "Graduação", "Residência R1", "Residência R2", "Residência R3",
  "Especialização", "Mestrado", "Doutorado", "Educação Continuada"
];

const FINDING_TYPES_BASE = [
  "Consolidação", "Massa", "Nódulo", "Derrame", "Pneumotórax", "Atelectasia", 
  "Bronquiectasias", "Cavitação", "Calcificação", "Linfadenopatia", "Fratura", 
  "Luxação", "Edema", "Inflamação"
];

const LEARNING_OBJECTIVES_BASE = [
  "Reconhecer achados radiológicos", "Diferenciar patologias", "Identificar achados específicos", 
  "Avaliar correlação clínica", "Compreender fisiopatologia"
];

export function CaseStructuredFieldsSection({ form, setForm, handleFormChange, renderTooltipTip }: Props) {
  const { suggestions, generateSuggestions } = useDynamicSuggestions();

  // Verificar se diagnóstico principal foi preenchido antes de permitir usar o botão
  const canUseStructuredAI = form.primary_diagnosis?.trim();

  // Aplicar diagnósticos diferenciais automaticamente quando gerados
  useEffect(() => {
    if (suggestions.differential_diagnoses && suggestions.differential_diagnoses.length > 0) {
      // Aplicar exatamente 4 diagnósticos diferenciais
      const differentials = suggestions.differential_diagnoses.slice(0, 4);
      if (JSON.stringify(form.differential_diagnoses) !== JSON.stringify(differentials)) {
        setForm({ ...form, differential_diagnoses: differentials });
        
        toast({
          title: "🤖 Diagnósticos Diferenciais Gerados!",
          description: `${differentials.length} diagnósticos diferenciais baseados no diagnóstico principal.`
        });
      }
    }
  }, [suggestions.differential_diagnoses]);

  const handleTagChange = (field: string, values: string[]) => {
    setForm({ ...form, [field]: values });
  };

  const handleDifferentialChange = (field: string, values: string[]) => {
    // Limitar a exatamente 4 diagnósticos diferenciais
    const limitedValues = values.slice(0, 4);
    setForm({ ...form, [field]: limitedValues });
    
    if (values.length > 4) {
      toast({
        title: "Limite de Diagnósticos Diferenciais",
        description: "Máximo de 4 diagnósticos diferenciais permitidos.",
        variant: "destructive"
      });
    }
  };

  const handleSuggestionsGenerated = async (generatedSuggestions: any) => {
    // Atualizar as sugestões dinâmicas quando o botão AI for clicado
    await generateSuggestions(form.primary_diagnosis);
  };

  return (
    <div className="space-y-6">
      {/* Botão AI Dados Estruturados - ÚNICO e FUNCIONAL */}
      {canUseStructuredAI ? (
        <CaseStructuredDataAI 
          form={form} 
          setForm={setForm}
          onSuggestionsGenerated={handleSuggestionsGenerated}
        />
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">
            💡 Preencha o <strong>Diagnóstico Principal</strong> primeiro para habilitar a AI de Dados Estruturados
          </div>
        </div>
      )}

      {/* Diagnóstico Estruturado */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Sparkles size={20} />
          Diagnóstico Estruturado
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-2">
              Diagnóstico Primário *
              {renderTooltipTip("tip-primary-diagnosis", "Diagnóstico principal do caso - OBRIGATÓRIO para ativar todas as IAs")}
            </label>
            <Input
              name="primary_diagnosis"
              value={form.primary_diagnosis}
              onChange={handleFormChange}
              placeholder="Ex: Pneumonia adquirida na comunidade"
              className="focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-blue-600 mt-1">
              📋 <strong>SEQUÊNCIA:</strong> Diagnóstico → Estruturados → Básicos → Quiz → Explicação → Config
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Classificação do Caso *
              {renderTooltipTip("tip-case-classification", "Tipo de caso para organização pedagógica")}
            </label>
            <Select value={form.case_classification} onValueChange={(value) => setForm({ ...form, case_classification: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="diferencial">Diferencial</SelectItem>
                <SelectItem value="emergencial">Emergencial</SelectItem>
                <SelectItem value="didatico">Didático</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Código CID-10
              {renderTooltipTip("tip-cid10", "Código de classificação internacional de doenças")}
            </label>
            <Input
              name="cid10_code"
              value={form.cid10_code}
              onChange={handleFormChange}
              placeholder="Ex: J44.1"
            />
          </div>
        </div>

        <div className="mt-4">
          <DynamicTagInput
            field="differential_diagnoses"
            value={form.differential_diagnoses || []}
            onChange={handleDifferentialChange}
            placeholder="Digite um diagnóstico diferencial"
            suggestions={suggestions.differential_diagnoses || []}
            loading={false}
            label={`Diagnósticos Diferenciais (${form.differential_diagnoses?.length || 0}/4) 🤖`}
          />
          <div className="text-xs text-gray-600 mt-1">
            Exatamente 4 diagnósticos diferenciais são necessários para o quiz completo
          </div>
        </div>
      </div>

      {/* Achados Radiológicos */}
      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <h3 className="font-semibold text-green-900 mb-4">Achados Radiológicos Estruturados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicTagInput
            field="anatomical_regions"
            value={form.anatomical_regions || []}
            onChange={handleTagChange}
            placeholder="Digite uma região anatômica"
            suggestions={suggestions.anatomical_regions || []}
            loading={false}
            label="Regiões Anatômicas 🤖"
          />

          <DynamicTagInput
            field="finding_types"
            value={form.finding_types || []}
            onChange={handleTagChange}
            placeholder="Digite um tipo de achado"
            suggestions={suggestions.finding_types || FINDING_TYPES_BASE}
            loading={false}
            label="Tipos de Achados 🤖"
          />

          <div>
            <label className="font-semibold block mb-2">
              Lateralidade
              {renderTooltipTip("tip-laterality", "Localização lateral dos achados")}
            </label>
            <Select value={form.laterality} onValueChange={(value) => setForm({ ...form, laterality: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a lateralidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bilateral">Bilateral</SelectItem>
                <SelectItem value="direito">Direito</SelectItem>
                <SelectItem value="esquerdo">Esquerdo</SelectItem>
                <SelectItem value="central">Central</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DynamicTagInput
            field="pathology_types"
            value={form.pathology_types || []}
            onChange={handleTagChange}
            placeholder="Digite um tipo de patologia"
            suggestions={suggestions.pathology_types || []}
            loading={false}
            label="Tipos de Patologia 🤖"
          />
        </div>
      </div>

      {/* Resumo Clínico Estruturado */}
      <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
        <h3 className="font-semibold text-purple-900 mb-4">Resumo Clínico Estruturado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicTagInput
            field="main_symptoms"
            value={form.main_symptoms || []}
            onChange={handleTagChange}
            placeholder="Digite um sintoma"
            suggestions={suggestions.main_symptoms || []}
            loading={false}
            label="Sintomas Principais 🤖"
          />

          <DynamicTagInput
            field="medical_history"
            value={form.medical_history || []}
            onChange={handleTagChange}
            placeholder="Digite um antecedente"
            suggestions={suggestions.medical_history || []}
            loading={false}
            label="Antecedentes Médicos 🤖"
          />
        </div>

        <div className="mt-4">
          <label className="font-semibold block mb-2">
            Sinais Vitais (JSON)
            {renderTooltipTip("tip-vital-signs", "Sinais vitais em formato JSON. Ex: {\"PA\": \"120x80\", \"FC\": \"80\", \"FR\": \"20\"}")}
          </label>
          <Textarea
            name="vital_signs"
            value={JSON.stringify(form.vital_signs, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setForm({ ...form, vital_signs: parsed });
              } catch {
                // Mantém o valor enquanto digita
              }
            }}
            placeholder='{"PA": "120x80", "FC": "80", "FR": "20", "Temp": "36.5"}'
            className="min-h-[80px] font-mono text-sm"
          />
        </div>
      </div>

      {/* Sistema de Tags e Metadados */}
      <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <h3 className="font-semibold text-yellow-900 mb-4">Tags e Metadados Educacionais</h3>
        
        <div className="space-y-4">
          <DynamicTagInput
            field="learning_objectives"
            value={form.learning_objectives || []}
            onChange={handleTagChange}
            placeholder="Digite um objetivo de aprendizado"
            suggestions={suggestions.learning_objectives || LEARNING_OBJECTIVES_BASE}
            loading={false}
            label="Objetivos de Aprendizado 🤖"
          />

          <DynamicTagInput
            field="clinical_presentation_tags"
            value={form.clinical_presentation_tags || []}
            onChange={handleTagChange}
            placeholder="Digite uma tag de apresentação"
            suggestions={suggestions.clinical_presentation_tags || []}
            loading={false}
            label="Apresentação Clínica 🤖"
          />

          <DynamicTagInput
            field="case_complexity_factors"
            value={form.case_complexity_factors || []}
            onChange={handleTagChange}
            placeholder="Digite um fator de complexidade"
            suggestions={suggestions.case_complexity_factors || []}
            loading={false}
            label="Fatores de Complexidade 🤖"
          />

          <DynamicTagInput
            field="search_keywords"
            value={form.search_keywords || []}
            onChange={handleTagChange}
            placeholder="Digite uma palavra-chave"
            suggestions={suggestions.search_keywords || []}
            loading={false}
            label="Palavras-chave para Busca 🤖"
          />
        </div>
      </div>

      {/* Gamificação Avançada */}
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold text-red-900 mb-4">Gamificação Avançada</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-2">
              Raridade do Caso
              {renderTooltipTip("tip-case-rarity", "Quão raro é este caso na prática clínica")}
            </label>
            <Select value={form.case_rarity} onValueChange={(value) => setForm({ ...form, case_rarity: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comum">Comum</SelectItem>
                <SelectItem value="raro">Raro</SelectItem>
                <SelectItem value="muito_raro">Muito Raro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Valor Educacional (1-10)
              {renderTooltipTip("tip-educational-value", "Importância educacional deste caso")}
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={form.educational_value}
              onChange={(e) => setForm({ ...form, educational_value: parseInt(e.target.value) || 5 })}
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Relevância Clínica (1-10)
              {renderTooltipTip("tip-clinical-relevance", "Importância clínica na prática médica")}
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={form.clinical_relevance}
              onChange={(e) => setForm({ ...form, clinical_relevance: parseInt(e.target.value) || 5 })}
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Tempo Estimado (min)
              {renderTooltipTip("tip-solve-time", "Tempo estimado para resolver este caso")}
            </label>
            <Input
              type="number"
              min="1"
              value={form.estimated_solve_time}
              onChange={(e) => setForm({ ...form, estimated_solve_time: parseInt(e.target.value) || 5 })}
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Contexto do Exame
              {renderTooltipTip("tip-exam-context", "Em que contexto este exame foi realizado")}
            </label>
            <Select value={form.exam_context} onValueChange={(value) => setForm({ ...form, exam_context: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rotina">Rotina</SelectItem>
                <SelectItem value="urgencia">Urgência</SelectItem>
                <SelectItem value="uti">UTI</SelectItem>
                <SelectItem value="ambulatorio">Ambulatório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <DynamicTagInput
              field="target_audience"
              value={form.target_audience || []}
              onChange={handleTagChange}
              placeholder="Digite o público-alvo"
              suggestions={suggestions.target_audience || TARGET_AUDIENCE_BASE}
              loading={false}
              label="Público-alvo 🤖"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
