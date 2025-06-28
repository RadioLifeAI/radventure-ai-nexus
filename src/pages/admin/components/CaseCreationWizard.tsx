
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

// Importar todos os componentes existentes
import { CaseStructuredDataAI } from "./CaseStructuredDataAI";
import { CaseStructuredFieldsSection } from "./CaseStructuredFieldsSection";
import { CaseBasicSectionAI } from "./CaseBasicSectionAI";
import { CaseProfileBasicSectionUnified } from "./CaseProfileBasicSectionUnified";
import { CaseQuizCompleteAI } from "./CaseQuizCompleteAI";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseExplanationCompleteAI } from "./CaseExplanationCompleteAI";
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseAdvancedConfigAI } from "./CaseAdvancedConfigAI";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { CaseReferenceSection } from "./CaseReferenceSection";
import { CaseAdvancedImageManagement } from "./CaseAdvancedImageManagement";
import { TempImageUpload } from "./TempImageUpload";
import { AdvancedImageManagerModal } from "./AdvancedImageManagerModal";
import { CaseFormPreviewModal } from "./CaseFormPreviewModal";
import { CaseProgressDashboard } from "./CaseProgressDashboard";
import { CaseQualityRadar } from "./CaseQualityRadar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [showAdvancedImageModal, setShowAdvancedImageModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      description: "Upload e processamento de imagens",
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
        isValid = true; // Sempre válido, é opcional
        break;
      case "basic":
        isValid = !!(form.category_id && form.difficulty_level && form.modality);
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
        isValid = true; // Sempre válido, configurações têm defaults
        break;
      case "reference":
        if (form.is_radiopaedia_case) {
          isValid = !!(form.reference_citation && form.reference_url);
        } else {
          isValid = true;
        }
        break;
      case "images":
        isValid = true; // Imagens são opcionais
        break;
      case "review":
        isValid = true;
        break;
    }

    steps[currentStep].valid = isValid;
    steps[currentStep].completed = isValid;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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
            <CaseProfileBasicSectionUnified
              form={form}
              highlightedFields={highlightedFields}
              handleFormChange={handlers.handleFormChange}
              handleModalityChange={handlers.handleModalityChange}
              renderTooltipTip={renderTooltipTip}
              handleSuggestFindings={handlers.handleSuggestFindings}
              handleSuggestClinicalInfo={handlers.handleSuggestClinicalInfo}
              undoFindings={{ canUndo: false, undo: () => {} }}
              undoClinical={{ canUndo: false, undo: () => {} }}
              setForm={setForm}
              autoTitlePreview=""
              onGenerateAutoTitle={() => {}}
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
                  value={form.patient_age}
                  onChange={handlers.handleFormChange}
                  placeholder="Ex: 45 anos, 2 meses"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gênero *</label>
                <Select value={form.patient_gender} onValueChange={(value) => setForm((prev: any) => ({ ...prev, patient_gender: value }))}>
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
                value={form.symptoms_duration}
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
                  value={form.main_question} 
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
        return (
          <div className="space-y-6">
            {/* Header com Ferramentas Avançadas */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800">Sistema Profissional de Imagens</h3>
                    <p className="text-purple-600 text-sm">
                      Upload avançado, editor profissional, processador ZIP e visualizador stack
                    </p>
                  </div>
                </div>
                
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setShowAdvancedImageModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3 shadow-xl"
                >
                  🔬 Ferramentas Avançadas
                  <Badge variant="secondary" className="ml-2 bg-yellow-300 text-purple-800 font-bold">
                    PRO
                  </Badge>
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">
                    {Array.isArray(form.image_url) ? form.image_url.length : 0} imagem(ns)
                  </span>
                </div>
              </div>
            </div>

            {/* Sistema de Upload Padrão */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload Básico de Imagens
              </h4>
              {isEditMode ? (
                <CaseAdvancedImageManagement 
                  caseId={editingCase?.id}
                  onImagesChange={(images) => {
                    console.log('Images updated:', images.length);
                  }}
                />
              ) : (
                <TempImageUpload 
                  onChange={(images) => {
                    console.log('Temp images updated:', images.length);
                  }}
                />
              )}
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <CaseProgressDashboard form={form} />
            <CaseQualityRadar form={form} />
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
                <div>
                  <strong>Imagens:</strong> {Array.isArray(form.image_url) ? form.image_url.length : 0}
                </div>
              </div>
              <Button
                className="mt-4 w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Preview Completo
              </Button>
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
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={onSubmit} 
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
                  {isEditMode ? "Atualizar Caso" : "Criar Caso"}
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

      {/* Modals */}
      <CaseFormPreviewModal 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        form={form} 
        categories={categories} 
        difficulties={difficulties} 
      />

      <AdvancedImageManagerModal
        open={showAdvancedImageModal}
        onClose={() => setShowAdvancedImageModal(false)}
        caseId={isEditMode ? editingCase?.id : undefined}
        currentImages={Array.isArray(form.image_url) ? form.image_url : []}
        onImagesUpdated={(images) => {
          setForm(prev => ({ ...prev, image_url: images }));
          toast({ 
            title: "🎉 Imagens Processadas!", 
            description: `${images.length} imagem(ns) processada(s) com ferramentas avançadas.` 
          });
        }}
      />
    </div>
  );
}
