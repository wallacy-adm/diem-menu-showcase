-- Add logo_url and bg_url columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS bg_url TEXT;