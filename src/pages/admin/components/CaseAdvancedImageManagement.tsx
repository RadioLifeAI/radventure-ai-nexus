
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
  Sparkles,
  CheckCircle,
  AlertTriangle
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
  
  // Status da integração
  const isIntegrated = !!(categoryId && modality);
  const organizationPath = isIntegrated 
    ? `/medical-cases/cat${categoryId}/${modality.toLowerCase()}/`
    : 'Aguardando seleção no formulário';

  return (
    <div className="space-y-6">
      {/* Header da Seção Especializada Integrada */}
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200' 
        : 'bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 border-orange-200'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-lg ${isIntegrated 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
              }`}>
                <FolderTree className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className={`text-xl flex items-center gap-2 ${isIntegrated 
                  ? 'text-green-900' 
                  : 'text-orange-900'
                }`}>
                  Sistema Especializado {isIntegrated ? 'Integrado' : 'Aguardando'}
                  <Badge variant="secondary" className={isIntegrated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                  }>
                    {isIntegrated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {isIntegrated ? 'INTEGRADO' : 'CONFIGURAR'}
                  </Badge>
                </CardTitle>
                <p className={`text-sm mt-1 ${isIntegrated 
                  ? 'text-green-700' 
                  : 'text-orange-700'
                }`}>
                  {isIntegrated 
                    ? 'Upload conectado com formulário - organização automática ativa'
                    : 'Selecione categoria e modalidade no formulário para ativar'
                  }
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
              <span>Upload Integrado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FolderTree className="h-4 w-4 text-green-600" />
              <span>Organização Formulário</span>
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
          
          {/* Status da Integração */}
          <div className={`mt-4 p-3 rounded-lg border ${isIntegrated 
            ? 'bg-green-100 border-green-300' 
            : 'bg-orange-100 border-orange-300'
          }`}>
            <div className="flex items-start gap-2">
              {isIntegrated ? <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />}
              <div>
                <p className={`font-medium text-sm ${isIntegrated 
                  ? 'text-green-800' 
                  : 'text-orange-800'
                }`}>
                  {isIntegrated ? 'Sistema Totalmente Integrado' : 'Integração Pendente'}
                </p>
                <p className={`text-xs ${isIntegrated 
                  ? 'text-green-700' 
                  : 'text-orange-700'
                }`}>
                  <strong>Estrutura:</strong> {organizationPath}
                </p>
                {!isIntegrated && (
                  <p className="text-xs text-orange-700 mt-1">
                    👉 Vá para "Informações Básicas" e selecione categoria + modalidade
                  </p>
                )}
              </div>
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
              <h3 className="font-semibold text-green-900 mb-2">Integração Formulário</h3>
              <p className="text-sm text-green-700">
                Upload baseado nas seleções do formulário em tempo real
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
                Dimensões, formatos, organização integrada com formulário
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Sistema de Upload Especializado Integrado */}
      <EnhancedImageUploadSpecialized 
        caseId={caseId}
        categoryId={categoryId}
        modality={modality}
        onChange={onImagesChange}
      />

      {/* Informações Técnicas da Integração */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Especificações Técnicas Integradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Integração com Formulário</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Sincronização automática com seleções</li>
                <li>• Organização baseada em categoria + modalidade</li>
                <li>• Estrutura: /medical-cases/[cat]/[mod]/</li>
                <li>• Metadata integrada em tempo real</li>
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
              <h4 className="font-semibold mb-2">Performance Integrada</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• CDN global com estrutura formulário</li>
                <li>• Cache inteligente por seleção</li>
                <li>• Lazy loading especializado</li>
                <li>• Compressão otimizada por modalidade</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validações e Segurança</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Anti-duplicação por caso</li>
                <li>• Validação especializada de tipo</li>
                <li>• Scan automático de malware</li>
                <li>• Backup em estrutura integrada</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
