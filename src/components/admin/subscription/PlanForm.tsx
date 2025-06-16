
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { SubscriptionPlan } from "@/types/admin";

interface PlanFormProps {
  plan?: SubscriptionPlan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlanForm({ plan, onSubmit, onCancel, isLoading }: PlanFormProps) {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      
      const planData = {
        ...plan,
        name: formData.get('name') as string,
        display_name: formData.get('display_name') as string,
        description: formData.get('description') as string,
        price_monthly: parseFloat(formData.get('price_monthly') as string),
        price_yearly: parseFloat(formData.get('price_yearly') as string),
        sort_order: parseInt(formData.get('sort_order') as string),
        is_active: formData.get('is_active') === 'on',
        features: {},
        limits: {}
      };
      
      onSubmit(planData);
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              name="name"
              defaultValue={plan?.name || ''}
              required
            />
          </div>
          <div>
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={plan?.display_name || ''}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={plan?.description || ''}
            rows={3}
            placeholder="Descrição do plano..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
            <Input
              id="price_monthly"
              name="price_monthly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={plan?.price_monthly || 0}
            />
          </div>
          <div>
            <Label htmlFor="price_yearly">Preço Anual (R$)</Label>
            <Input
              id="price_yearly"
              name="price_yearly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={plan?.price_yearly || 0}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sort_order">Ordem de Exibição</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              defaultValue={plan?.sort_order || 0}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={plan?.is_active ?? true}
            />
            <Label htmlFor="is_active">Plano Ativo</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
