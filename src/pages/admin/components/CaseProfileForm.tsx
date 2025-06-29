
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseCreationWizard } from "./CaseCreationWizard";
import { useCaseProfileFormState } from "../hooks/useCaseProfileFormState";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";
import { useTempCaseImages } from "@/hooks/useTempCaseImages";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CaseProfileFormProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileForm({ editingCase, onCreated }: CaseProfileFormProps) {
  const navigate = useNavigate();
  const { form, setForm, resetForm } = useCaseProfileFormState();
  const { associateWithCase, clearTempImages } = useTempCaseImages();
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const { specialties, modalities, difficulties, isLoading } = useUnifiedFormDataSource();
  const handlers = useCaseProfileFormHandlers({ 
    form, 
    setForm,
    categories: specialties,
    difficulties
  });

  useEffect(() => {
    if (editingCase) {
      setForm(editingCase);
    }
  }, [editingCase, setForm]);

  const renderTooltipTip = (id: string, content: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle
          id={id}
          className="inline-block h-4 w-4 text-blue-500 ml-1 cursor-pointer"
        />
      </TooltipTrigger>
      <TooltipContent side="right" align="start">
        <p className="max-w-[200px] text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);
    setFeedback("Preparando dados do caso...");
    
    try {
      console.log('💾 Iniciando salvamento integrado do caso');
      console.log('📊 Form antes do salvamento:', {
        title: form.title,
        image_url_length: form.image_url?.length || 0,
        image_url: form.image_url
      });

      // Preparar dados do caso com conversões de tipo necessárias
      const caseData = {
        ...form,
        image_url: Array.isArray(form.image_url) ? form.image_url : [],
        category_id: form.category_id ? parseInt(form.category_id) : null,
        difficulty_level: form.difficulty_level ? parseInt(form.difficulty_level) : null,
        points: form.points ? parseInt(form.points) : null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      };

      setFeedback("Salvando caso médico...");

      let savedCase;
      if (editingCase) {
        // Modo de edição
        const { data, error } = await supabase
          .from("medical_cases")
          .update(caseData)
          .eq("id", editingCase.id)
          .select()
          .single();

        if (error) throw error;
        savedCase = data;
      } else {
        // Modo de criação
        const { data, error } = await supabase
          .from("medical_cases")
          .insert(caseData)
          .select()
          .single();

        if (error) throw error;
        savedCase = data;
      }

      console.log('✅ Caso salvo:', savedCase.id);
      
      // FASE 2: Associar imagens temporárias ao caso salvo
      if (!editingCase && form.image_url?.length > 0) {
        setFeedback("Processando imagens...");
        
        try {
          const associatedImages = await associateWithCase(savedCase.id);
          console.log('🖼️ Imagens associadas:', associatedImages.length);
          
          // Limpar imagens temporárias após associação
          clearTempImages();
          
          setFeedback("Imagens processadas com sucesso!");
        } catch (imageError) {
          console.warn('⚠️ Erro ao associar imagens:', imageError);
          // Não falhar o salvamento por erro de imagem
        }
      }

      // Feedback de sucesso
      toast({
        title: editingCase ? "Caso atualizado!" : "Caso criado!",
        description: `${savedCase.title || 'Novo caso'} foi ${editingCase ? 'atualizado' : 'criado'} com sucesso.`,
        className: "bg-green-50 border-green-200",
      });

      // Resetar formulário ou chamar callback
      if (editingCase) {
        onCreated?.();
      } else {
        resetForm();
        navigate('/admin/gestao-casos');
      }

    } catch (error: any) {
      console.error('❌ Erro no salvamento:', error);
      toast({
        title: "Erro ao salvar caso",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setFeedback("");
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <CaseCreationWizard
        form={form}
        setForm={setForm}
        highlightedFields={highlightedFields}
        setHighlightedFields={setHighlightedFields}
        handlers={handlers}
        categories={specialties}
        difficulties={difficulties}
        isEditMode={!!editingCase}
        editingCase={editingCase}
        onSubmit={handleSubmit}
        submitting={submitting}
        feedback={feedback}
        renderTooltipTip={renderTooltipTip}
      />
    </TooltipProvider>
  );
}
