import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductFormData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
  };
  is_popular: boolean;
  discount_percentage: number;
  is_active: boolean;
  sort_order?: number;
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from("radcoin_products")
        .insert({
          name: productData.name,
          description: productData.description,
          category: productData.category || 'help_package',
          price: productData.price,
          benefits: productData.benefits,
          is_popular: productData.is_popular,
          discount_percentage: productData.discount_percentage,
          is_active: productData.is_active,
          sort_order: productData.sort_order || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: ProductFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("radcoin_products")
        .update({
          name: productData.name,
          description: productData.description,
          category: productData.category || 'help_package',
          price: productData.price,
          benefits: productData.benefits,
          is_popular: productData.is_popular,
          discount_percentage: productData.discount_percentage,
          is_active: productData.is_active,
          sort_order: productData.sort_order || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("radcoin_products")
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radcoin-products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir produto: ${error.message}`);
    }
  });

  return {
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isLoading: createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending
  };
}