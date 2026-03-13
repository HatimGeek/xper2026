-- Create table for sector media gallery (regular photos/videos, not before/after)
CREATE TABLE IF NOT EXISTS public.sector_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  title text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.sector_media ENABLE ROW LEVEL SECURITY;

-- Public can view sector media
CREATE POLICY "p_sector_media_select_public"
  ON public.sector_media
  FOR SELECT
  USING (true);

-- Admin can manage sector media
CREATE POLICY "p_admin_write_sector_media"
  ON public.sector_media
  FOR ALL
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Create index for performance
CREATE INDEX idx_sector_media_sector_id ON public.sector_media(sector_id);
CREATE INDEX idx_sector_media_display_order ON public.sector_media(display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_sector_media_updated_at
  BEFORE UPDATE ON public.sector_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.sector_media IS 'Regular media gallery for sectors (not before/after pairs)';
COMMENT ON COLUMN public.sector_media.sector_id IS 'Reference to the sector this media belongs to';
COMMENT ON COLUMN public.sector_media.media_id IS 'Reference to the media file (image or video)';