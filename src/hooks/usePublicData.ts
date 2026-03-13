import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription, QUERY_KEYS } from './useSupabaseQuery';

// Public sectors (only active ones)
export const usePublicSectors = () => {
  const query = useQuery({
    queryKey: ['public-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('sectors', ['public-sectors']);
  
  return query;
};

// Public services (only published ones)
export const usePublicServices = (sectorId?: string) => {
  const query = useQuery({
    queryKey: ['public-services', sectorId],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          sectors:sector_id (name, slug)
        `)
        .eq('status', 'published')
        .order('display_order');

      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('services', ['public-services', sectorId]);
  
  return query;
};

// Public reviews (only approved ones)
export const usePublicReviews = (serviceId?: string, sectorId?: string) => {
  const query = useQuery({
    queryKey: ['public-reviews', serviceId, sectorId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          sectors:sector_id (name),
          services:service_id (title)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('reviews', ['public-reviews', serviceId, sectorId]);
  
  return query;
};

// Public media pairs (only published ones)
export const usePublicMediaPairs = (serviceId?: string, sectorId?: string) => {
  const query = useQuery({
    queryKey: ['public-media-pairs', serviceId, sectorId],
    queryFn: async () => {
      let query = supabase
        .from('media_pairs')
        .select(`
          *,
          before:media!media_pairs_before_media_id_fkey(*),
          after:media!media_pairs_after_media_id_fkey(*),
          sectors:sector_id (name),
          services:service_id (title)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('media_pairs', ['public-media-pairs', serviceId, sectorId]);
  
  return query;
};

// Public pages (only published ones)  
export const usePublicPages = () => {
  const query = useQuery({
    queryKey: ['public-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('status', 'published')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('pages', ['public-pages']);
  
  return query;
};

// Get public page by slug
export const usePublicPage = (slug: string) => {
  const query = useQuery({
    queryKey: ['public-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Subscribe to realtime changes
  useRealtimeSubscription('pages', ['public-page', slug]);
  
  return query;
};

// Submit contact request
export const useSubmitContact = () => {
  return {
    mutateAsync: async (contactData: any) => {
      const { data, error } = await supabase
        .from('contact_requests')
        .insert([contactData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  };
};

// Submit review
export const useSubmitReview = () => {
  return {
    mutateAsync: async (reviewData: any) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          status: 'pending' // Always start as pending for moderation
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  };
};