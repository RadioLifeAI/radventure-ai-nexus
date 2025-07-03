
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { DirectImageUpload } from "./DirectImageUpload";

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
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Gerenciamento de Imagens - Sistema Simplificado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <DirectImageUpload
            caseId={caseId}
            currentImages={currentImages}
            onImagesChange={onImagesUpdated}
            isEditMode={!!caseId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
