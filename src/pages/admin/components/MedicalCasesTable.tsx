
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, Sparkles } from "lucide-react";
import { CasePreviewModal } from "./CasePreviewModal";
import { CaseEditAdminModal } from "./CaseEditAdminModal";

interface MedicalCasesTableProps {
  cases: any[];
  onDelete: (id: string) => void;
}

export function MedicalCasesTable({ cases, onDelete }: MedicalCasesTableProps) {
  const [previewCase, setPreviewCase] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<any>(null);

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800"; 
      case 3: return "bg-orange-100 text-orange-800";
      case 4: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caso) => (
              <TableRow key={caso.id}>
                <TableCell className="font-medium">
                  {caso.title || "Sem título"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {caso.medical_specialties?.name || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(caso.difficulty_level)}>
                    Nível {caso.difficulty_level || 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {caso.modality || "N/A"}
                    {caso.subtype && ` - ${caso.subtype}`}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {caso.points || 100} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(caso.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewCase(caso.id)}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCase(caso)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(caso.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      <CasePreviewModal
        open={!!previewCase}
        onClose={() => setPreviewCase(null)}
        caseId={previewCase}
      />

      {/* Edit Modal */}
      <CaseEditAdminModal
        open={!!editingCase}
        onClose={() => setEditingCase(null)}
        case={editingCase}
      />
    </>
  );
}
