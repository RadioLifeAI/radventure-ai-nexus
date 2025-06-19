
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Clock,
  Users,
  Mail,
  MessageCircle,
  Calendar,
  Trophy,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;
  category: "scheduling" | "notifications" | "optimization" | "management";
}

const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "auto-schedule",
    name: "Agendamento Automático",
    description: "Agenda eventos automaticamente nos melhores horários",
    trigger: "Evento criado sem data",
    action: "Sugerir e aplicar melhor horário baseado em IA",
    isActive: true,
    lastExecuted: new Date(),
    executionCount: 23,
    category: "scheduling"
  },
  {
    id: "low-participation-alert",
    name: "Alerta de Baixa Participação",
    description: "Notifica quando participação está abaixo do esperado",
    trigger: "2h antes do evento com < 50% das inscrições esperadas",
    action: "Enviar notificações push e ajustar prêmios",
    isActive: true,
    lastExecuted: new Date(Date.now() - 3600000),
    executionCount: 8,
    category: "notifications"
  },
  {
    id: "auto-prize-optimization",
    name: "Otimização Automática de Prêmios",
    description: "Ajusta prêmios baseado na participação em tempo real",
    trigger: "Durante o evento",
    action: "Aumentar prêmios se participação > 120% do esperado",
    isActive: false,
    lastExecuted: new Date(Date.now() - 86400000),
    executionCount: 15,
    category: "optimization"
  },
  {
    id: "series-creation",
    name: "Criação de Séries Automática",
    description: "Cria eventos em série baseado em templates de sucesso",
    trigger: "Evento com > 90% satisfação",
    action: "Criar 3 eventos similares nos próximos meses",
    isActive: true,
    lastExecuted: new Date(Date.now() - 172800000),
    executionCount: 5,
    category: "management"
  },
  {
    id: "reminder-notifications",
    name: "Lembretes Inteligentes",
    description: "Envia lembretes personalizados baseados no perfil do usuário",
    trigger: "24h, 2h e 15min antes do evento",
    action: "Enviar lembretes via email e push",
    isActive: true,
    lastExecuted: new Date(Date.now() - 7200000),
    executionCount: 156,
    category: "notifications"
  },
  {
    id: "difficulty-adjustment",
    name: "Ajuste Automático de Dificuldade",
    description: "Ajusta dificuldade baseado na performance em tempo real",
    trigger: "Taxa de acerto < 40% ou > 85%",
    action: "Ajustar dificuldade dos próximos casos",
    isActive: false,
    lastExecuted: new Date(Date.now() - 43200000),
    executionCount: 12,
    category: "optimization"
  }
];

interface Props {
  onConfigureAutomation: (ruleId: string, config: any) => void;
  onToggleAutomation: (ruleId: string, enabled: boolean) => void;
  onCreateRule: (rule: any) => void;
}

export function EventAutomationHub({ onConfigureAutomation, onToggleAutomation, onCreateRule }: Props) {
  const [rules, setRules] = useState<AutomationRule[]>(AUTOMATION_RULES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger: "",
    action: "",
    category: "scheduling"
  });

  const categories = [
    { value: "all", label: "Todas as Categorias", icon: Settings },
    { value: "scheduling", label: "Agendamento", icon: Calendar },
    { value: "notifications", label: "Notificações", icon: Mail },
    { value: "optimization", label: "Otimização", icon: Target },
    { value: "management", label: "Gestão", icon: Users }
  ];

  const filteredRules = selectedCategory === "all" 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      onToggleAutomation(ruleId, !rule.isActive);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "scheduling": return <Calendar className="h-4 w-4" />;
      case "notifications": return <Mail className="h-4 w-4" />;
      case "optimization": return <Target className="h-4 w-4" />;
      case "management": return <Users className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "scheduling": return "bg-blue-100 text-blue-700";
      case "notifications": return "bg-green-100 text-green-700";
      case "optimization": return "bg-purple-100 text-purple-700";
      case "management": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatLastExecuted = (date?: Date) => {
    if (!date) return "Nunca executado";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Há menos de 1 hora";
    if (hours < 24) return `Há ${hours} horas`;
    const days = Math.floor(hours / 24);
    return `Há ${days} dias`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Central de Automações
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure automações inteligentes para otimizar seus eventos automaticamente
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-600">
                {filteredRules.filter(r => r.isActive).length} de {filteredRules.length} ativas
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Sugestões de IA
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Nova Automação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Regras Ativas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="create">Criar Nova</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {filteredRules.map((rule) => (
            <Card key={rule.id} className={`transition-all ${rule.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(rule.category)}
                      <h3 className="font-semibold text-lg">{rule.name}</h3>
                      <Badge className={getCategoryColor(rule.category)}>
                        {rule.category}
                      </Badge>
                      {rule.isActive ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Pause className="h-3 w-3 mr-1" />
                          Pausada
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{rule.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Gatilho: </span>
                        <span className="text-gray-600">{rule.trigger}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Ação: </span>
                        <span className="text-gray-600">{rule.action}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Última execução: {formatLastExecuted(rule.lastExecuted)}
                      </div>
                      <div className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Executada {rule.executionCount} vezes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigureAutomation(rule.id, {})}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "14:30", rule: "Lembretes Inteligentes", status: "success", detail: "156 notificações enviadas" },
                  { time: "12:15", rule: "Alerta de Baixa Participação", status: "success", detail: "Evento 'Neuro Quiz' - Prêmios aumentados em 20%" },
                  { time: "09:00", rule: "Agendamento Automático", status: "success", detail: "Evento agendado para terça, 19:30" },
                  { time: "08:45", rule: "Criação de Séries", status: "error", detail: "Falha ao criar evento - Template não encontrado" }
                ].map((execution, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {execution.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{execution.rule}</div>
                        <div className="text-sm text-gray-600">{execution.detail}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{execution.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Automação</CardTitle>
              <p className="text-sm text-gray-600">
                Configure uma nova regra de automação personalizada
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Automação</label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Ex: Notificação de Follow-up"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <Select 
                    value={newRule.category}
                    onValueChange={(value: any) => setNewRule({...newRule, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduling">Agendamento</SelectItem>
                      <SelectItem value="notifications">Notificações</SelectItem>
                      <SelectItem value="optimization">Otimização</SelectItem>
                      <SelectItem value="management">Gestão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  placeholder="Descreva o que esta automação faz..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gatilho (Quando executar)</label>
                <Input
                  value={newRule.trigger}
                  onChange={(e) => setNewRule({...newRule, trigger: e.target.value})}
                  placeholder="Ex: 24 horas após o evento terminar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ação (O que fazer)</label>
                <Input
                  value={newRule.action}
                  onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                  placeholder="Ex: Enviar pesquisa de satisfação via email"
                />
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dica da IA:</strong> Automações bem configuradas podem aumentar a eficiência em até 60%. 
                  Considere começar com notificações automáticas e depois expandir para otimizações mais complexas.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => onCreateRule(newRule)}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!newRule.name || !newRule.trigger || !newRule.action}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Automação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
