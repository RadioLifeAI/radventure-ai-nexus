
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Sparkles } from "lucide-react";

type Props = {
  form: any;
  setForm: (form: any) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
};

const ANATOMICAL_REGIONS = [
  "Crânio", "Pescoço", "Tórax", "Pulmões", "Coração", "Mediastino",
  "Abdome", "Pelve", "Coluna", "Membros Superiores", "Membros Inferiores",
  "Sistema Musculoesquelético", "Sistema Vascular"
];

const FINDING_TYPES = [
  "Consolidação", "Massa", "Nódulo", "Derrame", "Pneumotórax",
  "Atelectasia", "Bronquiectasias", "Cavitação", "Calcificação",
  "Linfadenopatia", "Fratura", "Luxação", "Edema", "Inflamação"
];

const PATHOLOGY_TYPES = [
  "Infeccioso", "Inflamatório", "Neoplásico", "Degenerativo",
  "Traumático", "Vascular", "Congênito", "Metabólico", "Autoimune"
];

const MAIN_SYMPTOMS = [
  "Dor torácica", "Dispneia", "Tosse", "Febre", "Hemoptise",
  "Dor abdominal", "Náuseas", "Vômitos", "Cefaleia", "Tontura",
  "Dor lombar", "Claudicação", "Palpitações"
];

const MEDICAL_HISTORY = [
  "Hipertensão Arterial", "Diabetes Mellitus", "Tabagismo", "Etilismo",
  "Cardiopatia", "Pneumopatia", "Neoplasia prévia", "Cirurgia prévia",
  "Alergia medicamentosa", "Uso de medicamentos"
];

const TARGET_AUDIENCE = [
  "Graduação", "Residência R1", "Residência R2", "Residência R3",
  "Especialização", "Mestrado", "Doutorado", "Educação Continuada"
];

export function CaseStructuredFieldsSection({ form, setForm, handleFormChange, renderTooltipTip }: Props) {
  const addTag = (field: string, value: string) => {
    if (value && !form[field].includes(value)) {
      setForm({ ...form, [field]: [...form[field], value] });
    }
  };

  const removeTag = (field: string, index: number) => {
    const newTags = form[field].filter((_: any, i: number) => i !== index);
    setForm({ ...form, [field]: newTags });
  };

  const TagInput = ({ field, options, placeholder }: { field: string, options: string[], placeholder: string }) => {
    const [inputValue, setInputValue] = React.useState("");

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(field, inputValue);
                setInputValue("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addTag(field, inputValue);
              setInputValue("");
            }}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {options.slice(0, 6).map((option) => (
            <Button
              key={option}
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => addTag(field, option)}
            >
              + {option}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {form[field].map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {tag}
              <X 
                size={12} 
                className="cursor-pointer hover:text-red-500" 
                onClick={() => removeTag(field, index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
              {renderTooltipTip("tip-primary-diagnosis", "Diagnóstico principal do caso")}
            </label>
            <Input
              name="primary_diagnosis"
              value={form.primary_diagnosis}
              onChange={handleFormChange}
              placeholder="Ex: Pneumonia adquirida na comunidade"
              className="focus:ring-2 focus:ring-blue-500"
            />
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
          <label className="font-semibold block mb-2">
            Diagnósticos Diferenciais
            {renderTooltipTip("tip-secondary-diagnoses", "Outros diagnósticos possíveis para este caso")}
          </label>
          <TagInput 
            field="secondary_diagnoses" 
            options={["Tuberculose", "Neoplasia pulmonar", "Pneumonia atípica", "TEP"]}
            placeholder="Digite um diagnóstico diferencial"
          />
        </div>
      </div>

      {/* Achados Radiológicos */}
      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <h3 className="font-semibold text-green-900 mb-4">Achados Radiológicos Estruturados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-2">
              Regiões Anatômicas
              {renderTooltipTip("tip-anatomical-regions", "Regiões anatômicas envolvidas no caso")}
            </label>
            <TagInput 
              field="anatomical_regions" 
              options={ANATOMICAL_REGIONS}
              placeholder="Digite uma região anatômica"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Tipos de Achados
              {renderTooltipTip("tip-finding-types", "Tipos de achados radiológicos presentes")}
            </label>
            <TagInput 
              field="finding_types" 
              options={FINDING_TYPES}
              placeholder="Digite um tipo de achado"
            />
          </div>

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

          <div>
            <label className="font-semibold block mb-2">
              Tipos de Patologia
              {renderTooltipTip("tip-pathology-types", "Classificação patológica dos achados")}
            </label>
            <TagInput 
              field="pathology_types" 
              options={PATHOLOGY_TYPES}
              placeholder="Digite um tipo de patologia"
            />
          </div>
        </div>
      </div>

      {/* Resumo Clínico Estruturado */}
      <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
        <h3 className="font-semibold text-purple-900 mb-4">Resumo Clínico Estruturado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-2">
              Sintomas Principais
              {renderTooltipTip("tip-main-symptoms", "Principais sintomas apresentados pelo paciente")}
            </label>
            <TagInput 
              field="main_symptoms" 
              options={MAIN_SYMPTOMS}
              placeholder="Digite um sintoma"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Antecedentes Médicos
              {renderTooltipTip("tip-medical-history", "História médica pregressa relevante")}
            </label>
            <TagInput 
              field="medical_history" 
              options={MEDICAL_HISTORY}
              placeholder="Digite um antecedente"
            />
          </div>
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
          <div>
            <label className="font-semibold block mb-2">
              Objetivos de Aprendizado
              {renderTooltipTip("tip-learning-objectives", "O que o estudante deve aprender com este caso")}
            </label>
            <TagInput 
              field="learning_objectives" 
              options={["Reconhecer consolidação", "Diferenciar pneumonia de TEP", "Identificar derrame pleural"]}
              placeholder="Digite um objetivo de aprendizado"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Apresentação Clínica
              {renderTooltipTip("tip-clinical-presentation", "Tags que descrevem como o caso se apresenta clinicamente")}
            </label>
            <TagInput 
              field="clinical_presentation_tags" 
              options={["Agudo", "Crônico", "Febril", "Assintomático", "Emergencial"]}
              placeholder="Digite uma tag de apresentação"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Fatores de Complexidade
              {renderTooltipTip("tip-complexity-factors", "O que torna este caso mais desafiador")}
            </label>
            <TagInput 
              field="case_complexity_factors" 
              options={["Múltiplas lesões", "Achado sutil", "Sobreposição de estruturas", "Artefatos"]}
              placeholder="Digite um fator de complexidade"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Palavras-chave para Busca
              {renderTooltipTip("tip-search-keywords", "Palavras-chave que facilitarão a busca deste caso")}
            </label>
            <TagInput 
              field="search_keywords" 
              options={["pneumonia", "consolidação", "radiografia", "tórax"]}
              placeholder="Digite uma palavra-chave"
            />
          </div>
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
            <label className="font-semibold block mb-2">
              Público-alvo
              {renderTooltipTip("tip-target-audience", "Para que nível de estudante este caso é mais adequado")}
            </label>
            <TagInput 
              field="target_audience" 
              options={TARGET_AUDIENCE}
              placeholder="Digite o público-alvo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
