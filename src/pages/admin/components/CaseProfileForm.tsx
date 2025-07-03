
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
      console.log('💾 Sistema unificado - Salvamento do caso');
      console.log('📊 Form data:', {
        title: form.title,
        image_count: Array.isArray(form.image_url) ? form.image_url.length : 0,
        isEditMode: !!editingCase
      });

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
      
      // SISTEMA UNIFICADO: Sincronizar imagens após salvamento
      await syncCaseImages(savedCase.id, caseData.image_url);
      
      setFeedback("Caso salvo com sucesso!");

      toast({
        title: editingCase ? "Caso atualizado!" : "Caso criado!",
        description: `${savedCase.title || 'Novo caso'} foi ${editingCase ? 'atualizado' : 'criado'} com sucesso.`,
        className: "bg-green-50 border-green-200",
      });

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

  // FUNÇÃO DE SINCRONIZAÇÃO UNIFICADA
  const syncCaseImages = async (caseId: string, imageUrls: string[]) => {
    try {
      console.log('🔄 Sincronizando imagens do sistema unificado para caso:', caseId);
      
      if (!imageUrls || imageUrls.length === 0) {
        console.log('⚠️ Nenhuma imagem para sincronizar');
        return;
      }

      // 1. Mover imagens temporárias para path definitivo (se necessário)
      const finalImageUrls: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        
        // Se a URL contém "temp_", mover para path definitivo
        if (imageUrl.includes('temp_')) {
          try {
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const tempPath = `temp_${Date.now()}/${fileName}`;
            const finalPath = `${caseId}/${fileName}`;
            
            // Copiar arquivo
            const { data: fileData } = await supabase.storage
              .from('case-images')
              .download(tempPath);
            
            if (fileData) {
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('case-images')
                .upload(finalPath, fileData, { upsert: true });
              
              if (!uploadError) {
                // Obter nova URL
                const { data: { publicUrl }} = supabase.storage
                  .from('case-images')
                  .getPublicUrl(finalPath);
                
                finalImageUrls.push(publicUrl);
                
                // Remover arquivo temporário
                await supabase.storage
                  .from('case-images')
                  .remove([tempPath]);
              }
            }
          } catch (moveError) {
            console.warn('Erro ao mover imagem temporária:', moveError);
            // Manter URL original se não conseguir mover
            finalImageUrls.push(imageUrl);
          }
        } else {
          finalImageUrls.push(imageUrl);
        }
      }

      // 2. Inserir registros na tabela case_images
      const imageRecords = finalImageUrls.map((url, index) => ({
        case_id: caseId,
        original_filename: `image_${index + 1}.jpg`,
        original_url: url,
        processing_status: 'completed',
        sequence_order: index
      }));

      const { error: insertError } = await supabase
        .from('case_images')
        .upsert(imageRecords, { 
          onConflict: 'case_id,original_url',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.warn('Erro ao inserir registros case_images:', insertError);
      }

      // 3. Atualizar campo image_url no caso
      const { error: updateError } = await supabase
        .from('medical_cases')
        .update({ image_url: finalImageUrls })
        .eq('id', caseId);

      if (updateError) {
        console.warn('Erro ao atualizar image_url:', updateError);
      }

      console.log('✅ Sincronização de imagens concluída:', finalImageUrls.length);
      
    } catch (error) {
      console.error('❌ Erro na sincronização de imagens:', error);
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
