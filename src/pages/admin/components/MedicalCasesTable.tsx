
import React from "react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";

type MedicalCasesTableProps = {
  cases: any[];
};

export function MedicalCasesTable({ cases }: MedicalCasesTableProps) {
  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Criado em</TableHead>
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
              <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : ""}</TableCell>
            </TableRow>
          ))}
          {!cases.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum caso cadastrado ainda.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
