import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Sofa, ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import furnitureImage from "@/assets/furniture-restoration.jpg";
import { usePublicServices, usePublicSectors } from "@/hooks/usePublicData";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import VideoSection from "@/components/VideoSection";
import SectorMediaGallery from "@/components/SectorMediaGallery";

const MeublesCuir = () => {
  const { data: sectors } = usePublicSectors();
  const { data: services } = usePublicServices();
  
  // Find furniture sector
  const furnitureSector = sectors?.find(s => 
    s.slug === 'mobilier' || s.slug === 'meubles' || s.name.toLowerCase().includes('meuble')
  );
  
  // Get furniture services
  const furnitureServices = services?.filter(s => s.sector_id === furnitureSector?.id) || [];
  
  // Fallback static services if no data from DB
  const displayServices = furnitureServices.length > 0 
    ? furnitureServices.map(s => ({
        title: s.title,
        description: s.short_description || s.description || "",
        icon: <Sofa className="w-8 h-8" />
      }))
    : [
        {
          title: "Canapés et Fauteuils",
          description: "Restauration complète de vos sièges en cuir",
          icon: <Sofa className="w-8 h-8" />
        },
        {
          title: "Sièges de Bureau",
          description: "Remise à neuf professionnelle",
          icon: <Shield className="w-8 h-8" />
        },
        {
          title: "Mobilier Vintage",
          description: "Préservation du patrimoine mobilier",
          icon: <Sofa className="w-8 h-8" />
        }
      ];

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
              <Badge className="bg-accent text-accent-foreground mb-4">🛋️ Mobilier</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Restauration Meubles en Cuir
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Redonnez vie à vos meubles en cuir avec notre expertise artisanale. 
                Canapés, fauteuils, sièges de bureau : nous restaurons tout.
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
                src={furnitureImage} 
                alt="Restauration meubles cuir"
                className="rounded-2xl shadow-leather w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Nos Spécialités Mobilier
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-leather transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-leather text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
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

      <VideoSection videoId={furnitureSector?.hero_video_id} />

      <BeforeAfterGallery sectorId={furnitureSector?.id} />

      <SectorMediaGallery sectorId={furnitureSector?.id} />

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Vos meubles méritent le meilleur
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Confiez-nous la restauration de vos meubles en cuir. Expertise et passion du détail.
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

export default MeublesCuir;