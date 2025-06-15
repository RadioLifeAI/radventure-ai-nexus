
import React, { useState } from "react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseViewerAdminModal } from "./CaseViewerAdminModal";

type MedicalCasesTableProps = {
  cases: any[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function MedicalCasesTable({ cases, onDelete, onEdit }: MedicalCasesTableProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      {/* Modal de visualização */}
      <CaseViewerAdminModal open={!!previewId} onClose={() => setPreviewId(null)} caseId={previewId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Modalidade</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.id}</TableCell>
              <TableCell>
                {item.image_url ? (
                  <img src={item.image_url} alt="img" className="w-14 h-14 object-cover rounded" />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.specialty || "-"}</TableCell>
              <TableCell>{item.modality || "-"}</TableCell>
              <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : ""}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewId(item.id)}
                    title="Visualizar como usuário"
                  >
                    <Eye />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit && onEdit(item.id)}
                    title="Editar"
                  >
                    <Edit />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete && onDelete(item.id)}
                    title="Excluir"
                  >
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!cases.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhum caso cadastrado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
