
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Settings, BarChart3, Plus, Edit, Trash2 } from "lucide-react";

export function AITutorManagement() {
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);

  const { data: configs = [], isLoading, refetch } = useQuery({
    queryKey: ["ai-tutor-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tutor_config")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ["ai-tutor-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tutor_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const handleSaveConfig = async (configData: any) => {
    try {
      const { error } = await supabase
        .from("ai_tutor_config")
        .upsert(configData);

      if (error) throw error;

      toast.success("Configuração salva com sucesso!");
      setShowConfigForm(false);
      setSelectedConfig(null);
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao salvar configuração: ${error.message}`);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      const { error } = await supabase
        .from("ai_tutor_config")
        .delete()
        .eq("id", configId);

      if (error) throw error;

      toast.success("Configuração deletada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(`Erro ao deletar configuração: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão do Tutor IA</h1>
          <p className="text-gray-600">Configure e monitore o sistema de tutoria por IA</p>
        </div>
        <Button onClick={() => setShowConfigForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <Tabs defaultValue="configs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Uso e Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Tutor IA</CardTitle>
              <CardDescription>
                Gerencie modelos, prompts e parâmetros do sistema de tutoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.config_name}</TableCell>
                      <TableCell>{config.model_name}</TableCell>
                      <TableCell>{config.api_provider}</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedConfig(config);
                              setShowConfigForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteConfig(config.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Uso do Tutor IA</CardTitle>
              <CardDescription>
                Monitore o uso e performance do sistema de tutoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Tempo (ms)</TableHead>
                    <TableHead>Qualidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{log.user_id}</TableCell>
                      <TableCell>{log.tokens_used}</TableCell>
                      <TableCell>R$ {log.cost?.toFixed(4) || 'N/A'}</TableCell>
                      <TableCell>{log.response_time_ms}</TableCell>
                      <TableCell>
                        {log.quality_rating ? (
                          <Badge variant="outline">
                            {log.quality_rating}/5
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
