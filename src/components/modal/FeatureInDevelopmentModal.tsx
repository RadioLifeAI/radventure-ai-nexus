
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Construction, Sparkles, ArrowLeft } from "lucide-react";

interface FeatureInDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
  expectedDate?: string;
}

export function FeatureInDevelopmentModal({
  isOpen,
  onClose,
  featureName,
  description = "Esta funcionalidade está sendo desenvolvida com tecnologia avançada de IA.",
  expectedDate = "em breve"
}: FeatureInDevelopmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500">
            <Construction className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {featureName}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">
                Novidades em Desenvolvimento
              </span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• IA personalizada para trilhas de aprendizado</li>
              <li>• Sistema de conquistas e recompensas</li>
              <li>• Navegação inteligente entre casos</li>
              <li>• Interface gamificada avançada</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Disponível {expectedDate}
            </p>
            <Button onClick={onClose} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
