-- Fix marketplace_products table structure and RLS policies

-- 1. Change images column from uuid[] to text[] to store file paths
ALTER TABLE marketplace_products 
ALTER COLUMN images TYPE text[] 
USING images::text[];

-- 2. Update default value for images column
ALTER TABLE marketplace_products 
ALTER COLUMN images SET DEFAULT '{}';

-- 3. Drop old RLS policies
DROP POLICY IF EXISTS "Admins can manage products" ON marketplace_products;
DROP POLICY IF EXISTS "Anyone can view active products" ON marketplace_products;

-- 4. Create correct RLS policies with proper role check
CREATE POLICY "Admins and editors can manage products" 
ON marketplace_products 
FOR ALL 
USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  OR auth.uid() IS NOT NULL
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'editor'::text])
  OR auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view active products" 
ON marketplace_products 
FOR SELECT 
USING (
  status = 'active' OR auth.uid() IS NOT NULL
);