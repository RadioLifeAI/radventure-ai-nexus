
import React, { useEffect, useState } from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";

export default function CasosMedicos() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase.from("medical_cases").select("id, title, created_at, image_url").order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases(data || []);
        setLoading(false);
      });
  }, []);

  function refreshCases() {
    setLoading(true);
    supabase.from("medical_cases").select("id, title, created_at, image_url").order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases(data || []);
        setLoading(false);
      });
  }

  return (
    <div>
      <CaseProfileForm onCreated={refreshCases} />
      <h3 className="text-xl font-bold mb-3 mt-12">Casos Cadastrados</h3>
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
    </div>
  );
}
