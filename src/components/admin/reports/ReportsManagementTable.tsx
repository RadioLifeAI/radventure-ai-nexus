
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserReportsAdmin } from "@/hooks/useUserReportsAdmin";
import { ReportDetailsModal } from "./ReportDetailsModal";
import { Eye, Search, Filter } from "lucide-react";

interface UserReport {
  id: string;
  user_id: string;
  case_id: string;
  report_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  case_title?: string;
}

const reportTypeLabels: Record<string, string> = {
  'content_error': 'Erro de Conteúdo',
  'technical_issue': 'Problema Técnico',
  'inappropriate_content': 'Conteúdo Inadequado',
  'suggestion': 'Sugestão',
  'other': 'Outro'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  'in_progress': { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
  'resolved': { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
  'dismissed': { label: 'Arquivado', color: 'bg-gray-100 text-gray-800' }
};

export function ReportsManagementTable() {
  const { reports, isLoading } = useUserReportsAdmin();
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filtrar reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.case_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.report_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (report: UserReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Carregando reports...</div>
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por título, usuário ou caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="dismissed">Arquivado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="content_error">Erro de Conteúdo</SelectItem>
            <SelectItem value="technical_issue">Problema Técnico</SelectItem>
            <SelectItem value="inappropriate_content">Conteúdo Inadequado</SelectItem>
            <SelectItem value="suggestion">Sugestão</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Título</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Caso</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                    ? "Nenhum report encontrado com os filtros aplicados"
                    : "Nenhum report enviado ainda"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {report.title}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{report.user_name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{report.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {report.case_title || `ID: ${report.case_id.slice(0, 8)}...`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {reportTypeLabels[report.report_type] || report.report_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusLabels[report.status]?.color}`}>
                      {statusLabels[report.status]?.label || report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(report.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <ReportDetailsModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
      />
    </>
  );
}
