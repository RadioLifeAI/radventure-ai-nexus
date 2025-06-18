import React, { useState } from "react";
import { CaseProfileFormLayout } from "./CaseProfileFormLayout";
import { CaseProfileFormActions } from "./CaseProfileFormActions";
import { CaseSmartAutofillAdvanced } from "./CaseSmartAutofillAdvanced";
import { CaseFormContextualSuggestions } from "./CaseFormContextualSuggestions";
import { CaseIntelligentTemplates } from "./CaseIntelligentTemplates";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  CheckCircle, 
  Sparkles,
  AlertTriangle
} from "lucide-react";

type Props = {
  onSave: (formData: any) => void;
  onCancel: () => void;
  initialData?: any;
};

export function CaseProfileFormEditable({ onSave, onCancel, initialData }: Props) {
  const { specialties, difficulties } = useUnifiedFormDataSource();
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  const {
    form,
    submitting,
    feedback,
    showAdvanced,
    setShowAdvanced,
    showPreview,
    setShowPreview,
    handleFormChange,
    handleModalityChange,
    handleOptionChange,
    handleOptionFeedbackChange,
    handleShortTipChange,
    handleCorrectChange,
    handleImageChange,
    resetForm,
    handleAutoFillCaseDetails,
    handleSuggestDiagnosis,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleGenerateCaseTitleAuto,
    handleSuggestFindings,
    handleSuggestClinicalInfo,
    handleRandomizeOptions
  } = useCaseProfileFormHandlers({ categories: specialties, difficulties });

  const handleSave = async () => {
    try {
      await onSave(form);
    } catch (error) {
      console.error('Erro ao salvar caso:', error);
    }
  };

  const handleFieldsUpdated = (fields: string[]) => {
    setHighlightedFields(fields);
    // Remover destaque após 3 segundos
    setTimeout(() => {
      setHighlightedFields([]);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sistema de AI e Assistência Inteligente */}
      <Tabs defaultValue="autofill" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="autofill" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Auto-preenchimento
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validações
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Templates IA
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sugestões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="autofill" className="mt-4">
          <CaseSmartAutofillAdvanced 
            form={form}
            setForm={(updater) => {
              if (typeof updater === 'function') {
                const newForm = updater(form);
                Object.assign(form, newForm);
              }
            }}
            onFieldsUpdated={handleFieldsUpdated}
          />
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <CaseFormContextualSuggestions
            form={form}
            setForm={(updater) => {
              if (typeof updater === 'function') {
                const newForm = updater(form);
                Object.assign(form, newForm);
              }
            }}
            onFieldsUpdated={handleFieldsUpdated}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <CaseIntelligentTemplates
            form={form}
            setForm={(updater) => {
              if (typeof updater === 'function') {
                const newForm = updater(form);
                Object.assign(form, newForm);
              }
            }}
            onFieldsUpdated={handleFieldsUpdated}
          />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Sugestões Contextuais</span>
                <Badge className="bg-blue-500 text-white">Em Tempo Real</Badge>
              </div>
              <p className="text-sm text-blue-700">
                As sugestões aparecerão aqui conforme você preenche o formulário, 
                baseadas na consistência dos dados e nas melhores práticas identificadas 
                na análise de casos similares.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formulário Principal */}
      <CaseProfileFormLayout
        form={form}
        highlightedFields={highlightedFields}
        showAdvanced={showAdvanced}
        onFormChange={handleFormChange}
        onModalityChange={handleModalityChange}
        onOptionChange={handleOptionChange}
        onOptionFeedbackChange={handleOptionFeedbackChange}
        onShortTipChange={handleShortTipChange}
        onCorrectChange={handleCorrectChange}
        onImageChange={handleImageChange}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
      />

      {/* Ações do Formulário */}
      <CaseProfileFormActions
        onSave={handleSave}
        onCancel={onCancel}
        onReset={resetForm}
        onPreview={() => setShowPreview(true)}
        submitting={submitting}
        hasChanges={!!form.title || !!form.findings}
        form={form}
        showPreview={showPreview}
        onClosePreview={() => setShowPreview(false)}
      />

      {feedback && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">{feedback}</p>
        </div>
      )}
    </div>
  );
}
