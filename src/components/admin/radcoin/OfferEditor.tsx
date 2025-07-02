
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  X, 
  Eye, 
  Flame, 
  Percent,
  Clock,
  Gift,
  Zap,
  Target
} from "lucide-react";

interface OfferEditorProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: any;
  onSave: (offer: any) => void;
  isLoading?: boolean;
}

export function OfferEditor({ isOpen, onClose, offer, onSave, isLoading = false }: OfferEditorProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    original_price: 0,
    sale_price: 0,
    discount_percentage: 0,
    benefits: {
      elimination_aids: 0,
      skip_aids: 0,
      ai_tutor_credits: 0,
      bonus_points_multiplier: 1
    },
    is_active: true,
    is_limited: false,
    max_redemptions: 100,
    expires_at: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (offer) {
      setFormData({
        id: offer.id || '',
        name: offer.name || '',
        description: offer.description || '',
        original_price: offer.original_price || 0,
        sale_price: offer.sale_price || 0,
        discount_percentage: offer.discount_percentage || 0,
        benefits: offer.benefits || {
          elimination_aids: 0,
          skip_aids: 0,
          ai_tutor_credits: 0,
          bonus_points_multiplier: 1
        },
        is_active: offer.is_active !== undefined ? offer.is_active : true,
        is_limited: offer.is_limited || false,
        max_redemptions: offer.max_redemptions || 100,
        expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().slice(0, 16) : ''
      });
    } else {
      // Nova oferta
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      
      setFormData({
        id: `offer_${Date.now()}`,
        name: '',
        description: '',
        original_price: 200,
        sale_price: 100,
        discount_percentage: 50,
        benefits: {
          elimination_aids: 20,
          skip_aids: 10,
          ai_tutor_credits: 5,
          bonus_points_multiplier: 1.5
        },
        is_active: true,
        is_limited: true,
        max_redemptions: 50,
        expires_at: tomorrow.toISOString().slice(0, 16)
      });
    }
  }, [offer]);

  const handleSave = () => {
    const offerData = {
      ...formData,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
    };
    onSave(offerData);
  };

  const calculateDiscount = () => {
    if (formData.original_price > 0 && formData.sale_price > 0) {
      const discount = Math.round(((formData.original_price - formData.sale_price) / formData.original_price) * 100);
      setFormData(prev => ({ ...prev, discount_percentage: discount }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {offer ? 'Editar Oferta Especial' : 'Nova Oferta Especial'}
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
                  <CardTitle className="text-lg">Informações da Oferta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Oferta</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Mega Oferta Weekend"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva a oferta especial..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="original_price">Preço Original</Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: parseInt(e.target.value)})}
                        onBlur={calculateDiscount}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_price">Preço Promocional</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({...formData, sale_price: parseInt(e.target.value)})}
                        onBlur={calculateDiscount}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({...formData, discount_percentage: parseInt(e.target.value)})}
                        min="0"
                        max="90"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expires_at">Data de Expiração</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    />
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

                  <div>
                    <Label htmlFor="multiplier">Multiplicador de Pontos</Label>
                    <Input
                      id="multiplier"
                      type="number"
                      step="0.1"
                      value={formData.benefits.bonus_points_multiplier}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benefits: {
                          ...formData.benefits, 
                          bonus_points_multiplier: parseFloat(e.target.value)
                        }
                      })}
                      min="1"
                      max="5"
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
                      <Label htmlFor="active">Oferta Ativa</Label>
                      <p className="text-sm text-gray-600">Disponível para compra</p>
                    </div>
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(is_active) => setFormData({...formData, is_active})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="limited">Oferta Limitada</Label>
                      <p className="text-sm text-gray-600">Quantidade limitada</p>
                    </div>
                    <Switch
                      id="limited"
                      checked={formData.is_limited}
                      onCheckedChange={(is_limited) => setFormData({...formData, is_limited})}
                    />
                  </div>

                  {formData.is_limited && (
                    <div>
                      <Label htmlFor="max_redemptions">Máximo de Resgates</Label>
                      <Input
                        id="max_redemptions"
                        type="number"
                        value={formData.max_redemptions}
                        onChange={(e) => setFormData({...formData, max_redemptions: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview da Oferta</h3>
            
            <Card className="max-w-sm mx-auto hover:shadow-lg transition-shadow border-2 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{formData.name || 'Nome da Oferta'}</CardTitle>
                  </div>
                  <Badge className="bg-red-500 text-white">
                    <Percent className="h-3 w-3 mr-1" />
                    -{formData.discount_percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {formData.description || 'Descrição da oferta aparecerá aqui...'}
                </p>
                
                {/* Preços */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 line-through">
                    {formData.original_price} RC
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formData.sale_price} RC
                  </div>
                  <Badge className="bg-orange-500 text-white">
                    -{formData.discount_percentage}%
                  </Badge>
                </div>

                {/* Tempo Restante */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-600">
                    {formData.expires_at ? `Expira em ${new Date(formData.expires_at).toLocaleDateString()}` : 'Sem expiração'}
                  </span>
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
                    {formData.benefits.bonus_points_multiplier > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span>{formData.benefits.bonus_points_multiplier}x Pontos</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Comprar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-orange-600 to-red-600" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Oferta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
