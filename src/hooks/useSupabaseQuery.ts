import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Query keys
export const QUERY_KEYS = {
  sectors: ['sectors'],
  services: ['services'],
  reviews: ['reviews'],
  media: ['media'],
  contacts: ['contacts'],
  beforeAfter: ['before-after'],
  mediaPairs: ['media-pairs'],
  pages: ['pages'],
  clients: ['clients'],
} as const;

// Sectors hooks
export const useSectors = () => {
  return useQuery({
    queryKey: QUERY_KEYS.sectors,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sector: any) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sector])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sectors });
      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    },
  });
};

export const useUpdateSector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sectors });
      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    },
  });
};

export const useDeleteSector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sectors });
      queryClient.invalidateQueries({ queryKey: ['public-sectors'] });
    },
  });
};

// Services hooks
export const useServices = () => {
  return useQuery({
    queryKey: QUERY_KEYS.services,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          sectors:sector_id (name)
        `)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (service: any) => {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
    },
  });
};

// Reviews hooks
export const useReviews = () => {
  return useQuery({
    queryKey: QUERY_KEYS.reviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          sectors:sector_id (name),
          services:service_id (title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
    },
  });
};

// Media hooks
export const useMedia = () => {
  return useQuery({
    queryKey: QUERY_KEYS.media,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Contacts hooks
export const useContacts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.contacts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          sectors:sector_id (name),
          services:service_id (title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contact: any) => {
      const { data, error } = await supabase
        .from('contact_requests')
        .insert([contact])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('contact_requests')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
    },
  });
};

// Pages hooks
export const usePages = () => {
  return useQuery({
    queryKey: QUERY_KEYS.pages,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page: any) => {
      const { data, error } = await supabase
        .from('pages')
        .insert([page])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
      queryClient.invalidateQueries({ queryKey: ['public-pages'] });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
      queryClient.invalidateQueries({ queryKey: ['public-pages'] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
      queryClient.invalidateQueries({ queryKey: ['public-pages'] });
    },
  });
};

// Media pairs hooks
export const useMediaPairs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.mediaPairs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_pairs')
        .select(`
          *,
          before:media!media_pairs_before_media_id_fkey(*),
          after:media!media_pairs_after_media_id_fkey(*),
          sectors:sector_id (name),
          services:service_id (title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMediaPair = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mediaPair: any) => {
      const { data, error } = await supabase
        .from('media_pairs')
        .insert([mediaPair])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaPairs });
      queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });
    },
  });
};

export const useUpdateMediaPair = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('media_pairs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaPairs });
      queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });
    },
  });
};

export const useDeleteMediaPair = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('media_pairs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaPairs });
      queryClient.invalidateQueries({ queryKey: ['public-media-pairs'] });
    },
  });
};

// Realtime hook
export const useRealtimeSubscription = (table: string, queryKey: readonly unknown[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime change on ${table}:`, payload);
          // Invalidate and refetch the queries
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryKey, queryClient]);
};

// Clients hooks
export const useClients = () => {
  return useQuery({
    queryKey: QUERY_KEYS.clients,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAllClients = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.clients, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    },
  });
};
