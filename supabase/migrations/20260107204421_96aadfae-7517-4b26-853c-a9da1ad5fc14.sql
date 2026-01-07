-- Add highlight column to categories table
ALTER TABLE public.categories 
ADD COLUMN highlight boolean NOT NULL DEFAULT false;