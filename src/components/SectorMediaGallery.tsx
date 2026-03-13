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
        .select(`*, media:media_id (*)`)
        .eq('sector_id', sectorId)
        .order('display_order');
      if (error) throw error;
      return data;
    },
    enabled: !!sectorId,
  });

  if (isLoading || !sectorMedia || sectorMedia.length === 0) return null;

  return (
    <section className="py-20" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Nos Réalisations Professionnelles
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez quelques-unes de nos réalisations récentes
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {sectorMedia.map((item) => {
            const media = item.media as any;
            const mediaUrl = getPublicMediaUrl(media.file_path);
            const isMediumImage = isImage(media.mime_type);
            const isMediumVideo = isVideo(media.mime_type);

            return (
              <div
                key={item.id}
                className="break-inside-avoid overflow-hidden rounded-2xl cursor-pointer"
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {isMediumImage && (
                  <img
                    src={mediaUrl}
                    alt={item.title || media.alt_text || ''}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                )}
                {isMediumVideo && (
                  <video
                    src={mediaUrl}
                    className="w-full h-auto block"
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