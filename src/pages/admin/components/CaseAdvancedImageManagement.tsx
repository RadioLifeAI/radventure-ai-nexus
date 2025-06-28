
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EnhancedImageUploadSpecialized } from './EnhancedImageUploadSpecialized';
import { 
  Images, 
  Zap, 
  Database, 
  TrendingUp, 
  Settings,
  FileImage,
  CloudUpload,
  Cpu,
  FolderTree,
  Sparkles
} from 'lucide-react';

interface CaseAdvancedImageManagementProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  onImagesChange?: (images: any[]) => void;
}

export function CaseAdvancedImageManagement({ 
  caseId, 
  categoryId,
  modality,
  onImagesChange 
}: CaseAdvancedImageManagementProps) {
  
  return (
    <div className="space-y-6">
      {/* Header da Seção Especializada */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-green-600 rounded-xl shadow-lg">
                <FolderTree className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                  Gestão Avançada Especializada
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Organização Automática
                  </Badge>
                </CardTitle>
                <p className="text-sm text-purple-700 mt-1">
                  Sistema unificado com organização automática por especialidade médica
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
              <span>Upload Especializado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FolderTree className="h-4 w-4 text-green-600" />
              <span>Organização Automática</span>
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
                <FolderTree className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Organização Especializada</h3>
              <p className="text-sm text-green-700">
                Classificação automática por especialidade e modalidade
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
                Dimensões, formatos, qualidade, organização especializada
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Sistema de Upload Especializado */}
      <EnhancedImageUploadSpecialized 
        caseId={caseId}
        categoryId={categoryId}
        modality={modality}
        onChange={onImagesChange}
      />

      {/* Informações Técnicas */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Especificações Técnicas Especializadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Organização Especializada</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Classificação por especialidade médica</li>
                <li>• Organização por modalidade de exame</li>
                <li>• Estrutura: /medical-cases/[categoria]/[modalidade]/</li>
                <li>• Metadata especializada automática</li>
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
              <h4 className="font-semibold mb-2">Performance Especializada</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• CDN global com estrutura organizada</li>
                <li>• Cache inteligente por especialidade</li>
                <li>• Lazy loading especializado</li>
                <li>• Compressão otimizada por modalidade</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Segurança e Organização</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Máximo 10MB por arquivo</li>
                <li>• Validação especializada de tipo</li>
                <li>• Scan automático de malware</li>
                <li>• Backup em estrutura organizada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
