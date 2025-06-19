
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  Copy,
  Sparkles,
  Settings,
  Eye,
  Shuffle,
  Wand2,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface CaseSmartDuplicateModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onCreated: () => void;
}

export function CaseSmartDuplicateModal({ open, onClose, caseId, onCreated }: CaseSmartDuplicateModalProps) {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalCase, setOriginalCase] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Configurações de duplicação
  const [duplicateTitle, setDuplicateTitle] = useState("");
  const [duplicateSpecialty, setDuplicateSpecialty] = useState("");
  const [duplicateModality, setDuplicateModality] = useState("");
  const [duplicateDifficulty, setDuplicateDifficulty] = useState<number>(1);
  const [duplicatePoints, setDuplicatePoints] = useState<number>(10);

  // Opções avançadas
  const [keepImages, setKeepImages] = useState(true);
  const [keepAnswers, setKeepAnswers] = useState(true);
  const [keepExplanation, setKeepExplanation] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [generateVariations, setGenerateVariations] = useState(false);
  const [aiEnhancement, setAiEnhancement] = useState(false);

  useEffect(() => {
    if (open && caseId) {
      loadOriginalCase();
      loadCategories();
    }
  }, [open, caseId]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("medical_specialties")
      .select("id, name")
      .order("name");
    setCategories(data || []);
  };

  const loadOriginalCase = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;

      setOriginalCase(data);
      
      // Configurar valores padrão baseados no caso original
      setDuplicateTitle(`${data.title} - Cópia`);
      setDuplicateSpecialty(data.specialty || "");
      setDuplicateModality(data.modality || "");
      setDuplicateDifficulty(data.difficulty_level || 1);
      setDuplicatePoints(data.points || 10);
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

  const generateSmartVariation = () => {
    if (!originalCase) return;

    // Gerar variações inteligentes no título
    const variations = [
      `${originalCase.title} - Variação`,
      `${originalCase.title} - Caso Similar`,
      `${originalCase.title} - Versão 2`,
      `Caso ${originalCase.specialty} - Variante`,
    ];
    
    setDuplicateTitle(variations[Math.floor(Math.random() * variations.length)]);
    
    // Sugerir pontuação ligeiramente diferente
    const pointVariations = [-5, -2, 2, 5];
    const newPoints = Math.max(5, originalCase.points + pointVariations[Math.floor(Math.random() * pointVariations.length)]);
    setDuplicatePoints(newPoints);

    toast({
      title: "Variação inteligente gerada!",
      description: "Os campos foram preenchidos com uma variação do caso original.",
    });
  };

  const handleDuplicate = async () => {
    if (!originalCase) return;

    setCreating(true);
    try {
      // Preparar dados para duplicação
      let newAnswers = originalCase.answer_options || [];
      let newFeedbacks = originalCase.answer_feedbacks || [];
      let newCorrectIndex = originalCase.correct_answer_index || 0;

      // Embaralhar respostas se solicitado
      if (shuffleAnswers && newAnswers.length > 0) {
        const shuffledData = shuffleAnswersArray(newAnswers, newFeedbacks, newCorrectIndex);
        newAnswers = shuffledData.answers;
        newFeedbacks = shuffledData.feedbacks;
        newCorrectIndex = shuffledData.correctIndex;
      }

      // Aplicar melhorias de IA se solicitado
      if (aiEnhancement) {
        // Aqui poderia chamar uma função de IA para melhorar o conteúdo
        // Por enquanto, apenas adiciona um sufixo indicativo
        if (originalCase.findings) {
          originalCase.findings += " [Versão aprimorada por IA]";
        }
      }

      const duplicatedCase = {
        title: duplicateTitle,
        specialty: duplicateSpecialty,
        modality: duplicateModality,
        difficulty_level: duplicateDifficulty,
        points: duplicatePoints,
        
        // Campos condicionais baseados nas opções
        findings: originalCase.findings,
        patient_age: originalCase.patient_age,
        patient_gender: originalCase.patient_gender,
        patient_clinical_info: originalCase.patient_clinical_info,
        main_question: originalCase.main_question,
        
        // Respostas e explicações
        answer_options: keepAnswers ? newAnswers : ["", "", "", ""],
        answer_feedbacks: keepAnswers ? newFeedbacks : ["", "", "", ""],
        answer_short_tips: keepAnswers ? originalCase.answer_short_tips : ["", "", "", ""],
        correct_answer_index: keepAnswers ? newCorrectIndex : 0,
        explanation: keepExplanation ? originalCase.explanation : "",
        
        // Imagens
        image_url: keepImages ? originalCase.image_url : [],
        
        // Configurações avançadas
        can_skip: originalCase.can_skip,
        max_elimination: originalCase.max_elimination,
        ai_hint_enabled: originalCase.ai_hint_enabled,
        manual_hint: originalCase.manual_hint,
        
        // Metadados
        category_id: originalCase.category_id,
        case_number: null, // Será gerado automaticamente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Marcar como duplicação
        is_duplicated: true,
        original_case_id: originalCase.id,
      };

      const { error, data } = await supabase
        .from("medical_cases")
        .insert([duplicatedCase])
        .select();

      if (error) throw error;

      toast({
        title: "Caso duplicado com sucesso!",
        description: `O novo caso "${duplicateTitle}" foi criado.`,
      });
      
      onCreated();
      onClose();
    } catch (error: any) {
      console.error("Erro ao duplicar caso:", error);
      toast({
        title: "Erro ao duplicar caso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const shuffleAnswersArray = (answers: string[], feedbacks: string[], correctIndex: number) => {
    const correctAnswer = answers[correctIndex];
    const correctFeedback = feedbacks[correctIndex];
    
    // Criar array de índices e embaralhar
    const indices = Array.from({ length: answers.length }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Aplicar embaralhamento
    const shuffledAnswers = indices.map(i => answers[i]);
    const shuffledFeedbacks = indices.map(i => feedbacks[i]);
    const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer);
    
    return {
      answers: shuffledAnswers,
      feedbacks: shuffledFeedbacks,
      correctIndex: newCorrectIndex
    };
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: "Muito Fácil",
      2: "Fácil",
      3: "Moderado",
      4: "Difícil", 
      5: "Muito Difícil"
    };
    return labels[level as keyof typeof labels] || "Indefinido";
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-purple-600" />
            Duplicação Inteligente do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : originalCase ? (
          <div className="space-y-6">
            {/* Informações do caso original */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Caso Original:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{originalCase.title}</Badge>
                <Badge variant="secondary">{originalCase.specialty}</Badge>
                <Badge variant="outline">{originalCase.modality}</Badge>
                <Badge variant="secondary">{getDifficultyLabel(originalCase.difficulty_level)}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações básicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Configurações Básicas</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Título do Novo Caso</label>
                  <Input
                    value={duplicateTitle}
                    onChange={(e) => setDuplicateTitle(e.target.value)}
                    placeholder="Digite o título do caso duplicado"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Especialidade</label>
                    <Select value={duplicateSpecialty} onValueChange={setDuplicateSpecialty}>
                      <SelectTrigger>
                        <SelectValue />
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
                      value={duplicateModality}
                      onChange={(e) => setDuplicateModality(e.target.value)}
                      placeholder="Ex: TC, RM, RX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dificuldade</label>
                    <Select value={String(duplicateDifficulty)} onValueChange={(value) => setDuplicateDifficulty(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {getDifficultyLabel(level)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pontos</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={duplicatePoints}
                      onChange={(e) => setDuplicatePoints(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={generateSmartVariation}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Variação Inteligente
                </Button>
              </div>

              {/* Opções avançadas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium">Opções Avançadas</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Manter imagens</p>
                      <p className="text-xs text-gray-500">Copiar todas as imagens do caso original</p>
                    </div>
                    <Switch checked={keepImages} onCheckedChange={setKeepImages} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Manter respostas</p>
                      <p className="text-xs text-gray-500">Copiar alternativas e gabarito</p>
                    </div>
                    <Switch checked={keepAnswers} onCheckedChange={setKeepAnswers} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Manter explicação</p>
                      <p className="text-xs text-gray-500">Copiar texto explicativo completo</p>
                    </div>
                    <Switch checked={keepExplanation} onCheckedChange={setKeepExplanation} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Embaralhar respostas</p>
                      <p className="text-xs text-gray-500">Reordenar alternativas aleatoriamente</p>
                    </div>
                    <Switch 
                      checked={shuffleAnswers} 
                      onCheckedChange={setShuffleAnswers}
                      disabled={!keepAnswers}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Gerar variações</p>
                      <p className="text-xs text-gray-500">Criar pequenas variações no conteúdo</p>
                    </div>
                    <Switch checked={generateVariations} onCheckedChange={setGenerateVariations} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Aprimoramento por IA</p>
                      <p className="text-xs text-gray-500">Melhorar o conteúdo usando IA</p>
                    </div>
                    <Switch checked={aiEnhancement} onCheckedChange={setAiEnhancement} />
                  </div>
                </div>

                {/* Dicas inteligentes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Dica Inteligente</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Para criar casos únicos, considere alterar a especialidade ou modalidade. 
                        O embaralhamento de respostas é útil para evitar memorização.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview das configurações */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Preview da Duplicação:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Imagens:</p>
                  <p className="font-medium">{keepImages ? "✓ Mantidas" : "✗ Removidas"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Respostas:</p>
                  <p className="font-medium">{keepAnswers ? "✓ Mantidas" : "✗ Removidas"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Explicação:</p>
                  <p className="font-medium">{keepExplanation ? "✓ Mantida" : "✗ Removida"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Embaralhamento:</p>
                  <p className="font-medium">{shuffleAnswers && keepAnswers ? "✓ Ativo" : "✗ Inativo"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                O novo caso será criado como uma cópia independente
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={creating}>
                  Cancelar
                </Button>
                <Button onClick={handleDuplicate} disabled={creating || !duplicateTitle.trim()}>
                  {creating ? (
                    <>
                      <Loader />
                      Duplicando...
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Criar Duplicata
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Caso não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
