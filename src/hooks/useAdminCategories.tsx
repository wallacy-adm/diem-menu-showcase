import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  visible: boolean;
  sort_order: number;
  emoji: string;
}

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxSortOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          name, 
          visible: true, 
          sort_order: maxSortOrder + 1,
          emoji: '📋'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const toggleVisibleMutation = useMutation({
    mutationFn: async (id: string) => {
      const category = categories.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      
      const { error } = await supabase
        .from('categories')
        .update({ visible: !category.visible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  return {
    categories,
    isLoading,
    addCategory: addCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    toggleVisible: toggleVisibleMutation.mutateAsync,
  };
}
