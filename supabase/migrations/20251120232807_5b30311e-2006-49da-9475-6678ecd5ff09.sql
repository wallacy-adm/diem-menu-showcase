-- Drop existing restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can delete menu items" ON menu_items;

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

DROP POLICY IF EXISTS "Admins can insert settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- Create new policies that allow authenticated users to manage data
-- This allows any logged-in user to manage the admin panel

-- Menu items policies
CREATE POLICY "Authenticated users can insert menu items"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
ON menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu items"
ON menu_items FOR DELETE
TO authenticated
USING (true);

-- Categories policies
CREATE POLICY "Authenticated users can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
ON categories FOR DELETE
TO authenticated
USING (true);

-- Settings policies
CREATE POLICY "Authenticated users can insert settings"
ON settings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
ON settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);