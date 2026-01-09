import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivePromotion {
  id: string;
  product_id: string;
  discount_percentage: number;
  name: string;
  discounted_price: number;
  original_price: number;
  end_date: string;
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ['active-promotions'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('promotions')
        .select(`
          id,
          product_id,
          discount_percentage,
          name,
          end_date,
          menu_items (
            price
          )
        `)
        .eq('active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) throw error;

      // Create a map of product_id to promotion data
      const promotionsMap = new Map<string, ActivePromotion>();
      
      (data || []).forEach((promo: any) => {
        const originalPrice = promo.menu_items?.price || 0;
        const discountedPrice = originalPrice * (1 - promo.discount_percentage / 100);
        
        promotionsMap.set(promo.product_id, {
          id: promo.id,
          product_id: promo.product_id,
          discount_percentage: promo.discount_percentage,
          name: promo.name,
          discounted_price: discountedPrice,
          original_price: originalPrice,
          end_date: promo.end_date,
        });
      });

      return promotionsMap;
    },
    refetchInterval: 30000, // Refetch every 30 seconds to update status
  });
}
