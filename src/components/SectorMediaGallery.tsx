import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPublicMediaUrl } from '@/lib/utils';
import { isImage, isVideo } from '@/lib/utils';

interface SectorMediaGalleryProps {
  sectorId?: string;
}

export const SectorMediaGallery = ({ sectorId }: SectorMediaGalleryProps) => {
  const { data: sectorMedia, isLoading } = useQuery({
    queryKey: ['sector-media', sectorId],
    queryFn: async () => {
      if (!sectorId) return [];
      
      const { data, error } = await supabase
        .from('sector_media')
        .select(`
          *,
          media:media_id (*)
        `)
        .eq('sector_id', sectorId)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!sectorId,
  });

  if (isLoading) {
    return null;
  }

  if (!sectorMedia || sectorMedia.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Nos Réalisations Professionnelles
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez quelques-unes de nos réalisations récentes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectorMedia.map((item) => {
            const media = item.media as any;
            const mediaUrl = getPublicMediaUrl(media.file_path);
            const isMediumImage = isImage(media.mime_type);
            const isMediumVideo = isVideo(media.mime_type);

            return (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl shadow-elegant">
                {isMediumImage && (
                  <img 
                    src={mediaUrl} 
                    alt={item.title || media.alt_text || ''} 
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                )}
                {isMediumVideo && (
                  <video 
                    src={mediaUrl} 
                    className="w-full h-64 object-cover"
                    controls
                    playsInline
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SectorMediaGallery;
