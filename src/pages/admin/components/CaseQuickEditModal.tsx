
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  Save, 
  Zap, 
  Target, 
  Calendar,
  Award,
  Brain,
  Clock
} from "lucide-react";

interface CaseQuickEditModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved: () => void;
}

export function CaseQuickEditModal({ open, onClose, caseId, onSaved }: CaseQuickEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Campos de edição rápida
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [modality, setModality] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [points, setPoints] = useState<number>(10);
  const [mainQuestion, setMainQuestion] = useState("");
  const [findings, setFindings] = useState("");

  useEffect(() => {
    if (open && caseId) {
      loadCaseData();
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
      setTitle(data.title || "");
      setSpecialty(data.specialty || "");
      setModality(data.modality || "");
      setDifficultyLevel(data.difficulty_level || 1);
      setPoints(data.points || 10);
      setMainQuestion(data.main_question || "");
      setFindings(data.findings || "");
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("medical_cases")
        .update({
          title,
          specialty,
          modality,
          difficulty_level: difficultyLevel,
          points,
          main_question: mainQuestion,
          findings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      toast({
        title: "Caso atualizado com sucesso!",
        description: "As alterações foram salvas.",
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

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-100 text-green-700",
      2: "bg-yellow-100 text-yellow-700",
      3: "bg-orange-100 text-orange-700",
      4: "bg-red-100 text-red-700",
      5: "bg-purple-100 text-purple-700"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Edição Rápida do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header com informações básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  ID: {caseData?.case_number || caseId?.slice(0, 8)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(difficultyLevel)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {getDifficultyLabel(difficultyLevel)}
                </Badge>
                <Badge variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  {points} pontos
                </Badge>
                {caseData?.is_radiopaedia_case && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Radiopaedia
                  </Badge>
                )}
              </div>
            </div>

            {/* Campos de edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título do Caso</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do caso"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidade</label>
                <Select value={specialty} onValueChange={setSpecialty}>
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
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  placeholder="Ex: Radiografia, TC, RM"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={String(difficultyLevel)} onValueChange={(value) => setDifficultyLevel(Number(value))}>
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
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Badge variant="secondary" className="w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pergunta Principal</label>
                <Input
                  value={mainQuestion}
                  onChange={(e) => setMainQuestion(e.target.value)}
                  placeholder="Ex: Qual é o diagnóstico mais provável?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Achados Principais</label>
                <Textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Descreva os principais achados radiológicos..."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Última modificação: {caseData?.updated_at ? new Date(caseData.updated_at).toLocaleString('pt-BR') : 'N/A'}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
