
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Users, Filter } from "lucide-react";
import { toast } from "sonner";

interface NotificationFormProps {
  onCreateSingle: (userId: string, notification: any) => Promise<any>;
  onCreateBulk: (notification: any) => Promise<any>;
  onCreateFiltered: (notification: any, filters: any) => Promise<any>;
}

const notificationTypes = [
  { value: 'achievement_unlocked', label: 'Conquista Desbloqueada' },
  { value: 'streak_milestone', label: 'Marco de Streak' },
  { value: 'radcoin_reward', label: 'Recompensa RadCoin' },
  { value: 'system_maintenance', label: 'Manutenção do Sistema' },
  { value: 'feature_announcement', label: 'Novo Recurso' },
  { value: 'study_reminder', label: 'Lembrete de Estudo' },
  { value: 'weekly_summary', label: 'Resumo Semanal' },
  { value: 'learning_tip', label: 'Dica de Aprendizado' }
];

export function NotificationForm({ onCreateSingle, onCreateBulk, onCreateFiltered }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    message: '',
    priority: 'medium',
    actionUrl: '',
    actionLabel: ''
  });

  const [singleUserId, setSingleUserId] = useState('');
  const [filters, setFilters] = useState({
    academic_stage: '',
    medical_specialty: '',
    min_points: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.type || !formData.title || !formData.message) {
      toast.error('Preencha os campos obrigatórios');
      return false;
    }
    return true;
  };

  const handleCreateSingle = async () => {
    if (!validateForm() || !singleUserId) {
      toast.error('Informe o ID do usuário');
      return;
    }

    setLoading(true);
    try {
      const result = await onCreateSingle(singleUserId, formData);
      if (result.success) {
        toast.success('Notificação enviada!');
        resetForm();
      } else {
        toast.error('Erro ao enviar notificação');
      }
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBulk = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await onCreateBulk(formData);
      if (result.success) {
        toast.success('Notificações enviadas para todos os usuários!');
        resetForm();
      } else {
        toast.error('Erro ao enviar notificações');
      }
    } catch (error) {
      toast.error('Erro ao enviar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFiltered = async () => {
    if (!validateForm()) return;

    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = key === 'min_points' ? parseInt(value) : value;
        return acc;
      }, {} as any);

    if (Object.keys(activeFilters).length === 0) {
      toast.error('Configure pelo menos um filtro');
      return;
    }

    setLoading(true);
    try {
      const result = await onCreateFiltered(formData, activeFilters);
      if (result.success) {
        toast.success(`Notificação enviada para ${result.count} usuários!`);
        resetForm();
      } else {
        toast.error('Erro ao enviar notificações');
      }
    } catch (error) {
      toast.error('Erro ao enviar notificações');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      message: '',
      priority: 'medium',
      actionUrl: '',
      actionLabel: ''
    });
    setSingleUserId('');
    setFilters({
      academic_stage: '',
      medical_specialty: '',
      min_points: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Notificação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Formulário Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título da notificação"
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem *</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Conteúdo da notificação"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>URL de Ação</Label>
              <Input
                value={formData.actionUrl}
                onChange={(e) => handleInputChange('actionUrl', e.target.value)}
                placeholder="/app/exemplo"
              />
            </div>

            <div className="space-y-2">
              <Label>Texto do Botão</Label>
              <Input
                value={formData.actionLabel}
                onChange={(e) => handleInputChange('actionLabel', e.target.value)}
                placeholder="Ver Detalhes"
              />
            </div>
          </div>

          {/* Tabs para diferentes tipos de envio */}
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuário Específico
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Todos os Usuários
              </TabsTrigger>
              <TabsTrigger value="filtered" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Com Filtros
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="space-y-2">
                <Label>ID do Usuário *</Label>
                <Input
                  value={singleUserId}
                  onChange={(e) => setSingleUserId(e.target.value)}
                  placeholder="UUID do usuário"
                />
              </div>
              <Button onClick={handleCreateSingle} disabled={loading} className="w-full">
                Enviar para Usuário
              </Button>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Esta ação enviará a notificação para TODOS os usuários da plataforma.
                </p>
              </div>
              <Button onClick={handleCreateBulk} disabled={loading} className="w-full">
                Enviar para Todos
              </Button>
            </TabsContent>

            <TabsContent value="filtered" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nível Acadêmico</Label>
                  <Select value={filters.academic_stage} onValueChange={(value) => handleFilterChange('academic_stage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Estudante</SelectItem>
                      <SelectItem value="Intern">Interno</SelectItem>
                      <SelectItem value="Resident">Residente</SelectItem>
                      <SelectItem value="Specialist">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    value={filters.medical_specialty}
                    onChange={(e) => handleFilterChange('medical_specialty', e.target.value)}
                    placeholder="Ex: Radiologia"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pontos Mínimos</Label>
                  <Input
                    type="number"
                    value={filters.min_points}
                    onChange={(e) => handleFilterChange('min_points', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <Button onClick={handleCreateFiltered} disabled={loading} className="w-full">
                Enviar com Filtros
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
