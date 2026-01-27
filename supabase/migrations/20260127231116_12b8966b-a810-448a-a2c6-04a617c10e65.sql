-- Add sort_order to promotions for ordering active promotions
ALTER TABLE public.promotions 
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.promotions.sort_order IS 'Order for displaying active promotions (lower numbers appear first)';