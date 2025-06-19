
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
  Cpu,
  Sparkles
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
    <div className="space-y-8">
      {/* Header da Seção - Visual aprimorado */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl shadow-lg">
                <Images className="h-7 w-7 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900 font-bold">
                  Gestão Avançada de Imagens
                </CardTitle>
                <p className="text-sm text-purple-700 mt-2 font-medium">
                  Sistema robusto com processamento automático, múltiplos formatos e CDN otimizado
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-300">
              <CloudUpload className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Upload Inteligente</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-green-50 p-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-300">
              <Cpu className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Processamento Automático</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-orange-50 p-3 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-300">
              <FileImage className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Múltiplos Formatos</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-purple-50 p-3 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors duration-300">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">CDN Otimizado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Principais - Cards aprimorados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="pt-8 pb-6">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-fit mx-auto mb-4 shadow-md">
                <CloudUpload className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900 mb-3 text-lg">Upload Inteligente</h3>
              <p className="text-sm text-green-700 font-medium">
                Drag & drop, validação automática, progress em tempo real
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="pt-8 pb-6">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-fit mx-auto mb-4 shadow-md">
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Processamento AI</h3>
              <p className="text-sm text-blue-700 font-medium">
                4 tamanhos automáticos, conversão WebP, compressão otimizada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="pt-8 pb-6">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-fit mx-auto mb-4 shadow-md">
                <Database className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-orange-900 mb-3 text-lg">Metadata Rica</h3>
              <p className="text-sm text-orange-700 font-medium">
                Dimensões, formatos, qualidade, analytics detalhados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="border-2 border-gradient-to-r from-purple-200 to-pink-200" />

      {/* Sistema de Upload Avançado */}
      <EnhancedImageUpload 
        caseId={caseId}
        onChange={onImagesChange}
      />

      {/* Informações Técnicas - Visual aprimorado */}
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-t-lg border-b border-gray-200">
          <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Settings className="h-5 w-5 text-gray-700" />
            </div>
            Especificações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-base border-b border-gray-200 pb-2">Formatos Suportados</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <strong>JPEG/JPG</strong> (alta compatibilidade)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>PNG</strong> (transparência preservada)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <strong>WebP</strong> (compressão otimizada)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <strong>AVIF</strong> (futuro-compatível)
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-base border-b border-gray-200 pb-2">Tamanhos Automáticos</h4>
              <ul className="space-y-2 text-gray-700">
                <li><strong className="text-cyan-600">Thumbnail:</strong> 300x300px (listagens)</li>
                <li><strong className="text-blue-600">Medium:</strong> 800x600px (visualização)</li>
                <li><strong className="text-purple-600">Large:</strong> 1200x900px (análise)</li>
                <li><strong className="text-gray-600">Original:</strong> tamanho preservado</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-base border-b border-gray-200 pb-2">Performance</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• CDN global do Supabase</li>
                <li>• Cache inteligente de 30 dias</li>
                <li>• Lazy loading automático</li>
                <li>• Compressão sem perda de qualidade</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-base border-b border-gray-200 pb-2">Limites e Segurança</h4>
              <ul className="space-y-2 text-gray-700">
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
