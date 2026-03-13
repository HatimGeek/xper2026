-- Create clients table for client logos
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Public can view active clients
CREATE POLICY "Public can view active clients"
ON public.clients
FOR SELECT
USING (is_active = true);

-- Admin can manage clients
CREATE POLICY "Admin can manage clients"
ON public.clients
FOR ALL
USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
)
WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
);

-- Add trigger for updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();