import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HighlightLevel = 'Desligado' | 'Leve' | 'Destaque' | 'Super Destaque';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  old_price?: number;
  image: string;
  visible: boolean;
  sort_order: number;
  featured: boolean;
  highlight_level: HighlightLevel;
  image_position_y: number;
  image_zoom: number;
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'sort_order'>) => {
      const maxSortOrder = products.reduce((max, p) => Math.max(max, p.sort_order), 0);
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ ...product, sort_order: maxSortOrder + 1 }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries(["menuItems"]);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries(["menuItems"]);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries(["menuItems"]);
    },
  });

  const toggleVisibleMutation = useMutation({
    mutationFn: async (id: string) => {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      
      const { error } = await supabase
        .from('menu_items')
        .update({ visible: !product.visible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries(["menuItems"]);
    },
  });

  const reorderProductsMutation = useMutation({
    mutationFn: async ({ productId1, sortOrder1, productId2, sortOrder2 }: { 
      productId1: string; 
      sortOrder1: number; 
      productId2: string; 
      sortOrder2: number; 
    }) => {
      // Swap sort_order values between two products
      const { error: error1 } = await supabase
        .from('menu_items')
        .update({ sort_order: sortOrder2 })
        .eq('id', productId1);
      
      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('menu_items')
        .update({ sort_order: sortOrder1 })
        .eq('id', productId2);
      
      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries(["menuItems"]);
    },
  });

  return {
    products,
    isLoading,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    toggleVisible: toggleVisibleMutation.mutateAsync,
    reorderProducts: reorderProductsMutation.mutateAsync,
  };
}
