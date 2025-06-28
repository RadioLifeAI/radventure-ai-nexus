
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  TestTube, 
  Upload,
  Zap
} from 'lucide-react';
import { AdvancedUploadTab } from '../../../components/admin/AdvancedUploadTab';

interface CaseFormWithAdvancedUploadProps {
  children: React.ReactNode; // O formulário existente
  caseId?: string;
  onImagesChange?: (images: any[]) => void;
}

export function CaseFormWithAdvancedUpload({ 
  children, 
  caseId, 
  onImagesChange 
}: CaseFormWithAdvancedUploadProps) {
  const [activeTab, setActiveTab] = useState('formulario');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Criação de Caso Médico
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Sistema Avançado
            </Badge>
          </CardTitle>
          <p className="text-sm text-blue-700">
            Sistema completo com ferramentas profissionais de upload e edição de imagens
          </p>
        </CardHeader>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formulario" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formulário Principal
          </TabsTrigger>
          <TabsTrigger value="avancado" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Upload Avançado
            <Badge variant="secondary" className="ml-1 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulario" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {children}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avancado" className="space-y-6">
          <AdvancedUploadTab 
            caseId={caseId}
            onImagesChange={onImagesChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
