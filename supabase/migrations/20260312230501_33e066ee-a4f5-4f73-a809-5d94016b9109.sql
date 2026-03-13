
-- 1. Media table (must be created first as it's referenced by others)
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Sectors table
CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  hero_video_id UUID REFERENCES public.media(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  status TEXT NOT NULL DEFAULT 'draft',
  display_order INTEGER NOT NULL DEFAULT 0,
  price_range TEXT,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  message TEXT NOT NULL,
  rating INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users,
  service_id UUID REFERENCES public.services(id),
  sector_id UUID REFERENCES public.sectors(id),
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Contact requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  service_id UUID REFERENCES public.services(id),
  sector_id UUID REFERENCES public.sectors(id),
  assigned_to UUID REFERENCES auth.users,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Pages table
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  updated_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Media pairs (before/after)
CREATE TABLE public.media_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  before_media_id UUID NOT NULL REFERENCES public.media(id),
  after_media_id UUID NOT NULL REFERENCES public.media(id),
  status TEXT NOT NULL DEFAULT 'draft',
  client_consent BOOLEAN NOT NULL DEFAULT false,
  service_id UUID REFERENCES public.services(id),
  sector_id UUID REFERENCES public.sectors(id),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Sector media (gallery per sector)
CREATE TABLE public.sector_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Marketplace products
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Marketplace comments
CREATE TABLE public.marketplace_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies: Public read access for public-facing tables
-- Media: public read
CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert media" ON public.media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update media" ON public.media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete media" ON public.media FOR DELETE TO authenticated USING (true);

-- Sectors: public read
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sectors" ON public.sectors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Services: public read
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reviews: public read approved, anyone can insert (pending), authenticated can update
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Anyone can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (true);

-- Contact requests: anyone can insert, authenticated can view/update
CREATE POLICY "Anyone can submit contact requests" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view contacts" ON public.contact_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update contacts" ON public.contact_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Pages: public read published
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT USING (status = 'published' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Authenticated users can manage pages" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Media pairs: public read published
CREATE POLICY "Anyone can view published media pairs" ON public.media_pairs FOR SELECT USING (status = 'published' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Authenticated users can manage media pairs" ON public.media_pairs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sector media: public read
CREATE POLICY "Anyone can view sector media" ON public.sector_media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sector media" ON public.sector_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Marketplace products: public read active
CREATE POLICY "Anyone can view active products" ON public.marketplace_products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.marketplace_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Marketplace comments: public read, anyone can insert
CREATE POLICY "Anyone can view comments" ON public.marketplace_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.marketplace_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can manage comments" ON public.marketplace_comments FOR DELETE TO authenticated USING (true);

-- Clients: public read
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sectors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_pairs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
