-- Add visibility toggles and admin logo to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS show_logo boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_bg boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS admin_logo_url text;