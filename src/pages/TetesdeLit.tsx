import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Bed, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import headboardImage from "@/assets/headboard-bedroom.jpg";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import VideoSection from "@/components/VideoSection";
import SectorMediaGallery from "@/components/SectorMediaGallery";
import { usePublicSectors } from "@/hooks/usePublicData";

const TetesdeLit = () => {
  const { data: sectors } = usePublicSectors();
  const sector = sectors?.find(s => 
    s.slug === 'tetes-de-lit' || s.name.toLowerCase().includes('têtes de lit')
  );

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
              <Badge className="bg-accent text-accent-foreground mb-4">🛏️ Têtes de Lit</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Têtes de Lit
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Création et restauration de têtes de lit sur mesure. 
                Expertise artisanale pour un confort et une élégance incomparables.
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
            
            <div className="relative flex justify-center">
              <img 
                src={headboardImage} 
                alt="Tête de lit capitonnée sur mesure"
                className="rounded-2xl shadow-leather w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      <VideoSection videoId={sector?.hero_video_id} />

      <SectorMediaGallery sectorId={sector?.id} />

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Bed className="w-16 h-16 mx-auto mb-6 text-accent" />
          <h2 className="text-4xl font-bold mb-6">
            Confort & Élégance
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Des têtes de lit sur mesure qui transforment votre chambre.
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

export default TetesdeLit;
