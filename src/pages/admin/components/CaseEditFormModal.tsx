
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseProfileForm } from "./CaseProfileForm";

type CaseEditFormModalProps = {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onSaved: () => void;
};

export function CaseEditFormModal({ open, onClose, caseId, onSaved }: CaseEditFormModalProps) {
  const [editingCase, setEditingCase] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && caseId) {
      loadCaseData();
    } else {
      setEditingCase(null);
    }
  }, [open, caseId]);

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
      console.error("Erro ao carregar caso:", error);
      toast({ title: "Erro ao carregar caso", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCaseUpdated = () => {
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Caso Médico</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">Carregando dados do caso...</div>
          </div>
        ) : editingCase ? (
          <CaseProfileForm 
            editingCase={editingCase}
            onCreated={handleCaseUpdated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
