import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Globe, Gamepad2, Brain, Plus, Edit, Trash2 } from "lucide-react";

export function AdvancedSettings() {
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    category: "system",
    description: "",
    value: {},
    is_public: false
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const saveSettingMutation = useMutation({
    mutationFn: async (settingData: any) => {
      if (settingData.id) {
        const { error } = await supabase
          .from("app_settings")
          .update({
            ...settingData,
            updated_at: new Date().toISOString()
          })
          .eq("id", settingData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("app_settings")
          .insert([settingData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast.success("Configuração salva com sucesso!");
      setShowSettingForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar configuração: ${error.message}`);
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: async (settingId: string) => {
      const { error } = await supabase
        .from("app_settings")
        .delete()
        .eq("id", settingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast.success("Configuração deletada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar configuração: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      key: "",
      category: "system",
      description: "",
      value: {},
      is_public: false
    });
    setSelectedSetting(null);
  };

  const handleEdit = (setting: any) => {
    setSelectedSetting(setting);
    setFormData({
      key: setting.key || "",
      category: setting.category || "system",
      description: setting.description || "",
      value: setting.value || {},
      is_public: setting.is_public || false
    });
    setShowSettingForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settingData = {
      ...formData,
      ...(selectedSetting ? { id: selectedSetting.id } : {})
    };
    saveSettingMutation.mutate(settingData);
  };

  const settingsByCategory = settings.reduce((acc: any, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui': return <Globe className="h-4 w-4" />;
      case 'gamification': return <Gamepad2 className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="text-blue-600" />
            Configurações Avançadas
          </h1>
          <p className="text-gray-600">Gerencie configurações de sistema, UI e gamificação</p>
        </div>
        <Button onClick={() => setShowSettingForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Gamificação
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA & Tutoria
          </TabsTrigger>
        </TabsList>

        {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  Configurações de {category.charAt(0).toUpperCase() + category.slice(1)}
                </CardTitle>
                <CardDescription>
                  Gerencie as configurações específicas desta categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chave</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Público</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(categorySettings as any[]).map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-medium">{setting.key}</TableCell>
                        <TableCell>{setting.description || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {typeof setting.value === 'object' 
                            ? JSON.stringify(setting.value).substring(0, 50) + '...'
                            : String(setting.value)}
                        </TableCell>
                        <TableCell>
                          {setting.is_public ? "Sim" : "Não"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(setting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSettingMutation.mutate(setting.id)}
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
        ))}
      </Tabs>

      <Dialog open={showSettingForm} onOpenChange={setShowSettingForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSetting ? "Editar Configuração" : "Nova Configuração"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="key">Chave</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="system">Sistema</option>
                  <option value="ui">Interface</option>
                  <option value="gamification">Gamificação</option>
                  <option value="ai">IA & Tutoria</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="value">Valor (JSON)</Label>
              <Textarea
                id="value"
                value={JSON.stringify(formData.value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({...formData, value: parsed});
                  } catch (error) {
                    // Invalid JSON, keep the text for user to fix
                  }
                }}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
              />
              <Label htmlFor="public">Configuração Pública</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSettingForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveSettingMutation.isPending}>
                {selectedSetting ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
