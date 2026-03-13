import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPublicMediaUrl } from '@/lib/utils';

interface VideoSectionProps {
  videoId?: string;
  title?: string;
  description?: string;
  fallbackSrc?: string;
}

export const VideoSection = ({ 
  videoId, 
  title,
  description,
  fallbackSrc
}: VideoSectionProps) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(fallbackSrc || null);
  const [loading, setLoading] = useState(!!videoId);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    if (!videoId) return;
    
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      
      if (data && data.file_path) {
        setVideoSrc(getPublicMediaUrl(data.file_path));
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="aspect-video rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!videoSrc) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-5xl mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">{title}</h2>
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        <div className="aspect-video rounded-2xl overflow-hidden shadow-elegant">
          <video 
            className="w-full h-full object-cover" 
            controls 
            playsInline
            poster=""
          >
            <source src={videoSrc} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;