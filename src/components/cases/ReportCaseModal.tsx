
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserReports } from '@/hooks/useUserReports';
import { Flag, AlertTriangle, Wrench, Eye, Lightbulb, HelpCircle } from 'lucide-react';

interface ReportCaseModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  caseName?: string;
}

const reportTypes = [
  {
    value: 'content_error',
    label: 'Erro de Conteúdo',
    icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    description: 'Informação médica incorreta ou desatualizada'
  },
  {
    value: 'technical_issue',
    label: 'Problema Técnico',
    icon: <Wrench className="h-4 w-4 text-blue-500" />,
    description: 'Imagem não carrega, botões não funcionam, etc.'
  },
  {
    value: 'inappropriate_content',
    label: 'Conteúdo Inadequado',
    icon: <Eye className="h-4 w-4 text-red-500" />,
    description: 'Conteúdo impróprio ou ofensivo'
  },
  {
    value: 'suggestion',
    label: 'Sugestão de Melhoria',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
    description: 'Ideia para melhorar este caso'
  },
  {
    value: 'other',
    label: 'Outro',
    icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
    description: 'Outro tipo de feedback'
  }
];

export function ReportCaseModal({ open, onClose, caseId, caseName }: ReportCaseModalProps) {
  const [reportType, setReportType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createReport, isSubmitting } = useUserReports();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !title.trim() || !description.trim()) {
      return;
    }

    const result = await createReport({
      caseId,
      caseName,
      reportType: reportType as any,
      title: title.trim(),
      description: description.trim()
    });

    if (result.success) {
      // Reset form
      setReportType('');
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  const selectedType = reportTypes.find(type => type.value === reportType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Reportar Problema
          </DialogTitle>
          <DialogDescription>
            {caseName && (
              <span className="font-semibold text-blue-700">
                Caso: {caseName}
              </span>
            )}
            <br />
            Ajude-nos a melhorar este caso médico reportando problemas ou sugestões.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Tipo de Report</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo do problema" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                {selectedType.icon}
                <span className="font-medium text-sm">{selectedType.label}</span>
              </div>
              <p className="text-xs text-gray-600">{selectedType.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título do Report</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumo breve do problema..."
              maxLength={100}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {title.length}/100 caracteres
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema ou sugestão em detalhes..."
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {description.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!reportType || !title.trim() || !description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
