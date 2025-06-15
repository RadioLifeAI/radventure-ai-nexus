
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Trophy } from "lucide-react";

export default function Rankings() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGeneralRanking() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url,total_points")
        .order("total_points", { ascending: false })
        .limit(50);
      setRankings(data || []);
      setLoading(false);
    }
    fetchGeneralRanking();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <h1 className="font-extrabold text-3xl mb-6 flex items-center gap-2"><Trophy className="text-yellow-400" /> Ranking Geral</h1>
        {loading ? (
          <div className="text-cyan-400">Carregando ranking...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow bg-white/90 p-3 max-w-2xl mx-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Posição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-cyan-500">Nenhum jogador encontrado.</TableCell>
                  </TableRow>
                )}
                {rankings.map((user, i) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatar_url && <img src={user.avatar_url} className="w-7 h-7 rounded-full border border-cyan-400" />}
                        <span>{user.full_name || user.username || "Jogador"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.total_points}</TableCell>
                    <TableCell className="font-bold text-cyan-700">{`#${i + 1}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
