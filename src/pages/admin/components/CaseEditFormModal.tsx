
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
import { UnifiedImageSystemTabs } from "./UnifiedImageSystemTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Image as ImageIcon,
  TestTube,
  FolderTree
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
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  // Estados para integração do sistema de imagens
  const [currentCategoryId, setCurrentCategoryId] = useState<number | undefined>(undefined);
  const [currentModality, setCurrentModality] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Carregar categorias
    supabase.from("medical_specialties")
      .select("id, name")
      .then(({ data, error }) => {
        if (!error) {
          setCategories(data || []);
        }
      });
  }, []);

  useEffect(() => {
    if (open && caseId) {
      console.log('📥 CaseEditFormModal: Carregando dados do caso:', caseId);
      loadCaseData();
    } else {
      setEditingCase(null);
    }
  }, [open, caseId]);

  // Sincronização com dados do caso
  useEffect(() => {
    if (editingCase) {
      const newCategoryId = editingCase.category_id ? Number(editingCase.category_id) : undefined;
      const newModality = editingCase.modality || undefined;
      
      if (newCategoryId !== currentCategoryId || newModality !== currentModality) {
        setCurrentCategoryId(newCategoryId);
        setCurrentModality(newModality);
      }
    }
  }, [editingCase]);

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

  const handleAdvancedImagesUpdated = (images: any[]) => {
    if (editingCase) {
      setEditingCase(prev => ({ ...prev, image_url: images }));
      toast({ 
        title: "🎉 Imagens Especializadas Atualizadas!", 
        description: `${images.length} imagem(ns) organizadas no sistema especializado.` 
      });
    }
  };

  const handleImagesChange = (images: any[]) => {
    console.log('📸 Imagens atualizadas pelo sistema unificado:', images.length);
    toast({ 
      title: "🎯 Sistema Integrado!", 
      description: `${images.length} imagem(ns) organizadas conforme caso.` 
    });
  };

  console.log('🎨 CaseEditFormModal: Renderizando modal', { loading, hasEditingCase: !!editingCase });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50">
          <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 -m-6 mb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FolderTree className="h-6 w-6 text-green-600" />
                Editar Caso Médico - Sistema Especializado
              </DialogTitle>
              
              {/* Botão de Ferramentas Especializadas */}
              {editingCase && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setShowAdvancedImageModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-2 shadow-lg"
                  >
                    <TestTube className="h-5 w-5 mr-2" />
                    Ferramentas Especializadas
                    <Badge variant="secondary" className="ml-2 bg-green-300 text-green-800 font-bold text-xs">
                      <FolderTree className="h-3 w-3 mr-1" />
                      ORGANIZADO
                    </Badge>
                  </Button>
                  <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {Array.isArray(editingCase.image_url) ? editingCase.image_url.length : 0} imagem(ns)
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Banner do Sistema Especializado */}
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Sistema Especializado Integrado:</span>
                <span>Organização avançada de imagens por especialidade e modalidade</span>
              </div>
            </div>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px] bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Carregando dados do caso especializado...</div>
              </div>
            </div>
          ) : editingCase ? (
            <div className="space-y-6 bg-white">
              {/* Sistema Unificado de Imagens - SEMPRE VISÍVEL */}
              <Card className={`border-2 ${currentCategoryId && currentModality 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Sistema Especializado de Imagens
                    <div className="flex items-center gap-2 ml-auto">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Integração Completa</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UnifiedImageSystemTabs
                    caseId={caseId || undefined}
                    categoryId={currentCategoryId}
                    modality={currentModality}
                    onImagesChange={handleImagesChange}
                  />
                </CardContent>
              </Card>

              {/* Formulário Principal */}
              <CaseProfileForm 
                editingCase={editingCase}
                onCreated={handleCaseUpdated}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal de Ferramentas Especializadas */}
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
