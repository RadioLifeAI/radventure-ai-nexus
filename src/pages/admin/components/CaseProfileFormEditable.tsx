import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CaseFormWithAdvancedUpload } from "./CaseFormWithAdvancedUpload";
import { 
  Save, 
  Eye, 
  Wand2, 
  Brain, 
  FileText,
  Upload,
  CheckCircle
} from "lucide-react";

interface CaseProfileFormEditableProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileFormEditable({ editingCase, onCreated }: CaseProfileFormEditableProps) {
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    specialty: "",
    modality: "",
    description: "",
    main_question: "",
    findings: "",
    patient_clinical_info: "",
    answer_options: ["", "", "", ""],
    answer_feedbacks: ["", "", "", ""],
    answer_short_tips: ["", "", "", ""],
    correct_answer_index: 0,
    points: 10,
    difficulty_level: 1,
    explanation: "",
  });

  useEffect(() => {
    loadCategories();
    if (editingCase) {
      setFormData({
        title: editingCase.title || "",
        specialty: editingCase.specialty || "",
        modality: editingCase.modality || "",
        description: editingCase.description || "",
        main_question: editingCase.main_question || "",
        findings: editingCase.findings || "",
        patient_clinical_info: editingCase.patient_clinical_info || "",
        answer_options: editingCase.answer_options || ["", "", "", ""],
        answer_feedbacks: editingCase.answer_feedbacks || ["", "", "", ""],
        answer_short_tips: editingCase.answer_short_tips || ["", "", "", ""],
        correct_answer_index: editingCase.correct_answer_index || 0,
        points: editingCase.points || 10,
        difficulty_level: editingCase.difficulty_level || 1,
        explanation: editingCase.explanation || "",
      });
    }
  }, [editingCase]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("medical_specialties")
      .select("id, name")
      .order("name");
    setCategories(data || []);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const caseData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingCase) {
        const { data, error } = await supabase
          .from("medical_cases")
          .update(caseData)
          .eq("id", editingCase.id)
          .select()
          .single();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from("medical_cases")
          .insert([caseData])
          .select()
          .single();
        result = { data, error };
      }

      if (result.error) throw result.error;

      toast({
        title: "✅ Caso salvo com sucesso!",
        description: editingCase ? "Alterações aplicadas." : "Novo caso criado.",
      });

      onCreated?.();
    } catch (error: any) {
      console.error("Erro ao salvar caso:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const originalForm = (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            {editingCase ? "Editar Caso Médico" : "Criar Novo Caso"}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Formulário Principal
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do Caso</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Digite o título do caso"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Especialidade</label>
              <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
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
                onChange={(e) => handleInputChange("modality", e.target.value)}
                placeholder="Ex: Radiografia, TC, RM"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pontos</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => handleInputChange("points", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição do Caso</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o contexto clínico do caso..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pergunta e Alternativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pergunta Principal</label>
            <Input
              value={formData.main_question}
              onChange={(e) => handleInputChange("main_question", e.target.value)}
              placeholder="Ex: Qual é o diagnóstico mais provável?"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Alternativas de Resposta</label>
            {formData.answer_options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant={formData.correct_answer_index === index ? "default" : "outline"}>
                  {String.fromCharCode(65 + index)}
                </Badge>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.answer_options];
                    newOptions[index] = e.target.value;
                    handleInputChange("answer_options", newOptions);
                  }}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={formData.correct_answer_index === index ? "default" : "outline"}
                  onClick={() => handleInputChange("correct_answer_index", index)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingCase ? "Salvar Alterações" : "Criar Caso"}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <CaseFormWithAdvancedUpload 
      caseId={editingCase?.id}
      onImagesChange={(images) => {
        console.log('Imagens atualizadas:', images);
      }}
    >
      {originalForm}
    </CaseFormWithAdvancedUpload>
  );
}
