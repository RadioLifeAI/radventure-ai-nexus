
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Wand2, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Stethoscope,
  Brain,
  Upload
} from "lucide-react";
import { CaseProfileBasicSectionWizardEnhanced } from "./CaseProfileBasicSectionWizardEnhanced";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { UnifiedImageSystemTabs } from "./UnifiedImageSystemTabs";
import { CaseFormPreviewModal } from "./CaseFormPreviewModal";

interface CaseCreationWizardProps {
  form: any;
  setForm: (form: any) => void;
  highlightedFields: string[];
  setHighlightedFields: (fields: string[]) => void;
  handlers: any;
  categories: any[];
  difficulties: any[];
  isEditMode: boolean;
  editingCase?: any;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  feedback: string;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
  // Novas props para sistema integrado
  tempImages?: File[];
  onTempImageUpload?: (files: File[]) => void;
  onRemoveTempImage?: (index: number) => void;
  specializedImages?: any[];
  isProcessingImages?: boolean;
}

export function CaseCreationWizard({
  form,
  setForm,
  highlightedFields,
  setHighlightedFields,
  handlers,
  categories,
  difficulties,
  isEditMode,
  editingCase,
  onSubmit,
  submitting,
  feedback,
  renderTooltipTip,
  tempImages = [],
  onTempImageUpload,
  onRemoveTempImage,
  specializedImages = [],
  isProcessingImages = false
}: CaseCreationWizardProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);

  // Calcular progresso do formulário
  const calculateProgress = () => {
    const requiredFields = [
      'title', 'category_id', 'modality', 'difficulty_level', 
      'main_question', 'findings', 'explanation'
    ];
    const completedFields = requiredFields.filter(field => 
      form[field] && String(form[field]).trim() !== ''
    ).length;
    
    const alternativesCompleted = form.answer_options?.filter((opt: string) => opt?.trim()).length || 0;
    const progressPercent = Math.round(
      ((completedFields / requiredFields.length) * 70) + 
      ((alternativesCompleted / 4) * 20) +
      ((tempImages.length > 0 || specializedImages.length > 0) ? 10 : 0)
    );
    
    return Math.min(progressPercent, 100);
  };

  const progress = calculateProgress();
  const isFormValid = progress >= 90;

  // Validar se há imagens (temporárias ou processadas)
  const hasImages = tempImages.length > 0 || specializedImages.length > 0;
  const isIntegrated = !!(form.category_id && form.modality);

  return (
    <div className="space-y-6">
      {/* Header com Status Integrado */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isEditMode ? "Editar Caso Radiológico" : "Criar Novo Caso Radiológico"}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Sistema integrado com organização automática de imagens por especialidade
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status de Integração */}
              <Badge variant="secondary" className={isIntegrated 
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-orange-100 text-orange-700 border-orange-300'
              }>
                {isIntegrated ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                {isIntegrated ? 'SISTEMA ATIVO' : 'CONFIG. PENDENTE'}
              </Badge>

              {/* Status de Imagens */}
              {hasImages && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {tempImages.length > 0 ? `${tempImages.length} staging` : `${specializedImages.length} processadas`}
                </Badge>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">{progress}% completo</div>
                  <div className="text-xs text-gray-500">
                    {isFormValid ? "Pronto para salvar" : "Continue preenchendo"}
                  </div>
                </div>
                <div className="w-16">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Banner para modo criação com staging */}
          {!isEditMode && tempImages.length > 0 && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Sistema de Staging Ativo:</span>
                <span>{tempImages.length} imagem(ns) aguardando processamento após salvamento do caso</span>
              </div>
            </div>
          )}

          {/* Feedback de Processamento */}
          {feedback && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{feedback}</span>
                {isProcessingImages && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Wizard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-3">
            <Stethoscope className="h-4 w-4" />
            <span className="text-xs">Básico</span>
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="flex flex-col items-center gap-1 py-3">
            <Brain className="h-4 w-4" />
            <span className="text-xs">Alternativas</span>
          </TabsTrigger>
          <TabsTrigger value="explanation" className="flex flex-col items-center gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Explicação</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex flex-col items-center gap-1 py-3">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">Imagens</span>
            {hasImages && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {tempImages.length || specializedImages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex flex-col items-center gap-1 py-3">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Avançado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <CaseProfileBasicSectionWizardEnhanced
            form={form}
            setForm={setForm}
            categories={categories}
            difficulties={difficulties}
            highlightedFields={highlightedFields}
            handlers={handlers}
            renderTooltipTip={renderTooltipTip}
          />
        </TabsContent>

        <TabsContent value="alternatives" className="mt-6">
          <CaseProfileAlternativesSection
            form={form}
            setForm={setForm}
            handlers={handlers}
            highlightedFields={highlightedFields}
            renderTooltipTip={renderTooltipTip}
          />
        </TabsContent>

        <TabsContent value="explanation" className="mt-6">
          <CaseProfileExplanationSectionContainer
            form={form}
            setForm={setForm}
            handlers={handlers}
            highlightedFields={highlightedFields}
            renderTooltipTip={renderTooltipTip}
          />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <UnifiedImageSystemTabs
            caseId={isEditMode ? editingCase?.id : undefined}
            categoryId={form.category_id ? Number(form.category_id) : undefined}
            modality={form.modality}
            // Props do sistema integrado
            tempImages={tempImages}
            onTempImageUpload={onTempImageUpload}
            onRemoveTempImage={onRemoveTempImage}
            isProcessingImages={isProcessingImages}
            specializedImages={specializedImages}
          />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <CaseProfileAdvancedConfigContainer
            form={form}
            setForm={setForm}
            handlers={handlers}
            highlightedFields={highlightedFields}
            renderTooltipTip={renderTooltipTip}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
            disabled={progress < 50}
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>

          <div className="text-sm text-gray-500">
            {isFormValid 
              ? "✅ Formulário completo e pronto para salvar"
              : `⏳ ${100 - progress}% restante para completar`
            }
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status de Imagens */}
          {hasImages && (
            <div className="text-sm text-gray-600">
              {tempImages.length > 0 
                ? `📸 ${tempImages.length} imagem(ns) aguardando processamento`
                : `✅ ${specializedImages.length} imagem(ns) organizadas`
              }
            </div>
          )}

          <Button
            type="submit"
            onClick={onSubmit}
            disabled={submitting || !isFormValid || isProcessingImages}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {submitting || isProcessingImages ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isProcessingImages ? "Processando imagens..." : "Salvando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? "Atualizar Caso" : "Salvar Caso"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <CaseFormPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        form={form}
        categories={categories}
        difficulties={difficulties}
        tempImages={tempImages}
        specializedImages={specializedImages}
      />
    </div>
  );
}
