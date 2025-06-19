
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Settings,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
  RotateCcw,
  Eye
} from "lucide-react";

interface CaseEditWizardModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  valid: boolean;
}

export function CaseEditWizardModal({ open, onClose, caseId, onSaved }: CaseEditWizardModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [caseData, setCaseData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    specialty: "",
    modality: "",
    difficultyLevel: 1,
    points: 10,
    patientAge: "",
    patientGender: "",
    patientClinicalInfo: "",
    findings: "",
    mainQuestion: "",
    answerOptions: ["", "", "", ""],
    answerFeedbacks: ["", "", "", ""],
    correctAnswerIndex: 0,
    explanation: "",
    manualHint: "",
    canSkip: true,
    maxElimination: 2,
    aiHintEnabled: false
  });

  const steps: WizardStep[] = [
    {
      id: "basic",
      title: "Informações Básicas",
      description: "Título, especialidade e dificuldade",
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      valid: false
    },
    {
      id: "patient", 
      title: "Dados do Paciente",
      description: "Idade, gênero e informações clínicas",
      icon: <AlertCircle className="h-5 w-5" />,
      completed: false,
      valid: false
    },
    {
      id: "case",
      title: "Caso Clínico",
      description: "Achados e pergunta principal",
      icon: <Image className="h-5 w-5" />,
      completed: false,
      valid: false
    },
    {
      id: "answers",
      title: "Alternativas",
      description: "Opções de resposta e gabarito", 
      icon: <CheckCircle className="h-5 w-5" />,
      completed: false,
      valid: false
    },
    {
      id: "explanation",
      title: "Explicação",
      description: "Explicação detalhada e dicas",
      icon: <Sparkles className="h-5 w-5" />,
      completed: false,
      valid: false
    },
    {
      id: "settings",
      title: "Configurações",
      description: "Opções avançadas do caso",
      icon: <Settings className="h-5 w-5" />,
      completed: false,
      valid: false
    }
  ];

  useEffect(() => {
    if (open && caseId) {
      loadCaseData();
      loadCategories();
    }
  }, [open, caseId]);

  useEffect(() => {
    validateCurrentStep();
  }, [formData, currentStep]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("medical_specialties")
      .select("id, name")
      .order("name");
    setCategories(data || []);
  };

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;

      setCaseData(data);
      
      // Preencher form com dados existentes
      setFormData({
        title: data.title || "",
        specialty: data.specialty || "",
        modality: data.modality || "",
        difficultyLevel: data.difficulty_level || 1,
        points: data.points || 10,
        patientAge: data.patient_age || "",
        patientGender: data.patient_gender || "",
        patientClinicalInfo: data.patient_clinical_info || "",
        findings: data.findings || "",
        mainQuestion: data.main_question || "",
        answerOptions: data.answer_options || ["", "", "", ""],
        answerFeedbacks: data.answer_feedbacks || ["", "", "", ""],
        correctAnswerIndex: data.correct_answer_index || 0,
        explanation: data.explanation || "",
        manualHint: data.manual_hint || "",
        canSkip: data.can_skip ?? true,
        maxElimination: data.max_elimination || 2,
        aiHintEnabled: data.ai_hint_enabled || false
      });
    } catch (error: any) {
      console.error("Erro ao carregar caso:", error);
      toast({
        title: "Erro ao carregar caso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    let isValid = false;

    switch (step.id) {
      case "basic":
        isValid = !!(formData.title && formData.specialty && formData.modality);
        break;
      case "patient":
        isValid = !!(formData.patientAge && formData.patientGender);
        break;
      case "case":
        isValid = !!(formData.findings && formData.mainQuestion);
        break;
      case "answers":
        isValid = formData.answerOptions.filter(opt => opt.trim()).length >= 2;
        break;
      case "explanation":
        isValid = !!formData.explanation;
        break;
      case "settings":
        isValid = true; // Sempre válido
        break;
    }

    steps[currentStep].valid = isValid;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      steps[currentStep].completed = steps[currentStep].valid;
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("medical_cases")
        .update({
          title: formData.title,
          specialty: formData.specialty,
          modality: formData.modality,
          difficulty_level: formData.difficultyLevel,
          points: formData.points,
          patient_age: formData.patientAge,
          patient_gender: formData.patientGender,
          patient_clinical_info: formData.patientClinicalInfo,
          findings: formData.findings,
          main_question: formData.mainQuestion,
          answer_options: formData.answerOptions,
          answer_feedbacks: formData.answerFeedbacks,
          correct_answer_index: formData.correctAnswerIndex,
          explanation: formData.explanation,
          manual_hint: formData.manualHint,
          can_skip: formData.canSkip,
          max_elimination: formData.maxElimination,
          ai_hint_enabled: formData.aiHintEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      toast({
        title: "Caso atualizado com sucesso!",
        description: "Todas as alterações foram salvas.",
      });
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do Caso</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Digite um título descritivo"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidade</label>
                <Select value={formData.specialty} onValueChange={(value) => setFormData({...formData, specialty: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Modalidade</label>
                <Input
                  value={formData.modality}
                  onChange={(e) => setFormData({...formData, modality: e.target.value})}
                  placeholder="Ex: Radiografia, TC, RM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade (1-5)</label>
                <Select value={String(formData.difficultyLevel)} onValueChange={(value) => setFormData({...formData, difficultyLevel: Number(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Fácil</SelectItem>
                    <SelectItem value="2">2 - Fácil</SelectItem>
                    <SelectItem value="3">3 - Moderado</SelectItem>
                    <SelectItem value="4">4 - Difícil</SelectItem>
                    <SelectItem value="5">5 - Muito Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pontos</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={(e) => setFormData({...formData, points: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        );

      case "patient":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Idade do Paciente</label>
                <Input
                  value={formData.patientAge}
                  onChange={(e) => setFormData({...formData, patientAge: e.target.value})}
                  placeholder="Ex: 45 anos, 2 meses"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gênero</label>
                <Select value={formData.patientGender} onValueChange={(value) => setFormData({...formData, patientGender: value})}>
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
              <label className="text-sm font-medium">Informações Clínicas</label>
              <Textarea
                value={formData.patientClinicalInfo}
                onChange={(e) => setFormData({...formData, patientClinicalInfo: e.target.value})}
                placeholder="Descreva o histórico clínico, sintomas, exames anteriores..."
                rows={4}
              />
            </div>
          </div>
        );

      case "case":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Achados Radiológicos</label>
              <Textarea
                value={formData.findings}
                onChange={(e) => setFormData({...formData, findings: e.target.value})}
                placeholder="Descreva os principais achados observados nas imagens..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pergunta Principal</label>
              <Input
                value={formData.mainQuestion}
                onChange={(e) => setFormData({...formData, mainQuestion: e.target.value})}
                placeholder="Ex: Qual é o diagnóstico mais provável?"
              />
            </div>
          </div>
        );

      case "answers":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Alternativas de Resposta</label>
              {formData.answerOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswerIndex === index}
                      onChange={() => setFormData({...formData, correctAnswerIndex: index})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.answerOptions];
                      newOptions[index] = e.target.value;
                      setFormData({...formData, answerOptions: newOptions});
                    }}
                    placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <label className="text-sm font-medium">Feedback para cada alternativa</label>
              {formData.answerFeedbacks.map((feedback, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-gray-500">
                    Feedback para alternativa {String.fromCharCode(65 + index)}
                    {formData.correctAnswerIndex === index && (
                      <Badge className="ml-2 bg-green-100 text-green-700">Correta</Badge>
                    )}
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => {
                      const newFeedbacks = [...formData.answerFeedbacks];
                      newFeedbacks[index] = e.target.value;
                      setFormData({...formData, answerFeedbacks: newFeedbacks});
                    }}
                    placeholder="Explique porque esta alternativa está correta ou incorreta..."
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "explanation":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Explicação Completa</label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                placeholder="Forneça uma explicação detalhada sobre o caso, diagnóstico, tratamento..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dica Manual (Opcional)</label>
              <Textarea
                value={formData.manualHint}
                onChange={(e) => setFormData({...formData, manualHint: e.target.value})}
                placeholder="Dica que pode ser mostrada ao usuário se solicitada..."
                rows={3}
              />
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Ajuda</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Permitir pular questão</p>
                    <p className="text-xs text-gray-500">Usuário pode pular sem responder</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.canSkip}
                    onChange={(e) => setFormData({...formData, canSkip: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Habilitar dicas de IA</p>
                    <p className="text-xs text-gray-500">Permitir que IA forneça dicas</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.aiHintEnabled}
                    onChange={(e) => setFormData({...formData, aiHintEnabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Máximo de eliminações</label>
                  <Select value={String(formData.maxElimination)} onValueChange={(value) => setFormData({...formData, maxElimination: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhuma</SelectItem>
                      <SelectItem value="1">1 alternativa</SelectItem>
                      <SelectItem value="2">2 alternativas</SelectItem>
                      <SelectItem value="3">3 alternativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Wizard de Edição Avançada
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Progresso da Edição</h3>
                <span className="text-sm text-gray-500">{completedSteps}/{steps.length} etapas</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Steps Navigation */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    index === currentStep 
                      ? 'border-blue-500 bg-blue-50' 
                      : step.completed 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">{step.description}</p>
                  {step.completed && (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {steps[currentStep].icon}
                  {steps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button onClick={nextStep} disabled={!steps[currentStep].valid}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Finalizar Edição
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
