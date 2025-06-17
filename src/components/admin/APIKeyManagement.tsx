
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key, Plus, Edit, TestTube, Eye, EyeOff, ExternalLink } from "lucide-react";

export function APIKeyManagement() {
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [testingAPI, setTestingAPI] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    key: "",
    description: ""
  });

  // Simulated API keys data (in real implementation, this would come from Supabase secrets)
  const apiKeys = [
    { id: "openai", name: "OpenAI API", provider: "OpenAI", status: "active", lastUsed: "2024-06-17" },
    { id: "stripe", name: "Stripe Secret Key", provider: "Stripe", status: "active", lastUsed: "2024-06-16" },
    { id: "anthropic", name: "Anthropic API", provider: "Anthropic", status: "inactive", lastUsed: "Never" },
  ];

  const apiProviders = [
    { name: "OpenAI", docs: "https://platform.openai.com/api-keys", description: "Integração com GPT-4 e outros modelos" },
    { name: "Stripe", docs: "https://dashboard.stripe.com/apikeys", description: "Processamento de pagamentos" },
    { name: "Anthropic", docs: "https://console.anthropic.com/", description: "Claude AI models" },
    { name: "Google", docs: "https://console.cloud.google.com/", description: "Google Cloud APIs" },
  ];

  const handleTestAPI = async (apiId: string) => {
    setTestingAPI(apiId);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingAPI(null);
    toast.success(`API ${apiId} testada com sucesso!`);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, this would save to Supabase secrets
    toast.success("Chave API configurada com sucesso!");
    setShowKeyForm(false);
    setFormData({ name: "", provider: "", key: "", description: "" });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="text-green-600" />
            Gestão de Chaves API
          </h1>
          <p className="text-gray-600">Configure e monitore integrações com APIs externas</p>
        </div>
        <Button onClick={() => setShowKeyForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Chave API
        </Button>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chaves Configuradas
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Provedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chaves API Configuradas</CardTitle>
              <CardDescription>
                Gerencie as chaves de API para integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((api) => (
                    <TableRow key={api.id}>
                      <TableCell className="font-medium">{api.name}</TableCell>
                      <TableCell>{api.provider}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {visibleKeys.has(api.id) ? `sk-...${api.id.slice(-8)}` : maskApiKey(`sk-...${api.id.slice(-8)}`)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(api.id)}
                          >
                            {visibleKeys.has(api.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                          {api.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>{api.lastUsed}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestAPI(api.id)}
                            disabled={testingAPI === api.id}
                          >
                            <TestTube className="h-4 w-4" />
                            {testingAPI === api.id ? 'Testando...' : 'Testar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowKeyForm(true)}
                          >
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiProviders.map((provider) => (
              <Card key={provider.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {provider.name}
                    <Button variant="outline" size="sm" asChild>
                      <a href={provider.docs} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Documentação
                      </a>
                    </Button>
                  </CardTitle>
                  <CardDescription>{provider.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      setFormData({...formData, provider: provider.name});
                      setShowKeyForm(true);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Configurar {provider.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showKeyForm} onOpenChange={setShowKeyForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Chave API</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: OpenAI Principal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="provider">Provedor</Label>
                <select
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecione...</option>
                  {apiProviders.map((provider) => (
                    <option key={provider.name} value={provider.name}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="key">Chave API</Label>
              <Input
                id="key"
                type="password"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="Insira a chave API"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o uso desta chave"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowKeyForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Chave
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
