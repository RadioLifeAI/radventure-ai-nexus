
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface AIConfig {
  id: string;
  config_name: string;
  model_name: string;
  api_provider: string;
  is_active: boolean;
}

interface AIConfigTableProps {
  configs: AIConfig[];
  onEdit: (config: AIConfig) => void;
  onDelete: (configId: string) => void;
}

export function AIConfigTable({ configs, onEdit, onDelete }: AIConfigTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs.map((config) => (
          <TableRow key={config.id}>
            <TableCell className="font-medium">{config.config_name}</TableCell>
            <TableCell>{config.model_name}</TableCell>
            <TableCell>{config.api_provider}</TableCell>
            <TableCell>
              <Badge variant={config.is_active ? "default" : "secondary"}>
                {config.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(config)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(config.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
