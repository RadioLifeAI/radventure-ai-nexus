import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Database,
  Target,
  User,
  HelpCircle,
  FileText,
  Settings,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  Save,
  Eye
} from "lucide-react";

// Importar apenas os componentes necessários - SISTEMA LIMPO
import { CaseStructuredDataAI } from "./CaseStructuredDataAI";
import { CaseStructuredFieldsSection } from "./CaseStructuredFieldsSection";
import { CaseBasicSectionAI } from "./CaseBasicSectionAI";
import { CaseProfileBasicSectionWizard } from "./CaseProfileBasicSectionWizard";
import { CaseQuizCompleteAI } from "./CaseQuizCompleteAI";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseExplanationCompleteAI } from "./CaseExplanationCompleteAI";
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseAdvancedConfigAI } from "./CaseAdvancedConfigAI";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { CaseReferenceSection } from "./CaseReferenceSection";
import { CaseFormPreviewModal } from "./CaseFormPreviewModal";
import { CaseProgressDashboard } from "./CaseProgressDashboard";
import { CaseQualityRadar } from "./CaseQualityRadar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// SISTEMA DEFINITIVO: Modal Avançado Completo
import { CaseImageUploader } from "./CaseImageUploader";
import { AdvancedImageManagerModal } from "./AdvancedImageManagerModal";
import { supabase } from "@/integrations/supabase/client";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  valid: boolean;
  required: boolean;
}

