
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Upload, 
  Image as ImageIcon, 
  FolderTree,
  CheckCircle,
  AlertTriangle,
  X,
  Edit3
} from 'lucide-react';

interface IntegratedImageSystemTabsProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  tempImageManager: any;
  specializedImages: any[];
  isEditMode: boolean;
}

export function IntegratedImageSystemTabs({ 
  caseId, 
  categoryId, 
  modality, 
  tempImageManager,
  specializedImages,
  isEditMode
}: IntegratedImageSystemTabsProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [editingLegend, setEditingLegend] = useState<string | null>(null);
  const [legendText, setLegendText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIntegrated = !!(categoryId && modality);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !isIntegrated) return;
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      tempImageManager.addTempImage(file);
    }
    
    toast({
      title: "📁 Imagens Adicionadas!",
      description: `${e.target.files.length} imagem(ns) preparadas para organização automática.`
    });
  };

  const handleLegendEdit = (imageId: string, currentLegend?: string) => {
    setEditingLegend(imageId);
    setLegendText(currentLegend || '');
  };

  const handleLegendSave = (imageId: string) => {
    tempImageManager.updateTempImageLegend(imageId, legendText);
    setEditingLegend(null);
    setLegendText('');
  };

  const handleLegendCancel = () => {
    setEditingLegend(null);
    setLegendText('');
  };

  // Upload Tab Component
  const UploadTab = () => (
    <div className="space-y-6">
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Sistema Integrado de Upload
            <Badge variant="secondary" className={isIntegrated 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
            }>
              {isIntegrated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {isIntegrated ? 'INTEGRADO' : 'AGUARDANDO'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              !isIntegrated 
                ? 'border-orange-300 bg-orange-50 cursor-not-allowed opacity-60'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
            }`}
            onClick={isIntegrated ? () => fileInputRef.current?.click() : undefined}
          >
            <FolderTree className={`h-10 w-10 mx-auto mb-4 ${isIntegrated ? 'text-green-500' : 'text-orange-400'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isIntegrated 
                  ? 'Arraste imagens aqui ou clique para selecionar'
                  : 'Configure categoria e modalidade para habilitar upload'
                }
              </p>
              <p className="text-sm text-gray-500">
                Suporte para JPEG, PNG, WebP, DICOM • Máximo 10MB por arquivo
              </p>
              {isIntegrated && (
                <p className="text-xs text-green-600">
                  🗂️ Organização automática: Cat#{categoryId} + {modality}
                </p>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.dcm"
              className="hidden"
              onChange={handleFileUpload}
              disabled={!isIntegrated}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imagens Temporárias */}
      {tempImageManager.tempImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagens Preparadas ({tempImageManager.tempImages.length})
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Serão organizadas ao salvar
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tempImageManager.tempImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  
                  {/* Controles da imagem */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 bg-white/80"
                      onClick={() => handleLegendEdit(image.id, image.legend)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 bg-white/80 text-red-600 hover:text-red-700"
                      onClick={() => tempImageManager.removeTempImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Badge de ordem */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>

                  {/* Legenda ou editor de legenda */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b">
                    {editingLegend === image.id ? (
                      <div className="flex gap-1">
                        <Input
                          value={legendText}
                          onChange={(e) => setLegendText(e.target.value)}
                          placeholder="Legenda da imagem..."
                          className="h-6 text-xs"
                        />
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleLegendSave(image.id)}
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={handleLegendCancel}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs truncate">
                        {image.legend || 'Clique no ícone para adicionar legenda'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imagens Salvas (apenas no modo edição) */}
      {isEditMode && specializedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Imagens Salvas ({specializedImages.length})
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Organizadas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specializedImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.thumbnail_url || image.original_url}
                    alt={`Imagem salva ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  {image.specialty_code && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        {image.specialty_code}/{image.modality_prefix}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b">
                    <p className="text-xs truncate">
                      {image.legend || 'Sem legenda'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Sistema Integrado de Imagens
            <Badge variant="secondary" className={isIntegrated 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
            }>
              {isIntegrated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {isIntegrated ? 'INTEGRADO' : 'AGUARDANDO'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isIntegrated 
              ? `✅ Organização automática ativa: Cat#${categoryId} → ${modality} → Salvamento integrado`
              : '⚠️ Configure categoria e modalidade nas informações básicas para ativar o sistema'
            }
          </p>
        </CardHeader>
      </Card>

      {/* Simplified Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Integrado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <UploadTab />
        </TabsContent>
      </Tabs>

      {/* Status Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">📊 Resumo do Sistema</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>Imagens Preparadas:</strong> {tempImageManager.tempImages.length}
          </div>
          <div>
            <strong>Imagens Salvas:</strong> {specializedImages.length}
          </div>
          <div>
            <strong>Status:</strong> {isIntegrated ? 'Integrado' : 'Aguardando configuração'}
          </div>
          <div>
            <strong>Processamento:</strong> {tempImageManager.processing ? 'Ativo' : 'Inativo'}
          </div>
        </div>
        
        {isIntegrated && tempImageManager.tempImages.length > 0 && (
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
            <p className="text-green-800 text-sm">
              🎯 <strong>Pronto para salvar:</strong> {tempImageManager.tempImages.length} imagem(ns) serão organizadas automaticamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
