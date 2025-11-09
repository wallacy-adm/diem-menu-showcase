import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Settings {
  id: string;
  brand_name: string;
  tagline: string;
  address: string;
  instagram_url: string;
  whatsapp_url: string;
  theme_accent: string;
  footer_note: string;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Settings | null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      if (!settings?.id) {
        // Create first settings record
        const { data, error } = await supabase
          .from('settings')
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Update existing settings
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
  };
}
