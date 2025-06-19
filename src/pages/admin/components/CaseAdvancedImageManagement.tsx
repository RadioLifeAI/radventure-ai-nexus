
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { 
  Images, 
  Zap, 
  Database, 
  TrendingUp, 
  Settings,
  FileImage,
  CloudUpload,
  Cpu
} from 'lucide-react';

interface CaseAdvancedImageManagementProps {
  caseId?: string;
  onImagesChange?: (images: any[]) => void;
}

export function CaseAdvancedImageManagement({ 
  caseId, 
  onImagesChange 
}: CaseAdvancedImageManagementProps) {
  
  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Images className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900">
                  Gestão Avançada de Imagens
                </CardTitle>
                <p className="text-sm text-purple-700 mt-1">
                  Sistema robusto com processamento automático, múltiplos formatos e CDN otimizado
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Zap className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CloudUpload className="h-4 w-4 text-blue-600" />
              <span>Upload Inteligente</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4 text-green-600" />
              <span>Processamento Automático</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileImage className="h-4 w-4 text-orange-600" />
              <span>Múltiplos Formatos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>CDN Otimizado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <CloudUpload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Upload Inteligente</h3>
              <p className="text-sm text-green-700">
                Drag & drop, validação automática, progress em tempo real
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Processamento AI</h3>
              <p className="text-sm text-blue-700">
                4 tamanhos automáticos, conversão WebP, compressão otimizada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-900 mb-2">Metadata Rica</h3>
              <p className="text-sm text-orange-700">
                Dimensões, formatos, qualidade, analytics detalhados
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

      {/* Informações Técnicas */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Especificações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Formatos Suportados</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• JPEG/JPG (alta compatibilidade)</li>
                <li>• PNG (transparência preservada)</li>
                <li>• WebP (compressão otimizada)</li>
                <li>• AVIF (futuro-compatível)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tamanhos Automáticos</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Thumbnail:</strong> 300x300px (listagens)</li>
                <li>• <strong>Medium:</strong> 800x600px (visualização)</li>
                <li>• <strong>Large:</strong> 1200x900px (análise)</li>
                <li>• <strong>Original:</strong> tamanho preservado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• CDN global do Supabase</li>
                <li>• Cache inteligente de 30 dias</li>
                <li>• Lazy loading automático</li>
                <li>• Compressão sem perda de qualidade</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Limites e Segurança</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Máximo 10MB por arquivo</li>
                <li>• Validação de tipo MIME</li>
                <li>• Scan automático de malware</li>
                <li>• Backup automático em 3 regiões</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
