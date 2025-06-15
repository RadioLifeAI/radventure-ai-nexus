import React from "react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import EventEditModal from "./EventEditModal";

// Permite administração básica dos eventos
export function EventManagementTable({ events, onDelete, onUpdate }: { events: any[], onDelete: (id: string) => void, onUpdate: (ev: any) => void }) {
  const [selected, setSelected] = useState<any>(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Demo/mock ranking
  const mockRanking = [
    { user_id: "a1", username: "Alice", points: 123 },
    { user_id: "b2", username: "Bruno", points: 95 },
    { user_id: "c3", username: "Carla", points: 83 },
  ];

  return (
    <div className="bg-white rounded shadow overflow-x-auto relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Banner</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Participantes Máx.</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event: any) => (
            <TableRow key={event.id}>
              <TableCell className="font-mono text-xs">{event.id}</TableCell>
              <TableCell>
                {event.banner_url ? (
                  <img src={event.banner_url} alt="banner" className="w-14 h-10 object-cover rounded" />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>{event.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs
                  ${event.status === "ACTIVE" ? "bg-green-100 text-green-800"
                      : event.status === "SCHEDULED" ? "bg-yellow-100 text-yellow-700"
                      : event.status === "FINISHED" ? "bg-gray-100 text-gray-600"
                      : "bg-muted text-muted-foreground"}
                `}>
                  {event.status}
                </span>
              </TableCell>
              <TableCell>{event.scheduled_start ? new Date(event.scheduled_start).toLocaleString("pt-BR") : "--"}</TableCell>
              <TableCell>{event.scheduled_end ? new Date(event.scheduled_end).toLocaleString("pt-BR") : "--"}</TableCell>
              <TableCell>{event.max_participants || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {/* Visualizar com modal gamificado */}
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Visualizar evento"
                    onClick={() => { setSelected(event); setShowView(true); }}
                  >
                    <Eye />
                  </Button>
                  {/* Editar evento com modal */}
                  <Button
                    size="sm"
                    variant="outline"
                    title="Editar evento"
                    onClick={() => { setSelected(event); setShowEdit(true); }}
                  >
                    <Edit />
                  </Button>
                  {/* Excluir */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(event.id)}
                    title="Excluir"
                  >
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Nenhum evento cadastrado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MODAIS COMPLEXOS */}
      {showView && selected && (
        <EventDetailsModal
          open={showView}
          onClose={() => setShowView(false)}
          event={selected}
          ranking={mockRanking}
        />
      )}
      {showEdit && selected && (
        <EventEditModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          event={selected}
          onSave={ev => { onUpdate(ev); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
