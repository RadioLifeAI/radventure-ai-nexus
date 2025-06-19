
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseModalityFieldsUnified } from "./CaseModalityFieldsUnified";
import { CaseImageManagement } from "./CaseImageManagement";
import { Undo2 } from "lucide-react";

type Props = {
  form: any;
  highlightedFields: string[];
  handleFormChange: any;
  handleModalityChange: any;
  handleImageChange: any;
  renderTooltipTip: any;
  handleSuggestFindings: any;
  handleSuggestClinicalInfo: any;
  undoFindings: any;
  undoClinical: any;
  setForm: any;
  autoTitlePreview: string;
  onGenerateAutoTitle: () => void;
};

export function CaseProfileBasicSectionUnified({
  form, highlightedFields, handleFormChange, handleModalityChange, handleImageChange,
  renderTooltipTip, handleSuggestFindings, handleSuggestClinicalInfo,
  undoFindings, undoClinical, setForm, autoTitlePreview, onGenerateAutoTitle
}: Props) {
  return (
    <div className="space-y-6">
      {/* Dados Básicos do Caso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${highlightedFields.includes("case_number") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
          <label className="font-semibold block">
            Número do Caso *
            {renderTooltipTip("tip-case-number", "Número sequencial único do caso gerado automaticamente.")}
          </label>
          <Input name="case_number" value={form.case_number || ''} onChange={handleFormChange} placeholder="Ex: 123456" required type="number" />
        </div>

        <div className={`${highlightedFields.includes("title") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
          <label className="font-semibold block">
            Título do Caso *
            {renderTooltipTip("tip-title", "Título descritivo do caso médico que será exibido aos usuários.")}
          </label>
          <div className="flex gap-2">
            <Input name="title" value={form.title || ''} onChange={handleFormChange} placeholder="Ex: Caso Cardio Avançado TC #123456" required className="flex-1" />
            <Button type="button" onClick={onGenerateAutoTitle} variant="outline" size="sm" className="px-3">
              Auto
            </Button>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Preview: {autoTitlePreview}
          </div>
        </div>
      </div>

      {/* Modalidade e Campos Específicos */}
      <CaseModalityFieldsUnified
        form={form}
        handleFormChange={handleFormChange}
        handleModalityChange={handleModalityChange}
        highlightedFields={highlightedFields}
        renderTooltipTip={renderTooltipTip}
      />

      {/* Sistema Avançado de Imagens */}
      <div className="space-y-3">
        <label className="font-semibold block">
          Imagens do Caso (Sistema Inteligente)
          {renderTooltipTip("tip-smart-images", "Sistema avançado com auto-redimensionamento, múltiplos formatos e otimização automática.")}
        </label>
        <CaseImageManagement
          value={form.image_url || []}
          onChange={(images) => setForm({ ...form, image_url: images })}
          renderTooltipTip={renderTooltipTip}
        />
      </div>

      {/* Achados e Informações Clínicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${highlightedFields.includes("findings") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
          <div className="flex items-center gap-2 mb-2">
            <label className="font-semibold">
              Achados do Exame *
              {renderTooltipTip("tip-findings", "Descreva os principais achados encontrados no exame.")}
            </label>
            <Button type="button" onClick={handleSuggestFindings} variant="secondary" size="sm">
              AI
            </Button>
            {undoFindings.canUndo && (
              <Button type="button" onClick={undoFindings.undo} variant="ghost" size="sm" title="Desfazer">
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Textarea 
            name="findings" 
            value={form.findings || ''} 
            onChange={handleFormChange} 
            placeholder="Ex: Consolidação em lobo superior direito com broncograma aéreo..." 
            required 
            className="min-h-[100px]"
          />
        </div>

        <div className={`${highlightedFields.includes("patient_clinical_info") ? "ring-2 ring-cyan-400 rounded" : ""}`}>
          <div className="flex items-center gap-2 mb-2">
            <label className="font-semibold">
              História Clínica do Paciente *
              {renderTooltipTip("tip-clinical-info", "Informações clínicas relevantes, sintomas e contexto do caso.")}
            </label>
            <Button type="button" onClick={handleSuggestClinicalInfo} variant="secondary" size="sm">
              AI
            </Button>
            {undoClinical.canUndo && (
              <Button type="button" onClick={undoClinical.undo} variant="ghost" size="sm" title="Desfazer">
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Textarea 
            name="patient_clinical_info" 
            value={form.patient_clinical_info || ''} 
            onChange={handleFormChange} 
            placeholder="Ex: Paciente masculino, 45 anos, com tosse produtiva há 7 dias..." 
            required 
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Dados do Paciente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-semibold block">
            Idade do Paciente
            {renderTooltipTip("tip-patient-age", "Idade do paciente ou faixa etária.")}
          </label>
          <Input name="patient_age" value={form.patient_age || ''} onChange={handleFormChange} placeholder="Ex: 45 anos" />
        </div>

        <div>
          <label className="font-semibold block">
            Sexo do Paciente
            {renderTooltipTip("tip-patient-gender", "Sexo biológico do paciente para contexto clínico.")}
          </label>
          <Select value={form.patient_gender || ''} onValueChange={(value) => setForm({ ...form, patient_gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="nao_informado">Não informado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-semibold block">
            Duração dos Sintomas
            {renderTooltipTip("tip-symptoms-duration", "Há quanto tempo os sintomas estão presentes.")}
          </label>
          <Input name="symptoms_duration" value={form.symptoms_duration || ''} onChange={handleFormChange} placeholder="Ex: 7 dias" />
        </div>
      </div>
    </div>
  );
}
