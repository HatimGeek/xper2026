-- Create media_pairs table for before/after functionality
CREATE TABLE public.media_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  before_media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  after_media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  status content_status NOT NULL DEFAULT 'draft',
  client_consent BOOLEAN NOT NULL DEFAULT false,
  service_id UUID REFERENCES public.services(id),
  sector_id UUID REFERENCES public.sectors(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on media_pairs table
ALTER TABLE public.media_pairs ENABLE ROW LEVEL SECURITY;

-- RLS policies for media_pairs  
CREATE POLICY "Anyone can view approved media pairs" ON public.media_pairs
FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all media pairs" ON public.media_pairs
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage media pairs" ON public.media_pairs
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor')
);

CREATE POLICY "Moderators can approve media pairs" ON public.media_pairs
FOR UPDATE USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
);

-- Add trigger for updated_at column
CREATE TRIGGER update_media_pairs_updated_at
  BEFORE UPDATE ON public.media_pairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing RLS policies to use JWT role instead of profiles table
DROP POLICY IF EXISTS "Authenticated users can view published content" ON public.sectors;
DROP POLICY IF EXISTS "Editors can manage sectors" ON public.sectors;

CREATE POLICY "Anyone can view active sectors" ON public.sectors
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all sectors" ON public.sectors
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage sectors" ON public.sectors
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor')
);

-- Update services RLS policies
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
DROP POLICY IF EXISTS "Editors can manage services" ON public.services;

CREATE POLICY "Anyone can view published services" ON public.services
FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all services" ON public.services
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage services" ON public.services
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor')
);

-- Update reviews RLS policies
DROP POLICY IF EXISTS "Moderators can manage reviews" ON public.reviews;

CREATE POLICY "Moderators can manage reviews" ON public.reviews
FOR UPDATE USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
);

-- Update media RLS policies
DROP POLICY IF EXISTS "Moderators can manage media" ON public.media;

CREATE POLICY "Editors can manage media" ON public.media
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
);

-- Update contact_requests RLS policies
DROP POLICY IF EXISTS "Staff can update contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Staff can view contact requests" ON public.contact_requests;

CREATE POLICY "Staff can view contact requests" ON public.contact_requests
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update contact requests" ON public.contact_requests
FOR UPDATE USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
);

-- Update before_after RLS policies
DROP POLICY IF EXISTS "Editors can manage before/after" ON public.before_after;

CREATE POLICY "Editors can manage before/after" ON public.before_after
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
);

-- Update pages RLS policies to use JWT
DROP POLICY IF EXISTS "Anyone can view published pages" ON public.pages;
DROP POLICY IF EXISTS "Editors can manage pages" ON public.pages;

CREATE POLICY "Anyone can view published pages" ON public.pages
FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all pages" ON public.pages
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage pages" ON public.pages
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'editor')
);