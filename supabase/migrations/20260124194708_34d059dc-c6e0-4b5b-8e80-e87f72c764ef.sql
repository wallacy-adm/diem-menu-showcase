-- Add highlight_level column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS highlight_level text NOT NULL DEFAULT 'Leve' 
CHECK (highlight_level IN ('Leve', 'Destaque', 'Super Destaque'));