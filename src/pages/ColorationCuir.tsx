import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Palette, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import furnitureImage from "@/assets/furniture-restoration.jpg";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { VideoSection } from "@/components/VideoSection";
import { SectorMediaGallery } from "@/components/SectorMediaGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ColorationCuir = () => {
  const { data: sector } = useQuery({
    queryKey: ['sector-by-slug', 'coloration-cuir'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('slug', 'coloration-cuir')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const colors = [
    { name: "Noir", hex: "#1a1a1a" },
    { name: "Marron", hex: "#8B4513" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Blanc", hex: "#FFFFFF" },
    { name: "Rouge", hex: "#DC143C" },
    { name: "Bleu marine", hex: "#000080" },
    { name: "Gris", hex: "#808080" },
    { name: "Camel", hex: "#C19A6B" }
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
              <Badge className="bg-accent text-accent-foreground mb-4">🎨 Coloration</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Service de Coloration du Cuir
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Changez la couleur de vos articles en cuir ou restaurez leur teinte d'origine 
                avec notre service de coloration professionnel.
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
                alt="Coloration cuir professionnel"
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
              Palette de Couleurs Disponibles
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nous proposons une large gamme de couleurs pour satisfaire tous vos besoins. 
              Couleurs sur mesure également disponibles.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-12">
            {colors.map((color, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 shadow-elegant group-hover:scale-110 transition-transform border-4 border-white"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <p className="text-sm font-medium">{color.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Palette className="w-4 h-4 mr-2" />
              + de 50 couleurs disponibles sur demande
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Nos Techniques de Coloration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Coloration Complète",
                description: "Changement total de couleur pour un nouveau look",
                features: ["Préparation minutieuse", "Application uniforme", "Finition protectrice"]
              },
              {
                title: "Retouche Localisée", 
                description: "Correction de zones décolorées ou usées",
                features: ["Raccord parfait", "Technique invisible", "Résultat naturel"]
              },
              {
                title: "Restauration Couleur",
                description: "Retour à la couleur d'origine",
                features: ["Analyse colorimétrique", "Mélange sur mesure", "Rendu authentique"]
              }
            ].map((technique, index) => (
              <Card key={index} className="hover:shadow-leather transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{technique.title}</CardTitle>
                  <p className="text-muted-foreground">{technique.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {technique.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection 
        videoId={sector?.hero_video_id || undefined}
        title="Notre expertise en coloration"
        description="Découvrez nos techniques professionnelles de coloration du cuir"
      />

      {/* Sector Media Gallery */}
      {sector?.id && <SectorMediaGallery sectorId={sector.id} />}

      {/* Before/After Gallery */}
      <BeforeAfterGallery sectorSlugs={["coloration-cuir"]} title="Nos Réalisations en Coloration" />

      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Vous avez un projet de coloration ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez nos experts pour discuter de votre projet et obtenir un devis personnalisé.
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

export default ColorationCuir;