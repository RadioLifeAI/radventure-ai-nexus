
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Timeline,
  Map,
  Grid3x3,
  Calendar,
  ArrowRight,
  Clock,
  Brain,
  Star,
  Filter,
  Search,
  Play
} from "lucide-react";

interface Props {
  mode: string;
}

export function AdvancedVisualizationModes({ mode }: Props) {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const timelineData = [
    {
      date: "2024-01-15",
      cases: [
        { id: "1", title: "TC Crânio - AVC", specialty: "Neurorradiologia", status: "completed", accuracy: 95 },
        { id: "2", title: "RX Tórax - Pneumonia", specialty: "Radiologia Torácica", status: "completed", accuracy: 88 }
      ]
    },
    {
      date: "2024-01-16",
      cases: [
        { id: "3", title: "RM Coluna - Hérnia", specialty: "Musculoesquelética", status: "completed", accuracy: 92 },
        { id: "4", title: "TC Abdome - Apendicite", specialty: "Radiologia Abdominal", status: "in-progress", accuracy: null }
      ]
    }
  ];

  const knowledgeMapNodes = [
    { id: "neuro", label: "Neurorradiologia", x: 50, y: 30, completed: 85, connections: ["torax", "abdome"] },
    { id: "torax", label: "R. Torácica", x: 20, y: 60, completed: 72, connections: ["neuro", "cardio"] },
    { id: "abdome", label: "R. Abdominal", x: 80, y: 60, completed: 91, connections: ["neuro", "uro"] },
    { id: "cardio", label: "Cardiologia", x: 20, y: 90, completed: 45, connections: ["torax"] },
    { id: "uro", label: "Urologia", x: 80, y: 90, completed: 68, connections: ["abdome"] }
  ];

  const kanbanColumns = [
    {
      title: "Para Estudar",
      color: "bg-red-500/20 border-red-500/30",
      cases: [
        { id: "1", title: "RM Cardiac - Miocardite", specialty: "Cardiologia", difficulty: 4 },
        { id: "2", title: "TC Pelve - Endometriose", specialty: "Ginecologia", difficulty: 3 }
      ]
    },
    {
      title: "Em Progresso",
      color: "bg-yellow-500/20 border-yellow-500/30",
      cases: [
        { id: "3", title: "US Abdome - Cálculos", specialty: "Urologia", difficulty: 2 },
        { id: "4", title: "RX Pediatria - Displasia", specialty: "Pediatria", difficulty: 3 }
      ]
    },
    {
      title: "Dominado",
      color: "bg-green-500/20 border-green-500/30",
      cases: [
        { id: "5", title: "TC Crânio - Tumor", specialty: "Neurorradiologia", difficulty: 5 },
        { id: "6", title: "RM Spine - Metástase", specialty: "Oncologia", difficulty: 4 }
      ]
    }
  ];

  const renderTimelineView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Timeline className="h-5 w-5 text-blue-400" />
          Timeline de Aprendizado
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {timelineData.map((day, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              {new Date(day.date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {day.cases.map((case_, caseIndex) => (
              <div key={caseIndex} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${case_.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <div>
                    <h4 className="text-white font-medium">{case_.title}</h4>
                    <p className="text-cyan-200 text-sm">{case_.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {case_.accuracy && (
                    <Badge variant="outline" className="border-green-300 text-green-300">
                      {case_.accuracy}%
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" className="text-white">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderKnowledgeMap = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Map className="h-5 w-5 text-purple-400" />
          Mapa de Conhecimento Interativo
        </h3>
      </div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="relative h-96 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              {/* Renderizar conexões */}
              {knowledgeMapNodes.map(node => 
                node.connections.map(connectionId => {
                  const connectedNode = knowledgeMapNodes.find(n => n.id === connectionId);
                  if (!connectedNode) return null;
                  return (
                    <line
                      key={`${node.id}-${connectionId}`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${connectedNode.x}%`}
                      y2={`${connectedNode.y}%`}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })
              )}
              
              {/* Renderizar nós */}
              {knowledgeMapNodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="25"
                    fill={`hsl(${node.completed * 1.2}, 70%, 50%)`}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedCase(node.id)}
                  />
                  <text
                    x={`${node.x}%`}
                    y={`${node.y + 8}%`}
                    textAnchor="middle"
                    className="fill-white text-xs font-medium pointer-events-none"
                  >
                    {node.completed}%
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Labels dos nós */}
            {knowledgeMapNodes.map(node => (
              <div
                key={`label-${node.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${node.x}%`, top: `${node.y + 12}%` }}
              >
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCase && (
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-300/30">
          <CardContent className="p-4">
            <p className="text-white">
              Área selecionada: <strong>{knowledgeMapNodes.find(n => n.id === selectedCase)?.label}</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderKanbanBoard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-green-400" />
          Kanban Study Board
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kanbanColumns.map((column, index) => (
          <Card key={index} className={`${column.color} backdrop-blur-sm`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">{column.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.cases.map((case_, caseIndex) => (
                <div key={caseIndex} className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  <h4 className="text-white font-medium text-sm">{case_.title}</h4>
                  <p className="text-gray-200 text-xs mt-1">{case_.specialty}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: case_.difficulty }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Button size="sm" variant="ghost" className="text-white p-1">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  switch (mode) {
    case "timeline":
      return renderTimelineView();
    case "knowledge-map":
      return renderKnowledgeMap();
    case "kanban":
      return renderKanbanBoard();
    default:
      return renderTimelineView();
  }
}
