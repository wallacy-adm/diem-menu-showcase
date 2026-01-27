-- Add highlight_enabled boolean column to menu_items
ALTER TABLE public.menu_items 
ADD COLUMN highlight_enabled boolean NOT NULL DEFAULT false;

-- Set all existing products to highlight_enabled = false (safe migration)
UPDATE public.menu_items SET highlight_enabled = false WHERE highlight_enabled IS NULL;