import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Building, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import officeChairImage from "@/assets/office-chair.jpg";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { VideoSection } from "@/components/VideoSection";
import { SectorMediaGallery } from "@/components/SectorMediaGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ServicesCommerciaux = () => {
  const { data: sector } = useQuery({
    queryKey: ['sector-by-slug', 'commercial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', 'commercial')
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
              <Badge className="bg-accent text-accent-foreground mb-4">🏢 B2B</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Services Commerciaux
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Solutions sur mesure pour entreprises : hôtels, restaurants, 
                concessionnaires et professionnels du cuir.
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
                src={officeChairImage} 
                alt="Services commerciaux cuir - Fauteuil de bureau"
                className="rounded-2xl shadow-leather w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Nos Solutions B2B
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Hôtellerie & Restauration",
                description: "Maintenance préventive de votre mobilier",
                icon: <Building className="w-8 h-8" />
              },
              {
                title: "Concessionnaires Auto",
                description: "Partenariat pour vos clients",
                icon: <Building className="w-8 h-8" />
              }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-leather transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-leather text-primary-foreground rounded-full flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sector Media Gallery */}
      {sector?.id && <SectorMediaGallery sectorId={sector.id} />}

      {/* Before/After Gallery */}
      {sector?.id && <BeforeAfterGallery sectorId={sector.id} title="Nos Réalisations Professionnelles" />}

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Partenaires professionnels
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Développons ensemble une solution adaptée à vos besoins commerciaux.
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
                Demander un devis
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesCommerciaux;