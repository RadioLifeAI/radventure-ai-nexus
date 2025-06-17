
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ 
  title, 
  description = "Esta funcionalidade está em desenvolvimento e será implementada em breve." 
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">Página em desenvolvimento</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/analytics')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 text-lg">{description}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 Funcionalidades Planejadas:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Interface de gestão completa</li>
              <li>• Dashboards interativos</li>
              <li>• Relatórios detalhados</li>
              <li>• Sistema de permissões granulares</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/analytics')}
            >
              Dashboard Principal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/events')}
            >
              Gestão de Eventos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
