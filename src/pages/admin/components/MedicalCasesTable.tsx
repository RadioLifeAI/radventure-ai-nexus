
import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useDisclosure } from "@mantine/hooks";
import { CaseEditFormModal } from "../components/CaseEditFormModal";
import { CaseReferenceDisplay } from "./CaseReferenceDisplay";

type Props = {
  cases: any[];
  onDelete: (id: string) => void;
};

export function MedicalCasesTable({ cases, onDelete }: Props) {
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);

  const handleEditClick = (id: string) => {
    setSelectedCaseId(id);
    openEditModal();
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await onDelete(id);
      toast({
        title: "Caso excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir caso.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Título",
    },
    {
      accessorKey: "specialty",
      header: "Especialidade",
    },
    {
      accessorKey: "modality",
      header: "Modalidade",
    },
    {
      accessorKey: "difficulty_level",
      header: "Dificuldade",
    },
    {
      accessorKey: "points",
      header: "Pontos",
    },
    {
      accessorKey: "is_radiopaedia_case",
      header: "Fonte",
      cell: ({ row }: any) => {
        const caseData = row.original;
        return (
          <CaseReferenceDisplay
            isRadiopaediaCase={caseData.is_radiopaedia_case}
            referenceCitation={caseData.reference_citation}
            referenceUrl={caseData.reference_url}
            accessDate={caseData.access_date}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleEditClick(row.original.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: cases,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCaseSaved = () => {
    // Refresh data or update table as needed
  };

  return (
    <>
      <CaseEditFormModal
        open={editModalOpen}
        onClose={closeEditModal}
        caseId={selectedCaseId}
        onSaved={handleCaseSaved}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum caso médico encontrado.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-row-id={row.original.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
