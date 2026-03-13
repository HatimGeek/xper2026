-- Enable realtime for all tables
ALTER TABLE public.sectors REPLICA IDENTITY FULL;
ALTER TABLE public.services REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.media REPLICA IDENTITY FULL;
ALTER TABLE public.contact_requests REPLICA IDENTITY FULL;
ALTER TABLE public.pages REPLICA IDENTITY FULL;
ALTER TABLE public.media_pairs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sectors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_pairs;