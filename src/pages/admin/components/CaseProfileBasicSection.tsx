import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CaseModalityFields } from "./CaseModalityFields";
import { Undo2 } from "lucide-react";
import { ImageUploadWithZoom } from "./ImageUploadWithZoom";

type Props = {
  form: any;
  highlightedFields: string[];
  categories: any[];
  difficulties: any[];
  handleFormChange: any;
  handleModalityChange: any;
  handleAutoFillCaseDetails: any;
  handleSuggestTitle: any;
  handleSuggestHint: any;
  handleImageChange: any;
  renderTooltipTip: any;
  handleSuggestFindings: any;
  handleSuggestClinicalInfo: any;
  undoFindings: any;
  undoClinical: any;
  undoTitle: any;
  setForm: any;
};

export function CaseProfileBasicSection({
  form, highlightedFields, categories, difficulties, handleFormChange,
  handleModalityChange, handleAutoFillCaseDetails, handleSuggestTitle, handleSuggestHint, handleImageChange, renderTooltipTip,
  handleSuggestFindings, handleSuggestClinicalInfo,
  undoFindings, undoClinical, undoTitle, setForm
}: Props) {
  // Novo: adaptador para array de imagens
  function handleImagesChange(imgArr: { url: string; legend: string }[]) {
    // propaga nova lista para o form
    handleImageChange(imgArr); // form.image_url agora é array de {url,legend}
  }  
  return (
    <>
      {/* Pré-visualização & botões */}
      <div className="mb-3 flex gap-2">
        {/* Botões principais já existentes em outro lugar */}
      </div>
      {/* Categoria/Dificuldade/Pontos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div>
          <label className="font-semibold block">Categoria *</label>
          <select
            className="w-full border rounded px-2 py-2 bg-white"
            name="category_id"
            value={form.category_id}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a categoria</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold block">Dificuldade *</label>
          <select
            className="w-full border rounded px-2 py-2 bg-white"
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
          <label className="font-semibold block">Pontos *</label>
          <Input
            name="points"
            type="number"
            value={form.points}
            min={1}
            onChange={handleFormChange}
            placeholder="Ex: 10"
            required
          />
        </div>
      </div>
      {/* Modalidade/Subtipo */}
      <CaseModalityFields value={{ modality: form.modality, subtype: form.subtype }} onChange={handleModalityChange} />
      {/* Título gerado automático */}
      <div className="mb-2">
        <label className="font-semibold block flex items-center gap-2">
          Título do Caso (gerado automaticamente)
          <span className="text-xs text-cyan-700">(Preenchido automaticamente ao salvar. Usado para identificar o caso, não é o diagnóstico.)</span>
        </label>
        <input
          className="w-full border rounded px-2 py-2 bg-gray-100 text-gray-700 font-mono"
          value={
            form.title
              ? form.title
              : "(Será definido automaticamente após salvar: Caso [ABREV] [NUM])"
          }
          readOnly
          tabIndex={-1}
        />
      </div>
      {/* Diagnóstico apenas para referência interna */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="font-semibold">
                Diagnóstico (interno)*{" "}
                <span className="text-xs text-muted-foreground">(Não será exibido no título do caso)</span>
              </label>
              <Input
                name="title"
                value={form.title_diagnosis ?? ""}
                onChange={e => setForm((prev: any) => ({ ...prev, title_diagnosis: e.target.value }))}
                placeholder="Ex: Tuberculose pulmonar"
                required
                className={highlightedFields.includes("title") ? "ring-2 ring-cyan-400" : ""}
              />
            </div>
            <Button type="button" onClick={handleSuggestTitle} variant="secondary" className="mb-1">
              Sugerir Diagnóstico
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Desfazer sugestão IA para diagnóstico"
              onClick={() => undoTitle.undo((val: string) => setForm((prev: any) => ({ ...prev, title: val })))}
              className="mb-1"
              disabled={!undoTitle.canUndo()}
            >
              <Undo2 size={18} />
            </Button>
            <Button
              type="button"
              onClick={handleAutoFillCaseDetails}
              variant="secondary"
              className="mb-1"
              title="Preencher achados, resumo, idade, gênero, sintomas e opções avançadas de forma automática"
            >
              Auto-preencher detalhes do caso
            </Button>
          </div>

          {/* Achados radiológicos */}
          <label className="font-semibold mt-3 flex items-center">
            Achados radiológicos *
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 px-2 py-1 text-cyan-700 border border-cyan-200"
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
              className="ml-1"
              disabled={!undoFindings.canUndo()}
            >
              <Undo2 size={18} />
            </Button>
          </label>
          <Textarea name="findings" value={form.findings} onChange={handleFormChange} placeholder="Descreva os achados..." required className={highlightedFields.includes("findings") ? "ring-2 ring-cyan-400" : ""} />

          {/* Resumo Clínico */}
          <label className="font-semibold mt-3 flex items-center">
            Resumo Clínico *
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 px-2 py-1 text-cyan-700 border border-cyan-200"
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
              className="ml-1"
              disabled={!undoClinical.canUndo()}
            >
              <Undo2 size={18} />
            </Button>
          </label>
          <Textarea name="patient_clinical_info" value={form.patient_clinical_info} onChange={handleFormChange} placeholder="Breve histórico do paciente..." required className={highlightedFields.includes("patient_clinical_info") ? "ring-2 ring-cyan-400" : ""} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <div>
              <label className="font-semibold">Idade</label>
              <Input name="patient_age" value={form.patient_age} onChange={handleFormChange} placeholder="Ex: 37" className={highlightedFields.includes("patient_age") ? "ring-2 ring-cyan-400" : ""} />
            </div>
            <div>
              <label className="font-semibold">Gênero</label>
              <select
                className={`w-full border rounded px-2 py-2 bg-white ${highlightedFields.includes("patient_gender") ? "ring-2 ring-cyan-400" : ""}`}
                name="patient_gender"
                value={form.patient_gender}
                onChange={handleFormChange}
              >
                {[{ value: "", label: "Selecione..." },
                  { value: "Masculino", label: "Masculino" },
                  { value: "Feminino", label: "Feminino" },
                  { value: "Outro", label: "Outro" }].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold">Duração dos sintomas</label>
              <Input name="symptoms_duration" value={form.symptoms_duration} onChange={handleFormChange} placeholder="Ex: 1 semana" className={highlightedFields.includes("symptoms_duration") ? "ring-2 ring-cyan-400" : ""} />
            </div>
          </div>
        </div>
        {/* Imagem */}
        <div className="pt-3 min-w-[240px] flex flex-col items-center">
          <ImageUploadWithZoom
            value={form.image_url ?? []}
            onChange={handleImagesChange}
          />
        </div>
      </div>
    </>
  );
}
