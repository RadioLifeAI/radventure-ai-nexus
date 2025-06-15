
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge, Award, Users, Clock, TrendingUp, Star, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type EventDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  event: any;
  ranking?: any[];
};

export default function EventDetailsModal({ open, onClose, event, ranking = [] }: EventDetailsModalProps) {
  if (!event) return null;
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-6">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              {event.banner_url && <img src={event.banner_url} alt="" className="h-14 w-36 rounded-md object-cover shadow border" />}
              <span>{event.name}</span>
              <span className="ml-2 capitalize px-2 py-1 text-xs rounded bg-muted">
                {/* COR DESTAQUE PELO STATUS */}
                {event.status === "ACTIVE" && <Award className="inline-block mr-1 text-green-600" size={16} />}
                {event.status === "SCHEDULED" && <Clock className="inline-block mr-1 text-yellow-500" size={16} />}
                {event.status === "FINISHED" && <CheckCircle2 className="inline-block mr-1 text-gray-700" size={16} />}
                {event.status?.toLowerCase()}
              </span>
              {event.event_type && <span className="ml-2 text-xs px-2 py-1 rounded bg-cyan-100 text-cyan-700">{event.event_type}</span>}
            </div>
          </DialogTitle>
          <DialogDescription className="mt-2">{event.description || "Sem descrição"}</DialogDescription>
        </DialogHeader>
        <div className="my-4 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 flex gap-2 items-center text-sm text-muted-foreground">
              <Users size={18} /> Participantes Máx.: <b className="ml-1">{event.max_participants || "Ilimitado"}</b>
            </div>
            <div className="mb-2 flex gap-2 items-center text-sm text-muted-foreground">
              <Star size={18} /> Premiação RadCoins: <b className="ml-1">{event.prize_radcoins}</b>
            </div>
            <div className="mb-2 flex gap-2 items-center text-sm text-muted-foreground">
              <TrendingUp size={18} /> Número de Casos: <b className="ml-1">{event.number_of_cases || "?"}</b>
            </div>
            <div className="mb-2 flex gap-2 items-center text-sm text-muted-foreground">
              <Clock size={18} /> Início: <b className="ml-1">{event.scheduled_start ? new Date(event.scheduled_start).toLocaleString("pt-BR") : "--"}</b>
            </div>
            <div className="mb-2 flex gap-2 items-center text-sm text-muted-foreground">
              <Clock size={18} /> Fim: <b className="ml-1">{event.scheduled_end ? new Date(event.scheduled_end).toLocaleString("pt-BR") : "--"}</b>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">Progresso do Evento</div>
            <Progress value={event.status === "FINISHED" ? 100 : event.status === "ACTIVE" ? 60 : 10} className={event.status === "FINISHED" ? "bg-green-500" : "bg-yellow-400"} />
            <div className="mt-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground flex gap-1 items-center">
                <Users size={14}/> Ranking (Top 3) 
              </div>
              <ol className="space-y-1">
                {(ranking && ranking.length > 0) ? (
                  ranking.slice(0, 3).map((r, i) => (
                    <li key={r.user_id} className="flex items-center gap-2">
                      <span className={`text-lg`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </span>
                      <b>{r.username || r.user_id?.substring(0,6) || "-"}</b>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{r.points || r.score || 0} pts</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">Ainda sem ranking.</li>
                )}
              </ol>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
