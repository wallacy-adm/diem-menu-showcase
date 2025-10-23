-- Add visibility control to menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

-- Add visibility control to categories (we'll track which categories should be shown)
CREATE TABLE IF NOT EXISTS categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  emoji text NOT NULL DEFAULT '📋',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
ON categories
FOR SELECT
USING (true);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories with emojis
INSERT INTO categories (name, emoji, sort_order, visible) VALUES
  ('Promoção em Dobro', '🔥', 1, true),
  ('Promoção do Dia', '😍', 2, true),
  ('Campeões de Vendas', '🏆', 3, true),
  ('Indicação do Chef', '👨‍🍳', 4, true),
  ('Espumantes', '🍾', 5, true),
  ('Vinhos Nacionais', '🍷', 6, true),
  ('Vinhos Importados', '🍇', 7, true),
  ('Petiscos', '🍢', 8, true),
  ('Carnes', '🥩', 9, true),
  ('Frangos', '🍗', 10, true),
  ('Peixes', '🐟', 11, true),
  ('Massas', '🍝', 12, true),
  ('Porções Extras', '🍟', 13, true),
  ('Sanduíches', '🥪', 14, true),
  ('Sobremesas', '🍰', 15, true),
  ('Bebidas', '🥤', 16, true),
  ('Licores', '🍸', 17, true),
  ('Sucos', '🧃', 18, true),
  ('Whisky', '🥃', 19, true),
  ('Bomboniere', '🍬', 20, true),
  ('Perfumaria', '🌸', 21, true)
ON CONFLICT (name) DO NOTHING;