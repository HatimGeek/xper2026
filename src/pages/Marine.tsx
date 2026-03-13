import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Anchor, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import marineBoatImage from "@/assets/marine-boat-interior.jpg";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import VideoSection from "@/components/VideoSection";
import SectorMediaGallery from "@/components/SectorMediaGallery";
import { usePublicSectors } from "@/hooks/usePublicData";

const Marine = () => {
  const { data: sectors } = usePublicSectors();
  const sector = sectors?.find(s => 
    s.slug === 'marine' || s.name.toLowerCase().includes('marine')
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
              <Badge className="bg-accent text-accent-foreground mb-4">⚓ Marine</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Secteur Marine
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Expertise nautique pour l'entretien et la restauration du cuir marin. 
                Solutions durables résistantes à l'environnement maritime.
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
                src={marineBoatImage} 
                alt="Intérieur bateau cuir marine"
                className="rounded-2xl shadow-leather w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <VideoSection videoId={sector?.hero_video_id} />

      <BeforeAfterGallery sectorId={sector?.id} />

      <SectorMediaGallery sectorId={sector?.id} />

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Anchor className="w-16 h-16 mx-auto mb-6 text-accent" />
          <h2 className="text-4xl font-bold mb-6">
            Excellence Nautique
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Protection et restauration adaptées à l'environnement maritime.
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

export default Marine;
