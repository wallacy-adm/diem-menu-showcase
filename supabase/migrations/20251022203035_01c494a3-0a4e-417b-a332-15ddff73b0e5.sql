-- Create Settings table (singleton)
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL DEFAULT 'Carpe Diem Motel',
  tagline TEXT NOT NULL DEFAULT 'Aproveite o Momento!',
  address TEXT NOT NULL DEFAULT 'BR-104, Km 118, Lagoa Seca – PB',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/SEU_PERFIL',
  whatsapp_url TEXT NOT NULL DEFAULT 'https://wa.me/55XXXXXXXXXXX',
  theme_accent TEXT NOT NULL DEFAULT '#0db060',
  footer_note TEXT NOT NULL DEFAULT 'Imagens meramente ilustrativas. Produtos e preços sujeitos a alteração.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth needed)
CREATE POLICY "Allow public read access to settings"
  ON public.settings
  FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO public.settings (id, brand_name, tagline, address, instagram_url, whatsapp_url, theme_accent, footer_note)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Carpe Diem Motel',
  'Aproveite o Momento!',
  'BR-104, Km 118, Lagoa Seca – PB',
  'https://instagram.com/carpediemmotel',
  'https://wa.me/5583999999999',
  '#0db060',
  'Imagens meramente ilustrativas. Produtos e preços sujeitos a alteração.'
);

-- Create MenuItems table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  old_price NUMERIC(10, 2),
  image TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth needed)
CREATE POLICY "Allow public read access to menu items"
  ON public.menu_items
  FOR SELECT
  USING (true);

-- Create index for category filtering
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_featured ON public.menu_items(featured);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample menu items
INSERT INTO public.menu_items (category, name, description, price, old_price, image, featured, sort_order)
VALUES
  -- Promoção em Dobro
  ('Promoção em Dobro', 'Dupla de Cerveja Heineken', 'Duas latas de Heineken geladas', 25.00, 35.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', true, 1),
  ('Promoção em Dobro', 'Combo Espumante + Morangos', 'Espumante Chandon + Morangos com chocolate', 89.00, 120.00, 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400', true, 2),
  
  -- Promoção do Dia
  ('Promoção do Dia', 'Filé Mignon Especial', 'Filé mignon grelhado com molho madeira', 65.00, 85.00, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', true, 1),
  ('Promoção do Dia', 'Risoto de Camarão', 'Risoto cremoso com camarões frescos', 55.00, 75.00, 'https://images.unsplash.com/photo-1476124369491-c59e312f1d44?w=400', true, 2),
  
  -- Campeões de Vendas
  ('Campeões de Vendas', 'Fondue de Chocolate', 'Fondue de chocolate belga com frutas', 45.00, null, 'https://images.unsplash.com/photo-1588195538326-c5b1e5b80daf?w=400', true, 1),
  ('Campeões de Vendas', 'Picanha ao Molho', 'Picanha grelhada com molho especial', 78.00, null, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', true, 2),
  ('Campeões de Vendas', 'Salmão Grelhado', 'Salmão grelhado com legumes', 68.00, null, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', true, 3);