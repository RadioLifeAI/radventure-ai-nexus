
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotificationForAllUsers, createNotification } from "@/utils/notifications";

export function NotificationManagement() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("new_event");
  const [actionUrl, setActionUrl] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendToAll = async () => {
    if (!title || !message) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createNotificationForAllUsers({
        type: type as any,
        title,
        message,
        priority: priority as any,
        actionUrl: actionUrl || undefined,
        actionLabel: actionLabel || undefined,
        metadata: {
          sent_by: 'admin',
          sent_at: new Date().toISOString()
        }
      });

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Notificação enviada para todos os usuários",
        });
        
        // Limpar formulário
        setTitle("");
        setMessage("");
        setActionUrl("");
        setActionLabel("");
      } else {
        throw new Error("Falha ao enviar notificação");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar notificação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: "new_event", label: "Novo Evento", icon: "🎉" },
    { value: "achievement_unlocked", label: "Conquista", icon: "🏆" },
    { value: "ranking_update", label: "Ranking", icon: "📊" },
    { value: "reminder", label: "Lembrete", icon: "⏰" },
    { value: "radcoin_reward", label: "RadCoins", icon: "💰" },
    { value: "streak_milestone", label: "Streak", icon: "🔥" },
  ];

  const priorityOptions = [
    { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Média", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "Alta", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Notificações</h1>
          <p className="text-gray-600">Envie notificações para todos os usuários da plataforma</p>
        </div>
      </div>

      {/* Formulário de Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Criar Nova Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Notificação</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <Badge className={p.color}>{p.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da notificação"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem *</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/500 caracteres
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL de Ação (opcional)</label>
              <Input
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/app/eventos"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Texto do Botão (opcional)</label>
              <Input
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="Ver Evento"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Esta notificação será enviada para todos os usuários ativos
            </div>

            <Button 
              onClick={handleSendToAll}
              disabled={loading || !title || !message}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Notificações Enviadas</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Abertura</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">2,456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
