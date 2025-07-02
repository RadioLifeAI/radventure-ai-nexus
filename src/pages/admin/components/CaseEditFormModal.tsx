
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";  
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseProfileForm } from "./CaseProfileForm";
import { AdvancedImageManagerModal } from "./AdvancedImageManagerModal";
import { 
  Sparkles, 
  Image as ImageIcon,
  TestTube
} from "lucide-react";

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
  const [showAdvancedImageModal, setShowAdvancedImageModal] = useState(false);

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

      // CORREÇÃO: Carregar imagens usando get_case_images_unified
      let imageUrls: string[] = [];
      try {
        const { data: imagesData, error: imagesError } = await supabase
          .rpc('get_case_images_unified', { p_case_id: caseId });
        
        if (!imagesError && imagesData) {
          // Garantir que é um array e mapear corretamente
          const imagesArray = Array.isArray(imagesData) ? imagesData : [];
          imageUrls = imagesArray
            .map((img: any) => typeof img === 'object' && img?.url ? String(img.url) : String(img))
            .filter((url: string) => url && url.trim() !== '');
          console.log('✅ CaseEditFormModal: Imagens carregadas via função:', imageUrls.length);
        } else {
          console.warn('⚠️ CaseEditFormModal: Fallback para image_url do caso');
          // Garantir que data.image_url é tratado como array de strings
          const legacyUrls = Array.isArray(data.image_url) ? data.image_url : [];
          imageUrls = legacyUrls
            .map((url: any) => String(url))
            .filter((url: string) => url && url.trim() !== '');
        }
      } catch (imageLoadError) {
        console.error('❌ CaseEditFormModal: Erro ao carregar imagens:', imageLoadError);
        // Fallback seguro
        const legacyUrls = Array.isArray(data.image_url) ? data.image_url : [];
        imageUrls = legacyUrls
          .map((url: any) => String(url))
          .filter((url: string) => url && url.trim() !== '');
      }

      // Transform data to match form structure
      const transformedData = {
        ...data,
        image_url: imageUrls,
        answer_options: data.answer_options || ["", "", "", ""],
        answer_feedbacks: data.answer_feedbacks || ["", "", "", ""],
        answer_short_tips: data.answer_short_tips || ["", "", "", ""],
        correct_answer_index: data.correct_answer_index || 0,
      };

      console.log('📊 CaseEditFormModal: Dados transformados:', {
        title: transformedData.title,
        imageCount: transformedData.image_url.length,
        hasImages: transformedData.image_url.length > 0
      });

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

  const handleAdvancedImagesUpdated = (images: any[]) => {
    if (editingCase) {
      setEditingCase(prev => ({ ...prev, image_url: images }));
      toast({ 
        title: "🎉 Imagens Atualizadas!", 
        description: `${images.length} imagem(ns) processada(s) com ferramentas avançadas.` 
      });
    }
  };

  console.log('🎨 CaseEditFormModal: Renderizando modal', { loading, hasEditingCase: !!editingCase });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800">
                Editar Caso Médico
              </DialogTitle>
              
              {/* Botão de Ferramentas Avançadas - MELHORADO */}
              {editingCase && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setShowAdvancedImageModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-2 shadow-lg"
                  >
                    <TestTube className="h-5 w-5 mr-2" />
                    Ferramentas PRO
                    <Badge variant="secondary" className="ml-2 bg-yellow-300 text-purple-800 font-bold text-xs">
                      AVANÇADO
                    </Badge>
                  </Button>
                  <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-700">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {Array.isArray(editingCase.image_url) ? editingCase.image_url.length : 0} imagem(ns)
                  </Badge>
                </div>
              )}
            </div>
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
              <CaseProfileForm 
                editingCase={editingCase}
                onCreated={handleCaseUpdated}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal de Ferramentas Avançadas */}
      <AdvancedImageManagerModal
        open={showAdvancedImageModal}
        onClose={() => setShowAdvancedImageModal(false)}
        caseId={caseId || undefined}
        currentImages={editingCase?.image_url || []}
        onImagesUpdated={handleAdvancedImagesUpdated}
      />
    </>
  );
}
