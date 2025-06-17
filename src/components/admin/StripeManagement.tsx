
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreditCard, DollarSign, Settings, BarChart3, Webhook, ExternalLink } from "lucide-react";

export function StripeManagement() {
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    testMode: true,
    currency: "BRL"
  });

  // Simulated data
  const transactions = [
    { id: "tx_1", customer: "João Silva", amount: 49.90, status: "paid", date: "2024-06-17" },
    { id: "tx_2", customer: "Maria Santos", amount: 99.90, status: "pending", date: "2024-06-16" },
    { id: "tx_3", customer: "Pedro Lima", amount: 29.90, status: "failed", date: "2024-06-15" },
  ];

  const subscriptions = [
    { id: "sub_1", customer: "Ana Costa", plan: "Pro", status: "active", amount: 49.90 },
    { id: "sub_2", customer: "Carlos Moura", plan: "Premium", status: "active", amount: 99.90 },
    { id: "sub_3", customer: "Lucia Alves", plan: "Basic", status: "canceled", amount: 29.90 },
  ];

  const handleSaveConfig = () => {
    // In real implementation, this would save to Supabase secrets
    toast.success("Configuração Stripe salva com sucesso!");
    setShowConfigForm(false);
  };

  const handleTestConnection = async () => {
    toast.info("Testando conexão com Stripe...");
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Conexão com Stripe estabelecida com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed':
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="text-blue-600" />
            Configuração Stripe
          </h1>
          <p className="text-gray-600">Configure pagamentos, assinaturas e webhooks do Stripe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            Testar Conexão
          </Button>
          <Button onClick={() => setShowConfigForm(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da Conexão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Conectado</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Modo: {stripeConfig.testMode ? "Teste" : "Produção"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 2.847,50</div>
                <p className="text-sm text-green-600">+15.3% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assinaturas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">147</div>
                <p className="text-sm text-blue-600">+7 novos este mês</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Links Úteis</CardTitle>
              <CardDescription>Acesso rápido ao dashboard do Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Dashboard Stripe
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Chaves API
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Webhooks
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Produtos
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas transações processadas pelo Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas</CardTitle>
              <CardDescription>Gestão de assinaturas recorrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-sm">{subscription.id}</TableCell>
                      <TableCell>{subscription.customer}</TableCell>
                      <TableCell>{subscription.plan}</TableCell>
                      <TableCell>R$ {subscription.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>Configure endpoints para receber eventos do Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>URL do Webhook</Label>
                  <Input 
                    value="https://your-app.com/api/stripe/webhook" 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Eventos Configurados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">payment_intent.succeeded</Badge>
                    <Badge variant="outline">subscription.created</Badge>
                    <Badge variant="outline">subscription.updated</Badge>
                    <Badge variant="outline">subscription.deleted</Badge>
                    <Badge variant="outline">invoice.payment_succeeded</Badge>
                  </div>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configurar no Stripe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showConfigForm} onOpenChange={setShowConfigForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuração Stripe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="publishableKey">Chave Publicável</Label>
              <Input
                id="publishableKey"
                value={stripeConfig.publishableKey}
                onChange={(e) => setStripeConfig({...stripeConfig, publishableKey: e.target.value})}
                placeholder="pk_test_..."
              />
            </div>
            
            <div>
              <Label htmlFor="secretKey">Chave Secreta</Label>
              <Input
                id="secretKey"
                type="password"
                value={stripeConfig.secretKey}
                onChange={(e) => setStripeConfig({...stripeConfig, secretKey: e.target.value})}
                placeholder="sk_test_..."
              />
            </div>

            <div>
              <Label htmlFor="webhookSecret">Webhook Secret</Label>
              <Input
                id="webhookSecret"
                type="password"
                value={stripeConfig.webhookSecret}
                onChange={(e) => setStripeConfig({...stripeConfig, webhookSecret: e.target.value})}
                placeholder="whsec_..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Moeda</Label>
                <select
                  id="currency"
                  value={stripeConfig.currency}
                  onChange={(e) => setStripeConfig({...stripeConfig, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="testMode"
                  checked={stripeConfig.testMode}
                  onCheckedChange={(checked) => setStripeConfig({...stripeConfig, testMode: checked})}
                />
                <Label htmlFor="testMode">Modo de Teste</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowConfigForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfig}>
                Salvar Configuração
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
