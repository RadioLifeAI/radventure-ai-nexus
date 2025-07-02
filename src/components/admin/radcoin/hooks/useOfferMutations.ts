import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OfferFormData {
  id?: string;
  name: string;
  description?: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
    bonus_points_multiplier?: number;
  };
  is_active: boolean;
  is_limited: boolean;
  max_redemptions?: number;
  expires_at?: string;
}

export function useOfferMutations() {
  const queryClient = useQueryClient();

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (offerData: OfferFormData) => {
      const { data, error } = await supabase
        .from("radcoin_special_offers")
        .insert({
          name: offerData.name,
          description: offerData.description,
          original_price: offerData.original_price,
          sale_price: offerData.sale_price,
          discount_percentage: offerData.discount_percentage,
          benefits: offerData.benefits,
          is_active: offerData.is_active,
          is_limited: offerData.is_limited,
          max_redemptions: offerData.max_redemptions,
          expires_at: offerData.expires_at,
          starts_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-special-offers"] });
      toast.success("Oferta criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar oferta: ${error.message}`);
    }
  });

  // Update offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, ...offerData }: OfferFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("radcoin_special_offers")
        .update({
          name: offerData.name,
          description: offerData.description,
          original_price: offerData.original_price,
          sale_price: offerData.sale_price,
          discount_percentage: offerData.discount_percentage,
          benefits: offerData.benefits,
          is_active: offerData.is_active,
          is_limited: offerData.is_limited,
          max_redemptions: offerData.max_redemptions,
          expires_at: offerData.expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-special-offers"] });
      toast.success("Oferta atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar oferta: ${error.message}`);
    }
  });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from("radcoin_special_offers")
        .delete()
        .eq('id', offerId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-special-offers"] });
      toast.success("Oferta excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir oferta: ${error.message}`);
    }
  });

  return {
    createOffer: createOfferMutation.mutate,
    updateOffer: updateOfferMutation.mutate,
    deleteOffer: deleteOfferMutation.mutate,
    isCreating: createOfferMutation.isPending,
    isUpdating: updateOfferMutation.isPending,
    isDeleting: deleteOfferMutation.isPending,
    isLoading: createOfferMutation.isPending || updateOfferMutation.isPending || deleteOfferMutation.isPending
  };
}