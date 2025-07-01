
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  X, 
  Eye, 
  Gift, 
  Zap, 
  Target, 
  Percent,
  Star,
  Crown
} from "lucide-react";

interface ProductEditorProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave: (product: any) => void;
}

export function ProductEditor({ isOpen, onClose, product, onSave }: ProductEditorProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    benefits: {
      elimination_aids: 0,
      skip_aids: 0,
      ai_tutor_credits: 0
    },
    popular: false,
    discount: 0,
    isActive: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        benefits: product.benefits || {
          elimination_aids: 0,
          skip_aids: 0,
          ai_tutor_credits: 0
        },
        popular: product.popular || false,
        discount: product.discount || 0,
        isActive: true
      });
    } else {
      // Reset para novo produto
      setFormData({
        id: `product_${Date.now()}`,
        name: '',
        description: '',
        price: 100,
        benefits: {
          elimination_aids: 5,
          skip_aids: 2,
          ai_tutor_credits: 1
        },
        popular: false,
        discount: 0,
        isActive: true
      });
    }
  }, [product]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const calculateFinalPrice = () => {
    return formData.discount > 0 
      ? Math.round(formData.price * (1 - formData.discount / 100))
      : formData.price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Editar' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          {!previewMode && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Pacote Básico"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva os benefícios do produto..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Preço (RadCoins)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value)})}
                        min="0"
                        max="90"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefícios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="elimination">Ajudas de Eliminação</Label>
                    <Input
                      id="elimination"
                      type="number"
                      value={formData.benefits.elimination_aids}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benefits: {
                          ...formData.benefits, 
                          elimination_aids: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="skip">Ajudas de Pular</Label>
                    <Input
                      id="skip"
                      type="number"
                      value={formData.benefits.skip_aids}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benefits: {
                          ...formData.benefits, 
                          skip_aids: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ai_credits">Créditos Tutor IA</Label>
                    <Input
                      id="ai_credits"
                      type="number"
                      value={formData.benefits.ai_tutor_credits}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benefits: {
                          ...formData.benefits, 
                          ai_tutor_credits: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="popular">Produto Popular</Label>
                      <p className="text-sm text-gray-600">Destacar como escolha popular</p>
                    </div>
                    <Switch
                      id="popular"
                      checked={formData.popular}
                      onCheckedChange={(popular) => setFormData({...formData, popular})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="active">Produto Ativo</Label>
                      <p className="text-sm text-gray-600">Disponível para compra</p>
                    </div>
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(isActive) => setFormData({...formData, isActive})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview do Card */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview do Produto</h3>
            
            {/* Card Preview */}
            <Card className="max-w-sm mx-auto hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">{formData.name || 'Nome do Produto'}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {formData.popular && (
                      <Badge className="bg-purple-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {formData.discount > 0 && (
                      <Badge className="bg-orange-500 text-white">
                        <Percent className="h-3 w-3 mr-1" />
                        -{formData.discount}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {formData.description || 'Descrição do produto aparecerá aqui...'}
                </p>
                
                {/* Preço */}
                <div className="flex items-center gap-2">
                  {formData.discount > 0 ? (
                    <>
                      <div className="text-sm text-gray-500 line-through">
                        {formData.price} RC
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {calculateFinalPrice()} RC
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.price} RC
                    </div>
                  )}
                </div>

                {/* Benefícios */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Benefícios:</h4>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-red-500" />
                      <span>{formData.benefits.elimination_aids} Eliminações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span>{formData.benefits.skip_aids} Pular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="h-3 w-3 text-purple-500" />
                      <span>{formData.benefits.ai_tutor_credits} Tutor IA</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Comprar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Salvar Produto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
