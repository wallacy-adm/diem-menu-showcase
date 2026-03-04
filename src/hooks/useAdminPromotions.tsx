import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HighlightLevel = 'Desligado' | 'Leve' | 'Destaque' | 'Super Destaque';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  product_id: string;
  active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  highlight_level: HighlightLevel;
  sort_order: number;
}

export interface PromotionWithProduct extends Promotion {
  product_name: string;
  product_price: number;
  discounted_price: number;
  status: 'active' | 'scheduled' | 'ended';
}

export function getPromotionStatus(startDate: string, endDate: string, active: boolean): 'active' | 'scheduled' | 'ended' {
  if (!active) return 'ended';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'scheduled';
  if (now > end) return 'ended';
  return 'active';
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
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((promo: any) => {
        const status = getPromotionStatus(promo.start_date, promo.end_date, promo.active);
        return {
          ...promo,
          product_name: promo.menu_items?.name || '',
          product_price: promo.menu_items?.price || 0,
          discounted_price: promo.menu_items?.price 
            ? promo.menu_items.price * (1 - promo.discount_percentage / 100)
            : 0,
          status,
        };
      }) as PromotionWithProduct[];
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
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      queryClient.invalidateQueries(["menuItems"]);
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
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      queryClient.invalidateQueries(["menuItems"]);
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
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      queryClient.invalidateQueries(["menuItems"]);
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
