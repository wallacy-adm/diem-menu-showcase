-- Add image_position_y column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN image_position_y integer DEFAULT 0;