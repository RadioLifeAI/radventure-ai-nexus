
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseCreationWizard } from "./CaseCreationWizard";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CaseProfileFormProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileForm({ editingCase, onCreated }: CaseProfileFormProps) {
  const navigate = useNavigate();
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const { specialties, modalities, difficulties, isLoading } = useUnifiedFormDataSource();
  
  // Hook refatorado - agora gerencia seu próprio estado
  const handlers = useCaseProfileFormHandlers({ 
    categories: specialties,
    difficulties
  });

  const { form, setForm, resetForm } = handlers;

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
    setFeedback("Salvando caso médico...");
    
    try {
      console.log('💾 Salvamento simplificado do caso');
      console.log('📊 Form data:', {
        title: form.title,
        image_count: Array.isArray(form.image_url) ? form.image_url.length : 0
      });

      // Função para tratar campos de data
      const sanitizeDateField = (dateValue: any) => {
        if (!dateValue || dateValue === '' || dateValue === 'undefined') {
          return null;
        }
        return dateValue;
      };

      // Preparar dados do caso
      const caseData = {
        ...form,
        image_url: Array.isArray(form.image_url) ? form.image_url : [],
        category_id: form.category_id ? parseInt(form.category_id) : null,
        difficulty_level: form.difficulty_level ? parseInt(form.difficulty_level) : null,
        points: form.points ? parseInt(form.points) : null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
        access_date: sanitizeDateField(form.access_date),
        reference_citation: form.is_radiopaedia_case ? (form.reference_citation || null) : null,
        reference_url: form.is_radiopaedia_case ? (form.reference_url || null) : null
      };

      // Validação para casos do Radiopaedia
      if (form.is_radiopaedia_case) {
        if (!caseData.reference_citation?.trim()) {
          toast({
            title: "Citação da referência é obrigatória para casos do Radiopaedia",
            variant: "destructive"
          });
          return;
        }
        if (!caseData.reference_url?.trim()) {
          toast({
            title: "URL de referência é obrigatória para casos do Radiopaedia", 
            variant: "destructive"
          });
          return;
        }
      }

      let savedCase;
      if (editingCase) {
        // Modo de edição
        const { data, error } = await supabase
          .from("medical_cases")
          .update(caseData)
          .eq("id", editingCase.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro na atualização:', error);
          throw error;
        }
        savedCase = data;
      } else {
        // Modo de criação
        const { data, error } = await supabase
          .from("medical_cases")
          .insert(caseData)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro na criação:', error);
          throw error;
        }
        savedCase = data;
      }

      console.log('✅ Caso salvo:', savedCase.id);
      
      // Sistema simplificado: imagens já foram carregadas via DirectImageUpload
      // Não há necessidade de processamento adicional
      
      setFeedback("Caso salvo com sucesso!");

      // Toast de sucesso
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
      
      let errorMessage = error.message || "Erro desconhecido";
      if (error.message?.includes('Invalid input syntax for type date')) {
        errorMessage = "Erro na data informada. Verifique o campo de data de acesso.";
      }
      
      toast({
        title: "Erro ao salvar caso",
        description: errorMessage,
        variant: "destructive",
      });
      
      setFeedback("Erro no salvamento. Verifique os dados informados.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(""), 3000);
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
