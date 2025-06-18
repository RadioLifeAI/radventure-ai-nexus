
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CaseModalityFieldsUnified } from "./CaseModalityFieldsUnified";
import { Undo2 } from "lucide-react";
import { ImageUploadWithZoom } from "./ImageUploadWithZoom";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";

type Props = {
  form: any;
  highlightedFields: string[];
  handleFormChange: any;
  handleModalityChange: any;
  handleAutoFillCaseDetails: any;
  handleImageChange: any;
  renderTooltipTip: any;
  handleSuggestFindings: any;
  handleSuggestClinicalInfo: any;
  undoFindings: any;
  undoClinical: any;
  setForm: any;
  autoTitlePreview?: string;
  onGenerateAutoTitle?: () => void;
};

export function CaseProfileBasicSectionUnified({
  form, highlightedFields, handleFormChange,
  handleModalityChange, handleAutoFillCaseDetails, handleImageChange, renderTooltipTip,
  handleSuggestFindings, handleSuggestClinicalInfo,
  undoFindings, undoClinical, setForm,
  autoTitlePreview, onGenerateAutoTitle
}: Props) {
  const { specialties, difficulties, isLoading } = useUnifiedFormDataSource();

  function handleImagesChange(imgArr: { url: string; legend: string }[]) {
    handleImageChange(imgArr);
  }
  
  const imagesValue = Array.isArray(form.image_url)
    ? form.image_url
    : (typeof form.image_url === "string" && form.image_url.trim() !== ""
      ? (() => {
        try {
          const arr = JSON.parse(form.image_url);
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })()
      : []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados unificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categoria/Dificuldade/Pontos com melhor espaçamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="font-semibold block mb-2">Categoria * (Dados Unificados)</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            name="category_id"
            value={form.category_id}
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
          <label className="font-semibold block mb-2">Dificuldade * (Dados Unificados)</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            name="difficulty_level"
            value={form.difficulty_level}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a dificuldade</option>
            {difficulties.map(d => (
              <option key={d.id} value={d.level}>
                {d.description ? `${d.level} - ${d.description}` : d.level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold block mb-2">Pontos *</label>
          <Input
            name="points"
            type="number"
            value={form.points}
            min={1}
            onChange={handleFormChange}
            placeholder="Ex: 10"
            required
            className="focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Modalidade/Subtipo - Usando dados unificados */}
      <div>
        <CaseModalityFieldsUnified 
          value={{ modality: form.modality, subtype: form.subtype }} 
          onChange={handleModalityChange} 
        />
      </div>

      {/* Título gerado automaticamente */}
      <div>
        <label className="font-semibold block mb-2 flex items-center gap-2">
          Título do Caso (gerado automaticamente)
          <span className="text-xs text-cyan-700">(Será preenchido ao selecionar categoria/mod. Se necessário, clique para auto gerar.)</span>
        </label>
        <div className="flex flex-row items-center gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 font-mono focus:outline-none"
            value={
              form.title
              ? form.title
              : (autoTitlePreview || "(Será definido automaticamente após salvar: Caso [ABREV] [NUM ALEATÓRIO])")
            }
            readOnly
            tabIndex={-1}
          />
          {onGenerateAutoTitle && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onGenerateAutoTitle}
              title="Gerar título automaticamente"
            >
              Gerar título
            </Button>
          )}
        </div>
      </div>

      {/* Layout responsivo com campos clínicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Achados radiológicos */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="font-semibold flex-1">Achados radiológicos *</label>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Desfazer sugestão IA para achados"
                onClick={() => undoFindings.undo((val: string) => setForm((prev: any) => ({ ...prev, findings: val })))}
                disabled={!undoFindings.canUndo()}
              >
                <Undo2 size={18} />
              </Button>
            </div>
            <Textarea 
              name="findings" 
              value={form.findings} 
              onChange={handleFormChange} 
              placeholder="Descreva os achados..." 
              required 
              className={`min-h-[120px] focus:ring-2 focus:ring-cyan-500 ${highlightedFields.includes("findings") ? "ring-2 ring-cyan-400" : ""}`} 
            />
          </div>

          {/* Resumo Clínico */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="font-semibold flex-1">Resumo Clínico *</label>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Desfazer sugestão IA para resumo clínico"
                onClick={() => undoClinical.undo((val: string) => setForm((prev: any) => ({ ...prev, patient_clinical_info: val })))}
                disabled={!undoClinical.canUndo()}
              >
                <Undo2 size={18} />
              </Button>
            </div>
            <Textarea 
              name="patient_clinical_info" 
              value={form.patient_clinical_info} 
              onChange={handleFormChange} 
              placeholder="Breve histórico do paciente..." 
              required 
              className={`min-h-[120px] focus:ring-2 focus:ring-cyan-500 ${highlightedFields.includes("patient_clinical_info") ? "ring-2 ring-cyan-400" : ""}`} 
            />
          </div>

          {/* Dados do paciente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-2">Idade</label>
              <Input 
                name="patient_age" 
                value={form.patient_age} 
                onChange={handleFormChange} 
                placeholder="Ex: 37" 
                className={`focus:ring-2 focus:ring-cyan-500 ${highlightedFields.includes("patient_age") ? "ring-2 ring-cyan-400" : ""}`} 
              />
            </div>
            <div>
              <label className="font-semibold block mb-2">Gênero</label>
              <select
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${highlightedFields.includes("patient_gender") ? "ring-2 ring-cyan-400" : ""}`}
                name="patient_gender"
                value={form.patient_gender}
                onChange={handleFormChange}
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-2">Duração dos sintomas</label>
              <Input 
                name="symptoms_duration" 
                value={form.symptoms_duration} 
                onChange={handleFormChange} 
                placeholder="Ex: 1 semana" 
                className={`focus:ring-2 focus:ring-cyan-500 ${highlightedFields.includes("symptoms_duration") ? "ring-2 ring-cyan-400" : ""}`} 
              />
            </div>
          </div>

          {/* Botão de auto-preenchimento */}
          <div>
            <Button
              type="button"
              onClick={handleAutoFillCaseDetails}
              variant="secondary"
              size="sm"
              className="w-full"
              title="Preencher detalhes do caso de forma automática usando IA"
            >
              Auto-preencher detalhes do caso com IA
            </Button>
          </div>
        </div>

        {/* Área de upload de imagens */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <label className="font-semibold block mb-4">Imagens do Caso</label>
            <ImageUploadWithZoom
              value={imagesValue}
              onChange={handleImagesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
