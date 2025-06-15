
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui/table";
import { Trophy } from "lucide-react";

export default function RankingEventos() {
  const [eventRankings, setEventRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_rankings")
        .select("event_id,user_id,score,rank,profiles:profiles!event_rankings_user_id_fkey(username,full_name,avatar_url)")
        .order("event_id", { ascending: false })
        .order("rank", { ascending: true });
      setEventRankings(data || []);
      setLoading(false);
    }
    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <h1 className="font-extrabold text-3xl mb-6 flex items-center gap-2"><Trophy className="text-yellow-400" /> Ranking de Eventos</h1>
        {loading ? (
          <div className="text-cyan-400">Carregando rankings...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow bg-white/90 p-3 max-w-2xl mx-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead className="text-center">Pontuação</TableHead>
                  <TableHead className="text-center">Posição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventRankings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-cyan-500">Nenhum ranking disponível.</TableCell>
                  </TableRow>
                )}
                {eventRankings.map((r, i) => (
                  <TableRow key={r.event_id + r.user_id + i}>
                    <TableCell>{r.event_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {r.profiles?.avatar_url && <img src={r.profiles.avatar_url} className="w-7 h-7 rounded-full border border-cyan-400" />}
                        <span>{r.profiles?.full_name || r.profiles?.username || "Jogador"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{r.score}</TableCell>
                    <TableCell className="text-center font-bold text-cyan-700">{r.rank ? `#${r.rank}` : "-"}</TableCell>
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
