-- Add image_zoom column (default 1.0, representing 100% / no zoom)
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS image_zoom numeric DEFAULT 1.0;

-- Update existing image_position_y values from pixel-based (-50 to +50) to percentage-based (0 to 100)
-- Formula: new_value = old_value + 50 (converting -50..+50 to 0..100)
-- Only update values that look like they're in the old pixel range
UPDATE public.menu_items 
SET image_position_y = GREATEST(0, LEAST(100, COALESCE(image_position_y, 0) + 50))
WHERE image_position_y IS NULL OR (image_position_y >= -50 AND image_position_y <= 50);

-- Set default for image_position_y to 50 (center) for new products
ALTER TABLE public.menu_items 
ALTER COLUMN image_position_y SET DEFAULT 50;