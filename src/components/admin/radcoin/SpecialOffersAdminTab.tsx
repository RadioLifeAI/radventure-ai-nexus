
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Flame, 
  Percent,
  Eye,
  Timer
} from "lucide-react";
import { useRadCoinStore } from "@/components/radcoin-shop/hooks/useRadCoinStore";
import { useOfferMutations } from "./hooks/useOfferMutations";
import { OfferEditor } from "./OfferEditor";

export function SpecialOffersAdminTab() {
  const { specialOffers, isLoadingOffers } = useRadCoinStore();
  const { createOffer, updateOffer, deleteOffer, isLoading: isMutating } = useOfferMutations();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setIsEditorOpen(true);
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setIsEditorOpen(true);
  };

  const handleDeleteOffer = (offerId: string) => {
    if (confirm('Tem certeza que deseja excluir esta oferta?')) {
      deleteOffer(offerId);
    }
  };

  const handleSaveOffer = (offerData: any) => {
    if (editingOffer) {
      // Update existing offer
      updateOffer({
        id: editingOffer.id,
        name: offerData.name,
        description: offerData.description,
        original_price: offerData.original_price,
        sale_price: offerData.sale_price,
        discount_percentage: offerData.discount_percentage,
        benefits: offerData.benefits,
        is_active: offerData.is_active,
        is_limited: offerData.is_limited,
        max_redemptions: offerData.max_redemptions,
        expires_at: offerData.expires_at
      });
    } else {
      // Create new offer
      createOffer({
        name: offerData.name,
        description: offerData.description,
        original_price: offerData.original_price,
        sale_price: offerData.sale_price,
        discount_percentage: offerData.discount_percentage,
        benefits: offerData.benefits,
        is_active: offerData.is_active,
        is_limited: offerData.is_limited,
        max_redemptions: offerData.max_redemptions,
        expires_at: offerData.expires_at
      });
    }
    setIsEditorOpen(false);
  };

  const getOfferStatus = (offer: any) => {
    if (offer.is_limited) {
      return <Badge className="bg-red-500 text-white">Limitada</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Ativa</Badge>;
  };

  const parseTimeLeft = (timeLeft: string) => {
    if (!timeLeft || timeLeft === 'Expirado') return 0;
    
    const parts = timeLeft.split(' ');
    let totalMinutes = 0;
    
    parts.forEach(part => {
      if (part.includes('d')) {
        totalMinutes += parseInt(part.replace('d', '')) * 24 * 60;
      } else if (part.includes('h')) {
        totalMinutes += parseInt(part.replace('h', '')) * 60;
      } else if (part.includes('m')) {
        totalMinutes += parseInt(part.replace('m', ''));
      }
    });
    
    return totalMinutes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ofertas Especiais</h2>
          <p className="text-gray-600">Gerencie promoções e ofertas limitadas</p>
        </div>
        <Button 
          onClick={handleCreateOffer}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Oferta
        </Button>
      </div>

      {/* Métricas das Ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {specialOffers.length}
                </div>
                <div className="text-sm text-gray-600">Ofertas Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {specialOffers.length > 0 ? Math.round(specialOffers.reduce((acc, o) => acc + o.discount_percentage, 0) / specialOffers.length) : 0}%
                </div>
                <div className="text-sm text-gray-600">Desconto Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {specialOffers.filter(o => o.is_limited).length}
                </div>
                <div className="text-sm text-gray-600">Limitadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ofertas */}
      {isLoadingOffers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialOffers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-lg transition-shadow border-2 hover:border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                </div>
                {getOfferStatus(offer)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{offer.description}</p>
              
              {/* Preços */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 line-through">
                  {offer.original_price} RC
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {offer.sale_price} RC
                </div>
                <Badge className="bg-orange-500 text-white">
                  -{offer.discount_percentage}%
                </Badge>
              </div>

              {/* Tempo Restante */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-600">
                  Resta: {offer.timeLeft || 'Sem expiração'}
                </span>
              </div>

              {/* Benefícios */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Benefícios:</h4>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>{offer.benefits.elimination_aids} Eliminações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{offer.benefits.skip_aids} Pular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{offer.benefits.ai_tutor_credits} Tutor IA</span>
                  </div>
                  {offer.benefits.bonus_points_multiplier && offer.benefits.bonus_points_multiplier > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>{offer.benefits.bonus_points_multiplier}x Pontos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações da Oferta */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tempo restante:</span>
                  <span className="font-medium">{parseTimeLeft(offer.timeLeft || '')} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto máximo:</span>
                  <span className="font-medium">{offer.discount_percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Economia:</span>
                  <span className="font-medium text-green-600">
                    {offer.original_price - offer.sale_price} RC
                  </span>
                </div>
                {offer.is_limited && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Resgates:</span>
                    <span className="font-medium">
                      {offer.current_redemptions || 0} / {offer.max_redemptions || 0}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedOffer(offer)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditOffer(offer)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteOffer(offer.id)}
                  disabled={isMutating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Criar Nova Oferta - só mostrar se não há ofertas */}
      {!isLoadingOffers && specialOffers.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Criar Nova Oferta</h3>
                <p className="text-gray-600">Configure uma nova promoção especial</p>
              </div>
              <Button 
                onClick={handleCreateOffer}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Flame className="h-4 w-4 mr-2" />
                Criar Oferta Especial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor de Oferta */}
      <OfferEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        offer={editingOffer}
        onSave={handleSaveOffer}
        isLoading={isMutating}
      />
    </div>
  );
}
