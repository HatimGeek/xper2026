-- Fix media_pairs foreign keys and RLS policies

-- Drop existing foreign keys if they exist
ALTER TABLE public.media_pairs DROP CONSTRAINT IF EXISTS media_pairs_before_media_id_fkey;
ALTER TABLE public.media_pairs DROP CONSTRAINT IF EXISTS media_pairs_after_media_id_fkey;

-- Recreate proper foreign keys with ON DELETE CASCADE
ALTER TABLE public.media_pairs 
ADD CONSTRAINT media_pairs_before_media_id_fkey 
FOREIGN KEY (before_media_id) REFERENCES public.media(id) ON DELETE CASCADE;

ALTER TABLE public.media_pairs 
ADD CONSTRAINT media_pairs_after_media_id_fkey 
FOREIGN KEY (after_media_id) REFERENCES public.media(id) ON DELETE CASCADE;

-- Update RLS policies for media_pairs
DROP POLICY IF EXISTS "Anyone can view approved media pairs" ON public.media_pairs;
DROP POLICY IF EXISTS "Anyone can view published media pairs" ON public.media_pairs;
DROP POLICY IF EXISTS "Authenticated users can view all media pairs" ON public.media_pairs;
DROP POLICY IF EXISTS "Editors can manage media pairs" ON public.media_pairs;
DROP POLICY IF EXISTS "Moderators can approve media pairs" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_del_admin" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_delete_admin" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_ins_admin" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_insert_admin" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_select_public" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_upd_admin" ON public.media_pairs;
DROP POLICY IF EXISTS "p_media_pairs_update_admin" ON public.media_pairs;

-- Create clean RLS policies
CREATE POLICY "Public can view published media pairs" 
ON public.media_pairs 
FOR SELECT 
USING (status = 'published'::content_status);

CREATE POLICY "Admin can insert media pairs" 
ON public.media_pairs 
FOR INSERT 
WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admin can update media pairs" 
ON public.media_pairs 
FOR UPDATE 
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admin can delete media pairs" 
ON public.media_pairs 
FOR DELETE 
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);