interface CaseCreationWizardProps {
  form: any;
  setForm: any;
  highlightedFields: string[];
  setHighlightedFields: any;
  handlers: any;
  categories: any[];
  difficulties: any[];
  isEditMode: boolean;
  editingCase?: any;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  feedback: string;
  renderTooltipTip: any;
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
  renderTooltipTip
}: CaseCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdvancedImageModal, setShowAdvancedImageModal] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(isEditMode ? editingCase?.id || null : null);

  // CORREÇÃO DEFINITIVA: useEffect para carregar contador inicial
  useEffect(() => {
    async function loadInitialImageCount() {
      if (isEditMode && editingCase?.id) {
        console.log('🔄 CORREÇÃO: Carregando imagens iniciais para edição, caso:', editingCase.id);
        await reloadCaseImages(editingCase.id);
      }
    }
    loadInitialImageCount();
  }, [isEditMode, editingCase?.id]);

  // CORREÇÃO DEFINITIVA: useEffect para sincronização automática do contador
  useEffect(() => {
    const currentImageUrls = Array.isArray(form.image_url) ? form.image_url : [];
    const newCount = currentImageUrls.filter((url: any) => {
      if (typeof url === 'string') return url.trim() !== '';
      if (typeof url === 'object' && url?.url) return url.url.trim() !== '';
      return false;
    }).length;
    
    console.log('🔄 CORREÇÃO: Sincronizando imageCount:', {
      formImageUrl: form.image_url,
      calculatedCount: newCount,
      previousCount: imageCount
    });
    
    setImageCount(newCount);
  }, [form.image_url]);

  // CORREÇÃO DEFINITIVA: useEffect para sincronizar quando caso é criado
  useEffect(() => {
    async function syncAfterCaseCreation() {
      if (createdCaseId && !isEditMode) {
        console.log('🔄 CORREÇÃO: Caso criado, recarregando imagens:', createdCaseId);
        await reloadCaseImages(createdCaseId);
      }
    }
    syncAfterCaseCreation();
  }, [createdCaseId, isEditMode]);

  const steps: WizardStep[] = [
    {
      id: "structured",
      title: "Dados Estruturados",
      description: "Diagnóstico, achados e tags educacionais",
      icon: <Database className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "basic",
      title: "Informações Básicas",
      description: "Especialidade, dificuldade e identificação",
      icon: <Target className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "patient",
      title: "Dados do Paciente",
      description: "Idade, gênero e informações clínicas",
      icon: <User className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "quiz",
      title: "Quiz e Alternativas",
      description: "Pergunta principal e opções de resposta",
      icon: <HelpCircle className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "explanation",
      title: "Explicação e Feedback",
      description: "Explicação educacional e dicas",
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      valid: false,
      required: true
    },
    {
      id: "advanced",
      title: "Configurações Avançadas",
      description: "Gamificação e regras especiais",
      icon: <Settings className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "reference",
      title: "Referência e Fonte",
      description: "Dados do Radiopaedia e citações",
      icon: <BookOpen className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "images",
      title: "Gestão de Imagens",
      description: "Sistema unificado de upload",
      icon: <ImageIcon className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    },
    {
      id: "review",
      title: "Revisão Final",
      description: "Conferir dados e finalizar",
      icon: <CheckCircle className="h-5 w-5" />,
      completed: false,
      valid: true,
      required: false
    }
  ];

  // Validação automática de cada etapa
  useEffect(() => {
    validateCurrentStep();
  }, [form, currentStep]);

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    let isValid = false;

    switch (step.id) {
      case "structured":
        isValid = true;
        break;
      case "basic":
        isValid = !!(form.category_id && form.difficulty_level && form.modality && form.findings && form.patient_clinical_info);
        break;
      case "patient":
        isValid = !!(form.patient_age && form.patient_gender);
        break;
      case "quiz":
        isValid = !!(form.main_question && form.answer_options.filter((opt: string) => opt.trim()).length >= 2);
        break;
      case "explanation":
        isValid = !!form.explanation;
        break;
      case "advanced":
        isValid = true;
        break;
      case "reference":
        if (form.is_radiopaedia_case) {
          isValid = !!(form.reference_citation && form.reference_url);
        } else {
          isValid = true;
        }
        break;
      case "images":
        isValid = true;
        break;
      case "review":
        isValid = true;
        break;
    }

    steps[currentStep].valid = isValid;
    steps[currentStep].completed = isValid;
  };

  const nextStep = async () => {
    // SISTEMA DEFINITIVO: Criar caso antes da etapa de imagens (7→8)
    if (currentStep === 6 && !isEditMode && !createdCaseId) {
      await handleCreateCaseBeforeImages();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateCaseBeforeImages = async () => {
    try {
      console.log('🔄 Criando caso antes da etapa de imagens...');
      
      // Usar a mesma lógica de salvamento do CaseProfileForm
      const sanitizeDateField = (dateValue: any) => {
        if (!dateValue || dateValue === '' || dateValue === 'undefined') {
          return null;
        }
        return dateValue;
      };

      const { data: userData } = await supabase.auth.getUser();
      
      const caseData = {
        ...form,
        image_url: [], // Sem imagens ainda
        category_id: form.category_id ? parseInt(form.category_id) : null,
        difficulty_level: form.difficulty_level ? parseInt(form.difficulty_level) : null,
        points: form.points ? parseInt(form.points) : null,
        created_by: userData.user?.id,
        updated_at: new Date().toISOString(),
        access_date: sanitizeDateField(form.access_date),
        reference_citation: form.is_radiopaedia_case ? (form.reference_citation || null) : null,
        reference_url: form.is_radiopaedia_case ? (form.reference_url || null) : null
      };

      const { data: createdCase, error } = await supabase
        .from("medical_cases")
        .insert(caseData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Caso criado:', createdCase.id);
      setCreatedCaseId(createdCase.id);
      setCurrentStep(currentStep + 1);

      toast({
        title: "Caso criado!",
        description: "Agora você pode adicionar imagens ao caso.",
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao criar caso:', error);
      toast({
        title: "Erro ao criar caso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // CORREÇÃO DEFINITIVA: Funciona exatamente igual ao editor
  const reloadCaseImages = async (caseId: string) => {
    if (!caseId) return;
    
    try {
      console.log('🔄 Wizard: Recarregando imagens para caso:', caseId);
      
      const { data: imagesData, error } = await supabase
        .rpc('get_case_images_unified', { p_case_id: caseId });
      
      if (!error && imagesData && Array.isArray(imagesData)) {
        // MESMA LÓGICA DO EDITOR: Transformar dados corretamente
        const imageUrls = imagesData
          .map((img: any) => {
            if (typeof img === 'object' && img?.url) {
              return String(img.url);
            }
            return String(img);
          })
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('📊 Wizard: URLs transformadas:', imageUrls);
        
        // ATUALIZAÇÃO IDÊNTICA AO EDITOR
        setForm((prev: any) => ({
          ...prev,
          image_url: imageUrls
        }));
        
        // FORÇAR RE-RENDER DO CONTADOR
        setImageCount(imageUrls.length);
        
        console.log('✅ Wizard: Form atualizado com', imageUrls.length, 'imagens');
      } else {
        console.log('⚠️ Wizard: Nenhuma imagem encontrada ou erro:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar imagens no wizard:', error);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "structured":
        return (
          <div className="space-y-6">
            <CaseStructuredDataAI 
              form={form}
              setForm={setForm}
              onFieldsUpdated={(fields) => {
                setHighlightedFields(fields);
                setTimeout(() => setHighlightedFields([]), 2000);
              }}
            />
            <CaseStructuredFieldsSection 
              form={form}
              setForm={setForm}
              handleFormChange={handlers.handleFormChange}
              renderTooltipTip={renderTooltipTip}
            />
          </div>
        );

      case "basic":
        return (
          <div className="space-y-6">
            <CaseBasicSectionAI 
              form={form}
              setForm={setForm}
              onFieldsUpdated={(fields) => {
                setHighlightedFields(fields);
                setTimeout(() => setHighlightedFields([]), 2000);
              }}
              categories={categories}
            />
            <CaseProfileBasicSectionWizard
              form={form}
              setForm={setForm}
              highlightedFields={highlightedFields}
              renderTooltipTip={renderTooltipTip}
            />
          </div>
        );

      case "patient":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Idade do Paciente *</label>
                <Input
                  name="patient_age"
                  value={form.patient_age || ""}
                  onChange={handlers.handleFormChange}
                  placeholder="Ex: 45 anos, 2 meses"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gênero *</label>
                <Select value={form.patient_gender || ""} onValueChange={(value) => setForm((prev: any) => ({ ...prev, patient_gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração dos Sintomas</label>
              <Input
                name="symptoms_duration"
                value={form.symptoms_duration || ""}
                onChange={handlers.handleFormChange}
                placeholder="Ex: 3 dias, 2 semanas"
              />
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <CaseQuizCompleteAI 
              form={form}
              setForm={setForm}
              onFieldsUpdated={(fields) => {
                setHighlightedFields(fields);
                setTimeout(() => setHighlightedFields([]), 2000);
              }}
            />
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">
                  Pergunta Principal *
                  {renderTooltipTip("tip-main-question", "Esta pergunta será apresentada ao usuário e guiará o raciocínio clínico.")}
                </label>
                <Input 
                  name="main_question" 
                  value={form.main_question || ""} 
                  onChange={handlers.handleFormChange} 
                  placeholder="Ex: Qual é o diagnóstico mais provável?" 
                  required 
                  className="mt-2"
                />
              </div>
              <CaseProfileAlternativesSection
                form={form}
                highlightedFields={highlightedFields}
                handleOptionChange={handlers.handleOptionChange}
                handleOptionFeedbackChange={handlers.handleOptionFeedbackChange}
                handleShortTipChange={handlers.handleShortTipChange}
                handleCorrectChange={handlers.handleCorrectChange}
                handleSuggestAlternatives={handlers.handleSuggestAlternatives}
                handleRandomizeOptions={handlers.handleRandomizeOptions}
                renderTooltipTip={renderTooltipTip}
              />
            </div>
          </div>
        );

      case "explanation":
        return (
          <div className="space-y-6">
            <CaseExplanationCompleteAI 
              form={form}
              setForm={setForm}
              onFieldsUpdated={(fields) => {
                setHighlightedFields(fields);
                setTimeout(() => setHighlightedFields([]), 2000);
              }}
            />
            <CaseProfileExplanationSectionContainer
              form={form}
              highlightedFields={highlightedFields}
              handleFormChange={handlers.handleFormChange}
              handleSuggestExplanation={handlers.handleSuggestExplanation}
              renderTooltipTip={renderTooltipTip}
              handleSuggestHint={handlers.handleSuggestHint}
            />
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            <CaseAdvancedConfigAI 
              form={form}
              setForm={setForm}
              onFieldsUpdated={(fields) => {
                setHighlightedFields(fields);
                setTimeout(() => setHighlightedFields([]), 2000);
              }}
            />
            <div className="space-y-4">
              <button
                type="button"
                className="text-cyan-700 font-semibold hover:underline"
                onClick={() => setShowAdvanced((v: boolean) => !v)}
              >
                {showAdvanced ? "Ocultar" : "Mostrar"} Configurações Avançadas
              </button>
              <CaseProfileAdvancedConfigContainer
                form={form}
                handleFormChange={handlers.handleFormChange}
                handleSuggestHint={handlers.handleSuggestHint}
                showAdvanced={showAdvanced}
              />
            </div>
          </div>
        );

      case "reference":
        return (
          <div className="space-y-4">
            <CaseReferenceSection 
              form={form}
              handleFormChange={handlers.handleFormChange}
              renderTooltipTip={renderTooltipTip}
            />
          </div>
        );

      case "images":
        // SISTEMA DEFINITIVO: Só exibe se o caso já foi criado
        if (!createdCaseId && !isEditMode) {
          return (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aguardando criação do caso</h3>
              <p className="text-muted-foreground">
                O caso precisa ser criado antes de adicionar imagens.
                <br />
                Clique em "Próximo" na etapa anterior para continuar.
              </p>
            </div>
          );
        }

        const correctCaseId = isEditMode ? editingCase?.id : createdCaseId;
        console.log('🔍 WIZARD SISTEMA NATIVO - Etapa Images:', {
          isEditMode,
          createdCaseId,
          editingCaseId: editingCase?.id,
          correctCaseId,
          step: 'images'
        });

        // FORÇAR USO DO SISTEMA NATIVO APENAS
        if (!correctCaseId) {
          return (
            <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
              <ImageIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-800">Erro: Case ID Obrigatório</h3>
              <p className="text-red-600">
                Sistema nativo requer case ID válido para funcionar.
                <br />
                Não é possível usar sistema temporário no wizard.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* SISTEMA DEFINITIVO - IGUAL AO EDITOR */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-blue-800 text-lg mb-2">📸 Upload WebP Simplificado</h4>
                  <p className="text-sm text-blue-700">
                    Sistema integrado que obtém especialidade e modalidade automaticamente do caso: 
                    <code className="bg-blue-100 px-2 py-1 rounded ml-2">{correctCaseId}</code>
                  </p>
                </div>
                <Badge variant="secondary" className="bg-yellow-300 text-blue-800 font-bold">
                  {imageCount} imagem(ns)
                </Badge>
              </div>
              
              {/* BOTÃO PRINCIPAL - SIMPLIFICADO */}
              <Button
                type="button"
                size="lg"
                onClick={() => setShowAdvancedImageModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-4 shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                <ImageIcon className="h-6 w-6 mr-3" />
                📸 Upload WebP Inteligente
                <Badge variant="secondary" className="ml-3 bg-yellow-300 text-blue-800 font-bold">
                  AUTO
                </Badge>
              </Button>
              
              <p className="text-sm text-blue-600 mt-3 text-center">
                Sistema simplificado que usa automaticamente os dados do caso
              </p>
            </div>

            {/* FALLBACK: Sistema Básico (caso necessário) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-700 mb-2">📎 Sistema Básico (Fallback)</h5>
              <CaseImageUploader
                caseId={correctCaseId}
                onUploadComplete={async () => {
                  console.log('🔄 WIZARD: Upload básico concluído, recarregando imagens...');
                  await reloadCaseImages(correctCaseId);
                  toast({
                    title: "✅ Imagens salvas!",
                    description: "As imagens foram adicionadas ao caso com sucesso.",
                  });
                }}
              />
            </div>
          </div>
        );

      case "review":
        const finalCaseId = isEditMode ? editingCase?.id : createdCaseId;
        
        return (
          <div className="space-y-6">
            <CaseProgressDashboard form={form} />
            <CaseQualityRadar form={form} />
            
            {/* CORREÇÃO DEFINITIVA: Status das Imagens com Atualização */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">📊 Status das Imagens</h4>
                  <p className="text-sm text-blue-700">
                    Contador atual: <strong>{imageCount} imagem(ns)</strong>
                    {finalCaseId && (
                      <span className="ml-2">| Caso ID: <code className="bg-blue-100 px-1 rounded">{finalCaseId}</code></span>
                    )}
                  </p>
                </div>
                {finalCaseId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      console.log('🔄 CORREÇÃO: Recarregando dados da revisão final...');
                      await reloadCaseImages(finalCaseId);
                      toast({
                        title: "✅ Dados atualizados!",
                        description: "Contador de imagens sincronizado.",
                      });
                    }}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    🔄 Atualizar Dados
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-4">✅ Caso Pronto para Publicação</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Título:</strong> {form.title || "A ser gerado"}
                </div>
                <div>
                  <strong>Especialidade:</strong> {categories.find(c => String(c.id) === String(form.category_id))?.name || "Não definida"}
                </div>
                <div>
                  <strong>Dificuldade:</strong> {difficulties.find(d => String(d.id) === String(form.difficulty_level))?.description || form.difficulty_level}
                </div>
                <div>
                  <strong>Modalidade:</strong> {form.modality || "Não definida"}
                </div>
                <div>
                  <strong>Alternativas:</strong> {form.answer_options.filter((opt: string) => opt.trim()).length}
                </div>
                <div className={`${imageCount > 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  <strong>Imagens:</strong> {imageCount} imagem(ns) prontas
                  {imageCount === 0 && <span className="text-xs ml-1">(Clique em "Atualizar Dados" se houver imagens)</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Preview Completo
                </Button>
                {finalCaseId && (
                  <Button
                    variant="outline"
                    onClick={() => goToStep(7)} // Ir para etapa de imagens
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📸 Gerenciar Imagens
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Etapa não implementada</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Wizard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              {isEditMode ? "Editar Caso Médico" : "Criar Novo Caso Médico"} - Etapa {currentStep + 1}/9
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {Math.round(progressPercentage)}% Completo
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
      </Card>

      {/* Steps Navigation */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
              index === currentStep 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : step.completed 
                  ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => goToStep(index)}
          >
            <div className="flex items-center justify-center mb-1">
              {step.icon}
            </div>
            <div className="text-xs font-medium">{step.title}</div>
            {step.completed && (
              <CheckCircle className="h-3 w-3 text-green-600 mx-auto mt-1" />
            )}
            {step.required && !step.valid && (
              <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
              {steps[currentStep].required && (
                <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
              )}
            </div>
            {steps[currentStep].valid && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </CardTitle>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              {currentStep === 6 && !isEditMode && !createdCaseId ? "Criar Caso" : "Próximo"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => {
                // No modo edição, usar onSubmit normal
                // No modo criação, só navegar (caso já foi criado)
                if (isEditMode) {
                  onSubmit({ preventDefault: () => {} } as any);
                } else {
                  toast({
                    title: "✅ Caso criado com sucesso!",
                    description: "O caso foi salvo e está pronto para uso.",
                  });
                  // Aqui poderia navegar ou fechar o wizard
                }
              }}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Atualizar Caso" : "Finalizar"}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {feedback && (
            <span className="text-sm font-medium text-cyan-700">{feedback}</span>
          )}
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Modal de Preview */}
      <CaseFormPreviewModal 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        form={form} 
        categories={categories} 
        difficulties={difficulties} 
      />

      {/* SISTEMA DEFINITIVO: Modal Avançado de Imagens - IGUAL AO EDITOR */}
      <AdvancedImageManagerModal
        open={showAdvancedImageModal}
        onClose={() => setShowAdvancedImageModal(false)}
        caseId={isEditMode ? editingCase?.id : createdCaseId}
        currentImages={Array.isArray(form.image_url) ? form.image_url : []}
        onImagesUpdated={async (images) => {
          console.log('🔄 WIZARD: Imagens atualizadas via modal avançado:', images);
          setForm(prev => ({ ...prev, image_url: images }));
          
          // Forçar recarregamento e sincronização
          const caseId = isEditMode ? editingCase?.id : createdCaseId;
          if (caseId) {
            await reloadCaseImages(caseId);
          }
          
          toast({ 
            title: "🎉 Imagens Processadas!", 
            description: `${images.length} imagem(ns) processada(s) com ferramentas avançadas.` 
          });
        }}
      />
    </div>
  );
}
