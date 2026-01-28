-- =============================================
-- SECURITY FIX: Add validation to order INSERT policies
-- =============================================

-- 1. Create validation function for order items
CREATE OR REPLACE FUNCTION public.validate_order_item(
  _menu_item_id uuid,
  _unit_price numeric,
  _quantity integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.menu_items
    WHERE id = _menu_item_id
      AND visible = true
      AND price = _unit_price
  )
  AND _quantity > 0
  AND _quantity <= 100  -- Reasonable limit
$$;

-- 2. Create validation function for orders
CREATE OR REPLACE FUNCTION public.validate_order(
  _total numeric,
  _guest_name text,
  _guest_phone text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _total > 0 
    AND _total <= 999999
    AND (
      _guest_name IS NULL 
      OR (length(trim(_guest_name)) >= 2 AND length(_guest_name) <= 100)
    )
    AND (
      _guest_phone IS NULL 
      OR (length(trim(_guest_phone)) >= 8 AND length(_guest_phone) <= 20)
    )
$$;

-- 3. Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- 4. Create validated INSERT policies

-- Orders: validate total and guest info
CREATE POLICY "Validated order creation"
  ON public.orders FOR INSERT
  WITH CHECK (
    validate_order(total, guest_name, guest_phone)
  );

-- Order items: validate menu_item exists, price matches, quantity is valid
CREATE POLICY "Validated order item creation"
  ON public.order_items FOR INSERT
  WITH CHECK (
    validate_order_item(menu_item_id, unit_price, quantity)
  );