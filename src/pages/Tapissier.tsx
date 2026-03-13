import { Armchair, CheckCircle2, Palette, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VideoSection } from "@/components/VideoSection";
import { SectorMediaGallery } from "@/components/SectorMediaGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Tapissier = () => {
  const { data: sector } = useQuery({
    queryKey: ['sector-by-slug', 'tapissier'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', 'tapissier')
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Armchair className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Tapissier – Réparation & Habillage
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Expertise en tapisserie d'ameublement : réparation, habillage et création sur mesure pour redonner vie à vos meubles
          </p>
          <Button size="lg" asChild className="bg-gradient-leather">
            <Link to="/contact">Demander un devis gratuit</Link>
          </Button>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection 
        videoId={sector?.hero_video_id || undefined}
        title="Découvrez notre savoir-faire"
        description="Plongez dans l'univers de la tapisserie d'ameublement avec Xpercuir Pro"
      />

      {/* Sector Media Gallery */}
      {sector?.id && <SectorMediaGallery sectorId={sector.id} />}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Un projet de tapisserie ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous pour un devis personnalisé et gratuit. Notre équipe est à votre écoute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">Demander un devis</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/30" asChild>
              <Link to="/avis-clients">Voir les avis clients</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tapissier;
