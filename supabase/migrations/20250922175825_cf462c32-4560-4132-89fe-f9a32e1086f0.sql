-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'moderator');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'editor',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sectors table
CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price_range TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status content_status DEFAULT 'draft',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media library table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create before/after table
CREATE TABLE public.before_after (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  before_image_id UUID NOT NULL REFERENCES public.media(id),
  after_image_id UUID NOT NULL REFERENCES public.media(id),
  client_consent BOOLEAN DEFAULT false,
  status content_status DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  photos UUID[] DEFAULT '{}',
  status review_status DEFAULT 'pending',
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table for content management
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  status content_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_id UUID REFERENCES public.services(id),
  sector_id UUID REFERENCES public.sectors(id),
  message TEXT NOT NULL,
  attachments UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.before_after ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$$;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view published content"
  ON public.sectors FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage sectors"
  ON public.sectors FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Authenticated users can view services"
  ON public.services FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage services"
  ON public.services FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Authenticated users can view media"
  ON public.media FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Moderators can manage media"
  ON public.media FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('admin', 'moderator', 'editor'));

CREATE POLICY "Anyone can view published before/after"
  ON public.before_after FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage before/after"
  ON public.before_after FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor', 'moderator'));

CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Moderators can manage reviews"
  ON public.reviews FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('admin', 'moderator'));

CREATE POLICY "Anyone can view published pages"
  ON public.pages FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors can manage pages"
  ON public.pages FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can log activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view contact requests"
  ON public.contact_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update contact requests"
  ON public.contact_requests FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor', 'moderator'));

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_before_after_updated_at
  BEFORE UPDATE ON public.before_after
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sectors
INSERT INTO public.sectors (name, slug, description, display_order) VALUES
('Automobile', 'automobile', 'Réparation et restauration de cuir automobile', 1),
('Meubles', 'meubles', 'Restauration de meubles en cuir', 2),
('Commercial', 'commercial', 'Services pour entreprises et commerces', 3),
('Aviation', 'aviation', 'Réparation de cuir pour aviation', 4),
('Santé', 'sante', 'Réparation de cuir pour le secteur médical', 5);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('company_name', '"Xpercuir Pro"', 'Nom de la société'),
('company_address', '"{\"street\": \"\", \"city\": \"\", \"postal_code\": \"\", \"country\": \"France\"}"', 'Adresse de la société'),
('contact_email', '"contact@xpercuir.pro"', 'Email de contact principal'),
('contact_phone', '""', 'Téléphone de contact'),
('social_links', '"{\"facebook\": \"\", \"instagram\": \"\", \"linkedin\": \"\", \"tiktok\": \"\", \"youtube\": \"\"}"', 'Liens réseaux sociaux'),
('business_hours', '"{\"monday\": \"9:00-18:00\", \"tuesday\": \"9:00-18:00\", \"wednesday\": \"9:00-18:00\", \"thursday\": \"9:00-18:00\", \"friday\": \"9:00-18:00\", \"saturday\": \"Fermé\", \"sunday\": \"Fermé\"}"', 'Horaires ouverture'),
('notification_emails', '"[]"', 'Emails pour les notifications'),
('google_analytics_id', '""', 'ID Google Analytics'),
('google_maps_api_key', '""', 'Clé API Google Maps');

-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public) VALUES 
('media', 'media', true),
('documents', 'documents', false);

-- Storage policies for media bucket
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Moderators can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND public.get_user_role(auth.uid()) IN ('admin', 'moderator'));

-- Storage policies for documents bucket
CREATE POLICY "Staff can access documents"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);