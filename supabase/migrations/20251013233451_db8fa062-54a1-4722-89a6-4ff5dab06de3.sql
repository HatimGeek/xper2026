-- Create marketplace products table
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
  images UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace comments table
CREATE TABLE public.marketplace_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_comments ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_products
CREATE POLICY "Anyone can view active products"
  ON public.marketplace_products
  FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage products"
  ON public.marketplace_products
  FOR ALL
  USING ((auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'editor']))
  WITH CHECK ((auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'editor']));

-- Policies for marketplace_comments
CREATE POLICY "Anyone can view comments"
  ON public.marketplace_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.marketplace_comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete comments"
  ON public.marketplace_comments
  FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();