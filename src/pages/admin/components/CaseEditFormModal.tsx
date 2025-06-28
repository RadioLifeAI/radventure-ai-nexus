
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseFormWithAdvancedUpload } from "./CaseFormWithAdvancedUpload";
import { CaseProfileForm } from "./CaseProfileForm";

type CaseEditFormModalProps = {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved: () => void;
};

export function CaseEditFormModal({ open, onClose, caseId, onSaved }: CaseEditFormModalProps) {
  console.log('🔧 CaseEditFormModal: Modal status', { open, caseId });

  const [editingCase, setEditingCase] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && caseId) {
      console.log('📥 CaseEditFormModal: Carregando dados do caso:', caseId);
      loadCaseData();
    } else {
      setEditingCase(null);
    }
  }, [open, caseId]);

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      console.log('🔍 CaseEditFormModal: Buscando caso no banco de dados...');
      
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) {
        console.error('❌ CaseEditFormModal: Erro ao carregar caso:', error);
        throw error;
      }

      console.log('✅ CaseEditFormModal: Caso carregado com sucesso:', data?.title);

      // Transform data to match form structure
      const transformedData = {
        ...data,
        image_url: Array.isArray(data.image_url) ? data.image_url : [],
        answer_options: data.answer_options || ["", "", "", ""],
        answer_feedbacks: data.answer_feedbacks || ["", "", "", ""],
        answer_short_tips: data.answer_short_tips || ["", "", "", ""],
        correct_answer_index: data.correct_answer_index || 0,
      };

      setEditingCase(transformedData);
    } catch (error: any) {
      console.error("❌ CaseEditFormModal: Erro ao carregar caso:", error);
      toast({ title: "Erro ao carregar caso", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCaseUpdated = () => {
    console.log('💾 CaseEditFormModal: Caso atualizado, fechando modal...');
    onSaved();
    onClose();
  };

  console.log('🎨 CaseEditFormModal: Renderizando modal', { loading, hasEditingCase: !!editingCase });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-6 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Editar Caso Médico - Sistema Avançado
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px] bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Carregando dados do caso...</div>
            </div>
          </div>
        ) : editingCase ? (
          <div className="bg-white">
            <CaseFormWithAdvancedUpload 
              caseId={editingCase.id}
              onImagesChange={(images) => {
                console.log('Imagens do caso atualizadas:', images);
              }}
            >
              <CaseProfileForm 
                editingCase={editingCase}
                onCreated={handleCaseUpdated}
              />
            </CaseFormWithAdvancedUpload>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
