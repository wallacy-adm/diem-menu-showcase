import { supabase } from "@/integrations/supabase/client";

// ⚠️ NUNCA incluir campo "image" aqui.
// Isso causa payload massivo e degrada performance.
export const fetchMenuItemsSafe = () => {
  return supabase.from("menu_items").select(`
      id,
      name,
      description,
      price,
      old_price,
      category,
      visible,
      sort_order,
      featured,
      highlight_level,
      image_position_y,
      image_zoom
    `)
    .eq("visible", true)
    .order("sort_order", { ascending: true });
};
