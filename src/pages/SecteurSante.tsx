import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import medicalChairImage from "@/assets/medical-chair.jpg";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { VideoSection } from "@/components/VideoSection";
import { SectorMediaGallery } from "@/components/SectorMediaGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SecteurSante = () => {
  const { data: sector } = useQuery({
    queryKey: ['sector-by-slug', 'sante'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', 'sante')
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4">🏥 Santé</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Secteur Santé
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Restauration de cuir médical selon normes sanitaires strictes. 
                Mobilier hospitalier et équipements médicaux.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold" asChild>
                  <Link to="/contact">
                    <Phone className="w-5 h-5 mr-2" />
                    Devis Gratuit
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary" asChild>
                  <a href="https://wa.me/212663183984" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={medicalChairImage} 
                alt="Restauration cuir médical"
                className="rounded-2xl shadow-leather w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sector Media Gallery */}
      {sector?.id && <SectorMediaGallery sectorId={sector.id} />}

      {/* Before/After Gallery */}
      {sector?.id && <BeforeAfterGallery sectorId={sector.id} title="Nos Réalisations dans le Secteur Santé" />}

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-16 h-16 mx-auto mb-6 text-accent" />
          <h2 className="text-4xl font-bold mb-6">
            Normes Sanitaires Respectées
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Expertise certifiée pour le secteur médical et hospitalier.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold" asChild>
              <a href="tel:+212661367041">
                <Phone className="w-5 h-5 mr-2" />
                +212 661 367 041
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary" asChild>
              <Link to="/contact">
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecteurSante;