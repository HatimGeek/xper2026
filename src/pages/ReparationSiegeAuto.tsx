import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, CheckCircle, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import carSeatImage from "@/assets/car-seat-before-after.jpg";
import { usePublicMediaPairs, usePublicServices, usePublicSectors } from "@/hooks/usePublicData";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import VideoSection from "@/components/VideoSection";
import SectorMediaGallery from "@/components/SectorMediaGallery";

const ReparationSiegeAuto = () => {
  const { data: sectors } = usePublicSectors();
  const { data: services } = usePublicServices();
  const { data: mediaPairs, isLoading } = usePublicMediaPairs();
  
  // Find auto sector
  const autoSector = sectors?.find(s => 
    s.slug === 'automobile' || s.name.toLowerCase().includes('auto')
  );
  
  // Get auto services  
  const autoServices = services?.filter(s => s.sector_id === autoSector?.id) || [];
  
  // Get auto media pairs
  const autoMediaPairs = mediaPairs?.filter(m => m.sector_id === autoSector?.id).slice(0, 3) || [];
  
  const serviceFeatures = [
    "Réparation des déchirures et fissures",
    "Restauration de la couleur d'origine",
    "Traitement anti-usure et imperméabilisation",
    "Rénovation complète des coutures",
    "Nettoyage professionnel en profondeur",
    "Garantie 2 ans sur tous les travaux"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4">🚗 Spécialité Auto</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Réparation Siège Auto en Cuir
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Redonnez vie à vos sièges auto avec notre expertise en restauration du cuir. 
                Devis gratuit et intervention rapide.
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
                src={carSeatImage} 
                alt="Réparation siège auto avant/après"
                className="rounded-2xl shadow-leather w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 rounded-2xl shadow-gold">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold">4.9/5</span>
                </div>
                <p className="text-sm">+200 sièges restaurés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Nos Prestations Sièges Auto
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nous traitons tous types de dommages sur vos sièges auto en cuir, 
              avec des techniques professionnelles et des matériaux haut de gamme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceFeatures.map((feature, index) => (
              <Card key={index} className="border-l-4 border-l-accent hover:shadow-elegant transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{feature}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Notre Processus de Réparation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Diagnostic",
                description: "Évaluation gratuite des dégâts et devis détaillé"
              },
              {
                step: "2", 
                title: "Préparation",
                description: "Nettoyage et préparation de la surface à traiter"
              },
              {
                step: "3",
                title: "Réparation",
                description: "Intervention technique avec nos méthodes éprouvées"
              },
              {
                step: "4",
                title: "Finition",
                description: "Protection et vérification qualité avant livraison"
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-leather text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{process.title}</h3>
                <p className="text-muted-foreground">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoSection videoId={autoSector?.hero_video_id} />

      {/* Gallery */}
      <BeforeAfterGallery sectorId={autoSector?.id} />

      <SectorMediaGallery sectorId={autoSector?.id} />

      {/* CTA */}
      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à restaurer vos sièges ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous dès maintenant pour un devis gratuit et personnalisé.
            Intervention possible à domicile.
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
                Formulaire de contact
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReparationSiegeAuto;