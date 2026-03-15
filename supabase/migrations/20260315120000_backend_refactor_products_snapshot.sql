-- Backend refactor: introduce normalized products model while preserving legacy frontend compatibility

-- 1) Categories alignment (active/order_index aliases)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS active boolean,
  ADD COLUMN IF NOT EXISTS order_index integer;

UPDATE public.categories
SET
  active = COALESCE(active, visible),
  order_index = COALESCE(order_index, sort_order)
WHERE active IS NULL OR order_index IS NULL;

ALTER TABLE public.categories
  ALTER COLUMN active SET DEFAULT true,
  ALTER COLUMN active SET NOT NULL,
  ALTER COLUMN order_index SET DEFAULT 0,
  ALTER COLUMN order_index SET NOT NULL;

-- Keep old/new columns synchronized
CREATE OR REPLACE FUNCTION public.sync_categories_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.visible := COALESCE(NEW.visible, NEW.active, true);
  NEW.active := COALESCE(NEW.active, NEW.visible, true);

  NEW.sort_order := COALESCE(NEW.sort_order, NEW.order_index, 0);
  NEW.order_index := COALESCE(NEW.order_index, NEW.sort_order, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_categories_columns ON public.categories;
CREATE TRIGGER tr_sync_categories_columns
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.sync_categories_columns();

CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (active);
CREATE INDEX IF NOT EXISTS idx_categories_order_index ON public.categories (order_index);

-- 2) Settings alignment (legacy and new aliases)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS slogan text,
  ADD COLUMN IF NOT EXISTS background_url text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS whatsapp text;

UPDATE public.settings
SET
  slogan = COALESCE(slogan, tagline),
  background_url = COALESCE(background_url, bg_url),
  instagram = COALESCE(instagram, instagram_url),
  whatsapp = COALESCE(whatsapp, whatsapp_url)
WHERE slogan IS NULL
   OR background_url IS NULL
   OR instagram IS NULL
   OR whatsapp IS NULL;

CREATE OR REPLACE FUNCTION public.sync_settings_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.tagline := COALESCE(NEW.tagline, NEW.slogan, '');
  NEW.slogan := COALESCE(NEW.slogan, NEW.tagline, '');

  NEW.bg_url := COALESCE(NEW.bg_url, NEW.background_url);
  NEW.background_url := COALESCE(NEW.background_url, NEW.bg_url);

  NEW.instagram_url := COALESCE(NEW.instagram_url, NEW.instagram, '');
  NEW.instagram := COALESCE(NEW.instagram, NEW.instagram_url, '');

  NEW.whatsapp_url := COALESCE(NEW.whatsapp_url, NEW.whatsapp, '');
  NEW.whatsapp := COALESCE(NEW.whatsapp, NEW.whatsapp_url, '');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_settings_columns ON public.settings;
CREATE TRIGGER tr_sync_settings_columns
BEFORE INSERT OR UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.sync_settings_columns();

-- 3) Create normalized products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  image_url text,
  image_thumb_url text,
  image_full_url text,
  active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (active);
CREATE INDEX IF NOT EXISTS idx_products_order_index ON public.products (order_index);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Allow public read access to products'
  ) THEN
    CREATE POLICY "Allow public read access to products"
    ON public.products FOR SELECT USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can manage products'
  ) THEN
    CREATE POLICY "Authenticated users can manage products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END$$;

-- 4) Backfill products from legacy menu_items without deleting legacy data
INSERT INTO public.products (
  id,
  category_id,
  name,
  description,
  price,
  old_price,
  image_url,
  image_thumb_url,
  image_full_url,
  active,
  order_index,
  created_at
)
SELECT
  mi.id,
  c.id,
  mi.name,
  mi.description,
  mi.price,
  mi.old_price,
  mi.image,
  NULL,
  mi.image,
  COALESCE(mi.visible, true),
  COALESCE(mi.sort_order, 0),
  mi.created_at
FROM public.menu_items mi
JOIN public.categories c ON c.name = mi.category
ON CONFLICT (id) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  image_url = EXCLUDED.image_url,
  image_full_url = EXCLUDED.image_full_url,
  active = EXCLUDED.active,
  order_index = EXCLUDED.order_index;

-- 5) Keep legacy menu_items and new products synchronized (menu_items is source of truth for current frontend)
CREATE OR REPLACE FUNCTION public.sync_menu_items_to_products()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id FROM public.categories WHERE name = NEW.category LIMIT 1;

  IF v_category_id IS NULL THEN
    INSERT INTO public.categories (name, emoji, visible, active, sort_order, order_index)
    VALUES (NEW.category, '📋', true, true, 0, 0)
    RETURNING id INTO v_category_id;
  END IF;

  INSERT INTO public.products (
    id, category_id, name, description, price, old_price, image_url, image_full_url, active, order_index, created_at
  )
  VALUES (
    NEW.id,
    v_category_id,
    NEW.name,
    NEW.description,
    NEW.price,
    NEW.old_price,
    NEW.image,
    NEW.image,
    COALESCE(NEW.visible, true),
    COALESCE(NEW.sort_order, 0),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    old_price = EXCLUDED.old_price,
    image_url = EXCLUDED.image_url,
    image_full_url = EXCLUDED.image_full_url,
    active = EXCLUDED.active,
    order_index = EXCLUDED.order_index;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_menu_items_to_products ON public.menu_items;
CREATE TRIGGER tr_sync_menu_items_to_products
AFTER INSERT OR UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.sync_menu_items_to_products();

CREATE OR REPLACE FUNCTION public.delete_products_from_menu_items()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.products WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_delete_products_from_menu_items ON public.menu_items;
CREATE TRIGGER tr_delete_products_from_menu_items
AFTER DELETE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.delete_products_from_menu_items();

-- 6) Promotions alignment + indexes
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS discount_percent numeric,
  ADD COLUMN IF NOT EXISTS start_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS end_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS enabled boolean;

UPDATE public.promotions
SET
  discount_percent = COALESCE(discount_percent, discount_percentage),
  start_at = COALESCE(start_at, start_date),
  end_at = COALESCE(end_at, end_date),
  enabled = COALESCE(enabled, active)
WHERE discount_percent IS NULL
   OR start_at IS NULL
   OR end_at IS NULL
   OR enabled IS NULL;

ALTER TABLE public.promotions
  ALTER COLUMN discount_percent SET DEFAULT 0,
  ALTER COLUMN start_at SET DEFAULT now(),
  ALTER COLUMN end_at SET DEFAULT (now() + interval '7 days'),
  ALTER COLUMN enabled SET DEFAULT true;

CREATE OR REPLACE FUNCTION public.sync_promotions_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.discount_percentage := COALESCE(NEW.discount_percentage, NEW.discount_percent, 0);
  NEW.discount_percent := COALESCE(NEW.discount_percent, NEW.discount_percentage, 0);

  NEW.start_date := COALESCE(NEW.start_date, NEW.start_at, now());
  NEW.start_at := COALESCE(NEW.start_at, NEW.start_date, now());

  NEW.end_date := COALESCE(NEW.end_date, NEW.end_at, now() + interval '7 days');
  NEW.end_at := COALESCE(NEW.end_at, NEW.end_date, now() + interval '7 days');

  NEW.active := COALESCE(NEW.active, NEW.enabled, true);
  NEW.enabled := COALESCE(NEW.enabled, NEW.active, true);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_promotions_columns ON public.promotions;
CREATE TRIGGER tr_sync_promotions_columns
BEFORE INSERT OR UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.sync_promotions_columns();

CREATE INDEX IF NOT EXISTS idx_promotions_product_id ON public.promotions (product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_enabled ON public.promotions (enabled);

-- 7) Storage: dedicated bucket for product images
INSERT INTO storage.buckets (id, name, public)
SELECT 'product-images', 'product-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can read product images'
  ) THEN
    CREATE POLICY "Public can read product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can upload product images'
  ) THEN
    CREATE POLICY "Authenticated can upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can update product images'
  ) THEN
    CREATE POLICY "Authenticated can update product images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END$$;
