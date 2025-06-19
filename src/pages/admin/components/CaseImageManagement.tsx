
import React, { useState, useEffect } from "react";
import { AdvancedImageUpload } from "./AdvancedImageUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Database, Zap, Shield } from "lucide-react";

type CaseImage = {
  id?: string;
  url: string;
  legend: string;
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  metadata?: {
    originalName: string;
    size: number;
    dimensions: { width: number; height: number };
    format: string;
    processed: boolean;
  };
};

type Props = {
  value: CaseImage[];
  onChange: (images: CaseImage[]) => void;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
};

export function CaseImageManagement({ value, onChange, renderTooltipTip }: Props) {
  const [images, setImages] = useState<CaseImage[]>(value || []);
  const [storageStats, setStorageStats] = useState({
    totalImages: 0,
    totalSize: 0,
    processedImages: 0
  });

  useEffect(() => {
    setImages(value || []);
    
    // Calcular estatísticas
    const stats = images.reduce((acc, img) => ({
      totalImages: acc.totalImages + 1,
      totalSize: acc.totalSize + (img.metadata?.size || 0),
      processedImages: acc.processedImages + (img.metadata?.processed ? 1 : 0)
    }), { totalImages: 0, totalSize: 0, processedImages: 0 });
    
    setStorageStats(stats);
  }, [value, images]);

  const handleImagesChange = (newImages: CaseImage[]) => {
    setImages(newImages);
    onChange(newImages);
  };

  const convertLegacyFormat = () => {
    // Converter formato antigo para novo formato se necessário
    if (Array.isArray(value) && value.length > 0) {
      const convertedImages = value.map((img, idx) => {
        if (typeof img === 'string') {
          return {
            id: `legacy_${idx}`,
            url: img,
            legend: "",
            metadata: {
              originalName: `legacy_image_${idx}`,
              size: 0,
              dimensions: { width: 0, height: 0 },
              format: "unknown",
              processed: false
            }
          };
        }
        return img;
      });
      
      handleImagesChange(convertedImages);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gerenciamento Inteligente de Imagens
            {renderTooltipTip("tip-advanced-images", "Sistema avançado com auto-redimensionamento, múltiplos formatos e otimização automática para casos médicos.")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Total de Imagens</div>
                <div className="text-2xl font-bold text-blue-600">{storageStats.totalImages}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Processadas</div>
                <div className="text-2xl font-bold text-green-600">{storageStats.processedImages}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Tamanho Total</div>
                <div className="text-2xl font-bold text-purple-600">{formatFileSize(storageStats.totalSize)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-orange-500" />
              <div>
                <div className="text-sm font-medium">Eficiência</div>
                <div className="text-2xl font-bold text-orange-600">
                  {storageStats.totalImages > 0 ? Math.round((storageStats.processedImages / storageStats.totalImages) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="upload">Upload & Gestão</TabsTrigger>
          <TabsTrigger value="formats">Formatos & Qualidade</TabsTrigger>
          <TabsTrigger value="migration">Migração & Legacy</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <AdvancedImageUpload 
            value={images}
            onChange={handleImagesChange}
            maxImages={8}
            allowedFormats={['image/jpeg', 'image/png', 'image/webp']}
            maxFileSize={15}
          />
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Formato e Qualidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Formatos Suportados</h4>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2">JPEG (diagnóstico)</Badge>
                    <Badge variant="outline" className="mr-2">PNG (alta qualidade)</Badge>
                    <Badge variant="outline" className="mr-2">WebP (otimizado)</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Tamanhos Gerados</h4>
                  <div className="space-y-2 text-sm">
                    <div>📱 <strong>Thumbnail:</strong> 300×300px (listagens)</div>
                    <div>💻 <strong>Médio:</strong> 800×600px (visualização)</div>
                    <div>🖥️ <strong>Grande:</strong> 1200×900px (análise)</div>
                    <div>🔍 <strong>Original:</strong> Resolução completa</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Recomendações</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• Use JPEG para radiografias e imagens médicas padrão</div>
                  <div>• Use PNG para imagens com texto ou gráficos detalhados</div>
                  <div>• WebP oferece a melhor compressão mantendo qualidade</div>
                  <div>• Resolução mínima recomendada: 800×600px</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migração e Compatibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">🔄 Migração do Sistema Legacy</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Converte imagens do formato antigo para o novo sistema com múltiplos tamanhos.
                </p>
                <Button onClick={convertLegacyFormat} variant="outline">
                  Converter Formato Legacy
                </Button>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✅ Sistema Atual</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>• Auto-redimensionamento em 4 tamanhos</div>
                  <div>• Compressão otimizada sem perda diagnóstica</div>
                  <div>• Metadata rica para busca e organização</div>
                  <div>• CDN integrado para entrega rápida</div>
                  <div>• Backup automático no Supabase Storage</div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Considerações de Privacidade</h4>
                <div className="text-sm text-red-800 space-y-1">
                  <div>• Remova dados pessoais (nomes, CPF) antes do upload</div>
                  <div>• Verifique se imagens estão anonimizadas</div>
                  <div>• Use apenas imagens com autorização para uso educacional</div>
                  <div>• Siga protocolos LGPD/HIPAA se aplicável</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
