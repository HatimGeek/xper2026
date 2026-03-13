-- Add hero_video_id column to sectors table to store video for each sector
ALTER TABLE public.sectors 
ADD COLUMN IF NOT EXISTS hero_video_id uuid REFERENCES public.media(id) ON DELETE SET NULL;

-- Add hero_video_id column to pages table to store video for each page
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS hero_video_id uuid REFERENCES public.media(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.sectors.hero_video_id IS 'Reference to media table for hero video of the sector';
COMMENT ON COLUMN public.pages.hero_video_id IS 'Reference to media table for hero video of the page';