import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  product_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionWithProduct extends Promotion {
  product_name: string;
  product_price: number;
  discounted_price: number;
}

export function useAdminPromotions() {
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select(`
          *,
          menu_items (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((promo: any) => ({
        ...promo,
        product_name: promo.menu_items?.name || '',
        product_price: promo.menu_items?.price || 0,
        discounted_price: promo.menu_items?.price 
          ? promo.menu_items.price * (1 - promo.discount_percentage / 100)
          : 0,
      })) as PromotionWithProduct[];
    },
  });

  const createPromotion = useMutation({
    mutationFn: async (newPromotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(newPromotion)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });

  const updatePromotion = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });

  return {
    promotions,
    isLoading,
    createPromotion: createPromotion.mutateAsync,
    updatePromotion: updatePromotion.mutateAsync,
    deletePromotion: deletePromotion.mutateAsync,
  };
}
