import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePublicMediaPairs, usePublicSectors } from "@/hooks/usePublicData";
import { getPublicMediaUrl, isImage, isVideo } from "@/lib/utils";

interface BeforeAfterGalleryProps {
  sectorSlugs?: string[]; // candidates like ["automobile", "auto"]
  sectorId?: string;
  title?: string;
  description?: string;
  limit?: number;
}

const normalize = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export const BeforeAfterGallery = ({
  sectorSlugs = [],
  sectorId,
  title = "Galerie Avant/Après",
  description = "Découvrez toutes nos réalisations",
  limit,
}: BeforeAfterGalleryProps) => {
  const { data: sectors } = usePublicSectors();

  const resolvedSectorId = sectorId || (() => {
    if (!sectors || sectorSlugs.length === 0) return undefined;
    const candidates = sectorSlugs.map(normalize);
    const match = sectors.find((s) => {
      const slug = normalize((s as any).slug);
      const name = normalize((s as any).name);
      return candidates.some((c) => slug === c || name.includes(c));
    });
    return match?.id;
  })();

  const { data: mediaPairs, isLoading } = usePublicMediaPairs(undefined, resolvedSectorId);

  // Ne pas afficher la section s'il n'y a pas de photos
  if (isLoading) return null;
  if (!mediaPairs || mediaPairs.length === 0) return null;

  const renderMedia = (m?: { file_path?: string; mime_type?: string | null } | null) => {
    if (!m || !m.file_path) return null;
    const src = getPublicMediaUrl(m.file_path);
    if (isVideo(m.mime_type)) {
      return (
        <video className="w-full h-full object-contain" src={src} controls playsInline />
      );
    }
    // default image
    return (
      <img src={src} alt="Avant/Après" className="w-full h-full object-contain" />
    );
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-6">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(limit ? mediaPairs.slice(0, limit) : mediaPairs).map((pair: any) => (
            <Card key={pair.id} className="overflow-hidden hover:shadow-leather transition-all duration-300 hover:-translate-y-1">
               <div className="grid grid-cols-2 gap-4 p-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Avant</Badge>
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
                    {renderMedia(pair.before) || (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pas de photo
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className="w-full justify-center bg-accent text-accent-foreground">Après</Badge>
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
                    {renderMedia(pair.after) || (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pas de photo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterGallery;
