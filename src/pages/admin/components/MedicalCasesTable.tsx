import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CasePreviewModal } from "./CasePreviewModal";
import { CaseEditAdminModal } from "./CaseEditAdminModal";

interface MedicalCasesTableProps {
  cases: any[];
  onDelete: (caseId: string) => void;
}

export function MedicalCasesTable({ cases, onDelete }: MedicalCasesTableProps) {
  const [deleteCaseId, setDeleteCaseId] = useState<string | null>(null);
  const [previewCaseId, setPreviewCaseId] = useState<string | null>(null);
  const [editCaseId, setEditCaseId] = useState<string | null>(null);

  const handlePreview = (caseId: string) => {
    setPreviewCaseId(caseId);
  };

  const handleDelete = (caseId: string) => {
    setDeleteCaseId(caseId);
  };

  const confirmDelete = () => {
    if (deleteCaseId) {
      onDelete(deleteCaseId);
      setDeleteCaseId(null);
    }
  };

  const handleEdit = (caseId: string) => {
    setEditCaseId(caseId);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Modalidade</TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_) => (
            <TableRow key={case_.id}>
              <TableCell className="font-medium">{case_.id}</TableCell>
              <TableCell>{case_.title}</TableCell>
              <TableCell>{case_.specialty}</TableCell>
              <TableCell>{case_.modality}</TableCell>
              <TableCell>Nível {case_.difficulty_level}</TableCell>
              <TableCell>
                {format(new Date(case_.created_at), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(case_.id)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(case_.id)}
                    className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Tem certeza que deseja excluir
                          este caso?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(case_.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal único de Preview */}
      <CasePreviewModal
        open={!!previewCaseId}
        onClose={() => setPreviewCaseId(null)}
        caseId={previewCaseId}
      />

      <CaseEditAdminModal
        open={!!editCaseId}
        onClose={() => setEditCaseId(null)}
        caseId={editCaseId}
        onSaved={() => {}}
      />
    </div>
  );
}
