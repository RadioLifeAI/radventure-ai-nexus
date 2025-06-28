
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CaseModalityFieldsUnified } from "./CaseModalityFieldsUnified";
import { Undo2 } from "lucide-react";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";

type Props = {
  form: any;
  setForm: (form: any) => void;
  highlightedFields: string[];
  renderTooltipTip: any;
};

export function CaseProfileBasicSectionWizard({
  form, 
  setForm,
  highlightedFields, 
  renderTooltipTip
}: Props) {
  const { specialties, difficulties, isLoading } = useUnifiedFormDataSource();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "difficulty_level") {
      // Auto-calcular pontos baseado na dificuldade
      const difficultyPoints = {
        1: 5, 2: 10, 3: 15, 4: 20, 5: 25
      };
      setForm((prev: any) => ({
        ...prev,
        [name]: value,
        points: difficultyPoints[parseInt(value) as keyof typeof difficultyPoints] || 10,
      }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleModalityChange = (val: { modality: string; subtype: string }) => {
    setForm((prev: any) => ({ ...prev, modality: val.modality, subtype: val.subtype }));
  };

  // Função para sugerir achados (placeholder - integração com AI virá depois)
  const handleSuggestFindings = () => {
    console.log('Sugerir achados - funcionalidade AI será integrada');
  };

  // Função para sugerir informações clínicas (placeholder)
  const handleSuggestClinicalInfo = () => {
    console.log('Sugerir info clínica - funcionalidade AI será integrada');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados básicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categoria, Dificuldade e Pontos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="font-semibold block mb-2">
            Categoria *
            {renderTooltipTip && renderTooltipTip("tip-category", "Selecione a especialidade médica do caso")}
          </label>
          <select
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              highlightedFields.includes("category_id") ? "ring-2 ring-cyan-400" : ""
            }`}
            name="category_id"
            value={form.category_id || ""}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a categoria</option>
            {specialties.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="font-semibold block mb-2">
            Dificuldade *
            {renderTooltipTip && renderTooltipTip("tip-difficulty", "Nível de dificuldade do caso clínico")}
          </label>
          <select
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              highlightedFields.includes("difficulty_level") ? "ring-2 ring-cyan-400" : ""
            }`}
            name="difficulty_level"
            value={form.difficulty_level || ""}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a dificuldade</option>
            {difficulties.map(d => (
              <option key={d.id} value={d.level}>
                {d.description ? `${d.level} - ${d.description}` : `Nível ${d.level}`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="font-semibold block mb-2">
            Pontos *
            {renderTooltipTip && renderTooltipTip("tip-points", "Pontuação que o usuário ganhará ao acertar")}
          </label>
          <Input
            name="points"
            type="number"
            value={form.points || ""}
            min={1}
            onChange={handleFormChange}
            placeholder="Ex: 10"
            required
            className={`focus:ring-2 focus:ring-cyan-500 ${
              highlightedFields.includes("points") ? "ring-2 ring-cyan-400" : ""
            }`}
          />
        </div>
      </div>

      {/* Modalidade e Subtipo */}
      <div>
        <label className="font-semibold block mb-2">
          Modalidade e Subtipo *
          {renderTooltipTip && renderTooltipTip("tip-modality", "Tipo de exame e sua especificação")}
        </label>
        <CaseModalityFieldsUnified 
          value={{ modality: form.modality || "", subtype: form.subtype || "" }} 
          onChange={handleModalityChange} 
        />
      </div>

      {/* Título do Caso */}
      <div>
        <label className="font-semibold block mb-2">
          Título do Caso
          {renderTooltipTip && renderTooltipTip("tip-title", "Será gerado automaticamente baseado nos dados selecionados")}
        </label>
        <Input
          name="title"
          value={form.title || ""}
          onChange={handleFormChange}
          placeholder="Será gerado automaticamente ao salvar"
          className={`bg-gray-50 ${
            highlightedFields.includes("title") ? "ring-2 ring-cyan-400" : ""
          }`}
        />
      </div>

      {/* Achados Radiológicos */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="font-semibold flex-1">
            Achados Radiológicos *
            {renderTooltipTip && renderTooltipTip("tip-findings", "Descreva os principais achados do exame")}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-cyan-700 border border-cyan-200"
            onClick={handleSuggestFindings}
            title="Gerar sugestão de achados radiológicos via IA"
          >
            Sugerir IA
          </Button>
        </div>
        <Textarea 
          name="findings" 
          value={form.findings || ""} 
          onChange={handleFormChange} 
          placeholder="Descreva os achados radiológicos encontrados no exame..." 
          required 
          className={`min-h-[120px] focus:ring-2 focus:ring-cyan-500 ${
            highlightedFields.includes("findings") ? "ring-2 ring-cyan-400" : ""
          }`} 
        />
      </div>

      {/* Resumo Clínico */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="font-semibold flex-1">
            Resumo Clínico *
            {renderTooltipTip && renderTooltipTip("tip-clinical", "Informações clínicas relevantes do paciente")}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-cyan-700 border border-cyan-200"
            onClick={handleSuggestClinicalInfo}
            title="Gerar sugestão de resumo clínico via IA"
          >
            Sugerir IA
          </Button>
        </div>
        <Textarea 
          name="patient_clinical_info" 
          value={form.patient_clinical_info || ""} 
          onChange={handleFormChange} 
          placeholder="Breve histórico clínico e informações relevantes do paciente..." 
          required 
          className={`min-h-[120px] focus:ring-2 focus:ring-cyan-500 ${
            highlightedFields.includes("patient_clinical_info") ? "ring-2 ring-cyan-400" : ""
          }`} 
        />
      </div>
    </div>
  );
}
