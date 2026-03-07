import { supabase } from "@/integrations/supabase/client";

export const fetchMenuItemsSafe = () => {
  return supabase
    .from("menu_items")
    .select(
      `
      id,
      name,
      description,
      price,
      old_price,
      image,
      category,
      visible,
      sort_order,
      featured,
      highlight_level,
      image_position_y,
      image_zoom
    `,
    )
    .eq("visible", true)
    .order("sort_order", { ascending: true });
};
