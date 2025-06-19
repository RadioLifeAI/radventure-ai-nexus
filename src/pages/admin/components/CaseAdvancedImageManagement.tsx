
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { ImageAdvancedModals } from './ImageAdvancedModals';
import { 
  Images, 
  Zap, 
  Database, 
  TrendingUp, 
  Settings,
  FileImage,
  CloudUpload,
  Cpu,
  Layers,
  Shield,
  Globe
} from 'lucide-react';

interface CaseAdvancedImageManagementProps {
  caseId?: string;
  onImagesChange?: (images: any[]) => void;
}

// Mock data para demonstração dos modais
const mockImages = [
  {
    id: '1',
    url: '/placeholder.svg',
    legend: 'Radiografia de tórax PA',
    filename: 'torax_pa_001.jpg',
    size: 2048000,
    dimensions: { width: 1200, height: 1600 },
    format: 'jpeg',
    uploadedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    url: '/placeholder.svg',
    legend: 'TC de tórax - corte axial',
    filename: 'tc_torax_axial.jpg',
    size: 3584000,
    dimensions: { width: 1024, height: 1024 },
    format: 'jpeg',
    uploadedAt: '2024-01-15T11:15:00Z'
  }
];

export function CaseAdvancedImageManagement({ 
  caseId, 
  onImagesChange 
}: CaseAdvancedImageManagementProps) {
  
  const handleImageUpdate = (image: any) => {
    console.log('Atualizando imagem:', image);
  };

  const handleImageDelete = (id: string) => {
    console.log('Deletando imagem:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl shadow-sm">
                <Images className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-emerald-900 font-bold">
                  Gestão Avançada de Imagens
                </CardTitle>
                <p className="text-sm text-emerald-700 mt-1 font-medium">
                  Sistema robusto com processamento automático, múltiplos formatos e CDN otimizado
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 shadow-sm">
              <Zap className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <CloudUpload className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">Upload Inteligente</div>
                <div className="text-xs text-gray-600">Drag & Drop + Validação</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Cpu className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-sm">Processamento AI</div>
                <div className="text-xs text-gray-600">4 Formatos Automáticos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <FileImage className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold text-sm">Múltiplos Formatos</div>
                <div className="text-xs text-gray-600">WebP, AVIF, JPEG</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold text-sm">CDN Otimizado</div>
                <div className="text-xs text-gray-600">Cache Global</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4 shadow-sm">
                <CloudUpload className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900 mb-2 text-lg">Upload Inteligente</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Drag & drop, validação automática, progress em tempo real e preview instantâneo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4 shadow-sm">
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900 mb-2 text-lg">Processamento AI</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                4 tamanhos automáticos, conversão WebP, compressão otimizada e metadata rica
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-4 shadow-sm">
                <Database className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 text-lg">Metadata Rica</h3>
              <p className="text-sm text-orange-700 leading-relaxed">
                Dimensões, formatos, qualidade, analytics detalhados e histórico completo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Sistema de Upload Avançado */}
      <EnhancedImageUpload 
        caseId={caseId}
        onChange={onImagesChange}
      />

      {/* Galeria de Imagens com Modais Avançados */}
      {mockImages.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Layers className="h-5 w-5" />
              Imagens do Caso (Demonstração)
              <Badge className="bg-purple-500 text-white">{mockImages.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockImages.map((image) => (
                <Card key={image.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={image.url} 
                          alt={image.legend}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{image.legend}</h4>
                        <p className="text-xs text-gray-500 mb-2">{image.filename}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {image.dimensions.width}×{image.dimensions.height}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(image.size / 1024 / 1024).toFixed(1)}MB
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {image.format.toUpperCase()}
                          </Badge>
                        </div>
                        <ImageAdvancedModals
                          image={image}
                          onUpdate={handleImageUpdate}
                          onDelete={handleImageDelete}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Técnicas */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
            <Settings className="h-4 w-4" />
            Especificações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileImage className="h-4 w-4 text-blue-600" />
                Formatos Suportados
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  JPEG/JPG (alta compatibilidade)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  PNG (transparência preservada)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  WebP (compressão otimizada)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  AVIF (futuro-compatível)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-green-600" />
                Tamanhos Automáticos
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Thumbnail:</strong> 300×300px (listagens)</li>
                <li><strong>Medium:</strong> 800×600px (visualização)</li>
                <li><strong>Large:</strong> 1200×900px (análise)</li>
                <li><strong>Original:</strong> tamanho preservado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                Performance
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>CDN global do Supabase</li>
                <li>Cache inteligente de 30 dias</li>
                <li>Lazy loading automático</li>
                <li>Compressão sem perda</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Limites e Segurança
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>Máximo 10MB por arquivo</li>
                <li>Validação de tipo MIME</li>
                <li>Scan automático de malware</li>
                <li>Backup em 3 regiões</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
