
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, BarChart3 } from "lucide-react";
import { AITutorHeader } from "./tutor/AITutorHeader";
import { AIConfigTable } from "./tutor/AIConfigTable";

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

  const handleEditConfig = (config: any) => {
    setSelectedConfig(config);
    setShowConfigForm(true);
  };

  return (
    <div className="space-y-6">
      <AITutorHeader onNewConfig={() => setShowConfigForm(true)} />

      <Tabs defaultValue="configs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-1 rounded-xl">
          <TabsTrigger value="configs" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <BarChart3 className="h-4 w-4" />
            Uso e Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Settings className="h-5 w-5" />
                Configurações do Tutor IA
              </CardTitle>
              <CardDescription className="text-purple-700">
                Gerencie modelos, prompts e parâmetros do sistema de tutoria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AIConfigTable 
                configs={configs}
                onEdit={handleEditConfig}
                onDelete={handleDeleteConfig}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <BarChart3 className="h-5 w-5" />
                Logs de Uso do Tutor IA
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Monitore o uso e performance do sistema de tutoria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
