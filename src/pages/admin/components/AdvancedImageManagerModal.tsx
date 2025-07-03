
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { CaseImageUploader } from "./CaseImageUploader";

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
          <CaseImageUploader
            caseId={caseId}
            onUploadComplete={() => {
              // A sincronização automática via trigger cuidará da atualização
              onImagesUpdated([]); // Forçar reload no componente pai
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
