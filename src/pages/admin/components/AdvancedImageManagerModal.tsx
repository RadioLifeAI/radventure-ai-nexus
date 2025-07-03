
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { AdvancedUploadTabSpecialized } from "@/components/admin/AdvancedUploadTabSpecialized";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdvancedImageManagerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  currentImages?: string[];
  onImagesUpdated: (images: string[]) => void;
}

export function AdvancedImageManagerModal({
  open,
  onClose,
  caseId,
  currentImages = [],
  onImagesUpdated
}: AdvancedImageManagerModalProps) {
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<{categoryId?: number; modality?: string} | null>(null);
  
  // Buscar dados do caso automaticamente quando modal abre
  useEffect(() => {
    if (open && caseId && !caseData) {
      fetchCaseData();
    }
  }, [open, caseId]);

  const fetchCaseData = async () => {
    if (!caseId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Buscando dados do caso para simplificação:', caseId);
      
      const { data: caseInfo, error } = await supabase
        .from('medical_cases')
        .select('category_id, modality')
        .eq('id', caseId)
        .single();

      if (error) throw error;

      console.log('✅ Dados do caso obtidos:', caseInfo);
      setCaseData({
        categoryId: caseInfo.category_id,
        modality: caseInfo.modality
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do caso:', error);
    } finally {
      setLoading(false);
    }
  };

  // SISTEMA DEFINITIVO: Só permitir upload se caseId existir
  if (!caseId) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Sistema Nativo de Imagens
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-12">
            <p className="text-gray-600">
              O caso precisa ser criado antes de adicionar imagens.
              <br />
              Sistema nativo requer case ID válido.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Upload de Imagens - Sistema WebP Especializado
          </DialogTitle>
          {caseData && (
            <p className="text-sm text-gray-600">
              Especialidade: <strong>{caseData.categoryId}</strong> | Modalidade: <strong>{caseData.modality}</strong>
            </p>
          )}
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando dados do caso...</span>
          </div>
        ) : caseData ? (
          <div className="space-y-4">
            <AdvancedUploadTabSpecialized
              caseId={caseId}
              categoryId={caseData.categoryId}
              modality={caseData.modality}
              onImagesChange={(images) => {
                // Forçar reload no componente pai quando imagens são processadas
                onImagesUpdated(images?.map(img => img.original_url) || []);
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Erro ao carregar dados do caso.
              <br />
              Verifique se o caso foi criado corretamente.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
