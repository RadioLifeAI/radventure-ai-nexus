
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { SubscriptionPlan } from "@/types/admin";

interface PlansTableProps {
  plans: SubscriptionPlan[] | undefined;
  isLoading: boolean;
  onEditPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export function PlansTable({ plans, isLoading, onEditPlan, onDeletePlan }: PlansTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Mensal</TableHead>
          <TableHead>Anual</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Carregando planos...
            </TableCell>
          </TableRow>
        ) : plans?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Nenhum plano encontrado
            </TableCell>
          </TableRow>
        ) : (
          plans?.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.display_name}</TableCell>
              <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
              <TableCell>R$ {plan.price_monthly.toFixed(2)}</TableCell>
              <TableCell>R$ {plan.price_yearly.toFixed(2)}</TableCell>
              <TableCell>{plan.sort_order}</TableCell>
              <TableCell>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
