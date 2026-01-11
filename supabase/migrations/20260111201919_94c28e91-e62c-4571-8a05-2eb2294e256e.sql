-- Add highlight_level column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN highlight_level text NOT NULL DEFAULT 'Leve' 
CHECK (highlight_level IN ('Leve', 'Destaque', 'Super Destaque'));

-- Add highlight_level column to promotions table
ALTER TABLE public.promotions 
ADD COLUMN highlight_level text NOT NULL DEFAULT 'Leve' 
CHECK (highlight_level IN ('Leve', 'Destaque', 'Super Destaque'));