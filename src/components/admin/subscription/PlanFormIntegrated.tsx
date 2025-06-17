
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface PlanFormIntegratedProps {
  onSubmit: (planData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PlanFormIntegrated({ onSubmit, onCancel, loading }: PlanFormIntegratedProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    priceMonthly: '',
    priceYearly: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      priceMonthly: parseFloat(formData.priceMonthly) || 0,
      priceYearly: parseFloat(formData.priceYearly) || 0
    });
    
    // Limpar formulário
    setFormData({
      name: '',
      displayName: '',
      description: '',
      priceMonthly: '',
      priceYearly: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Plus className="h-5 w-5" />
          Criar Novo Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Pro"
                required
              />
            </div>
            <div>
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Ex: Plano Pro"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do plano..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceMonthly">Preço Mensal (R$)</Label>
              <Input
                id="priceMonthly"
                type="number"
                step="0.01"
                value={formData.priceMonthly}
                onChange={(e) => handleChange('priceMonthly', e.target.value)}
                placeholder="29.90"
                required
              />
            </div>
            <div>
              <Label htmlFor="priceYearly">Preço Anual (R$)</Label>
              <Input
                id="priceYearly"
                type="number"
                step="0.01"
                value={formData.priceYearly}
                onChange={(e) => handleChange('priceYearly', e.target.value)}
                placeholder="299.00"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Plano
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
