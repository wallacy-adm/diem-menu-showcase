-- =============================================
-- SECURITY FIX: Protect guest order data
-- =============================================

-- 1. Add guest_token column for secure guest order tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_token uuid DEFAULT gen_random_uuid();

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_token ON public.orders(guest_token);

-- 2. Drop the insecure SELECT policy
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- 3. Create secure SELECT policies

-- Authenticated users can only view their own orders
CREATE POLICY "Authenticated users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Guest orders can be viewed with the correct token (via RPC or edge function)
-- Direct table access for guests is blocked

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Add admin policies for UPDATE/DELETE
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));