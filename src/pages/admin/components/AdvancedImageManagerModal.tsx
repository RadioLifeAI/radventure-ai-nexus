
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { AdvancedUploadTabSpecialized } from "@/components/admin/AdvancedUploadTabSpecialized";

interface AdvancedImageManagerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  categoryId?: number;
  modality?: string;
  currentImages?: string[];
  onImagesUpdated: (images: string[]) => void;
}

export function AdvancedImageManagerModal({
  open,
  onClose,
  caseId,
  categoryId,
  modality,
  currentImages = [],
  onImagesUpdated
}: AdvancedImageManagerModalProps) {
  
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
            Sistema Nativo de Imagens - Definitivo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <AdvancedUploadTabSpecialized
            caseId={caseId}
            categoryId={categoryId}
            modality={modality}
            onImagesChange={(images) => {
              // Forçar reload no componente pai quando imagens são processadas
              onImagesUpdated(images?.map(img => img.original_url) || []);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
