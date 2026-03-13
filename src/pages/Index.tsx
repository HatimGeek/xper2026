import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Award, Users, Phone, MessageCircle, ChevronRight } from "lucide-react";
import { usePublicSectors, usePublicServices, usePublicReviews, usePublicMediaPairs } from '@/hooks/usePublicData';
import heroImage from "@/assets/hero-leather-workshop.jpg";
import carSeatImage from "@/assets/car-seat-before-after.jpg";
import furnitureImage from "@/assets/furniture-restoration.jpg";
import aviationImage from "@/assets/aviation-leather.jpg";
import VideoSection from "@/components/VideoSection";
import { ClientsSection } from "@/components/ClientsSection";

const Index = () => {
  // Fetch real data from Supabase
  const { data: sectors = [], isLoading: loadingSectors } = usePublicSectors();
  const { data: services = [], isLoading: loadingServices } = usePublicServices();
  const { data: reviews = [], isLoading: loadingReviews } = usePublicReviews();
  const { data: mediaPairs = [], isLoading: loadingMedia } = usePublicMediaPairs();

  // Map services from Supabase
  const displayServices = services.map(service => ({
    title: service.title,
    description: service.short_description || service.description || '',
    image: carSeatImage, // Default image, can be updated based on service type
    link: `/${service.slug}`,
    icon: "🔧"
  }));

  const stats = [
    { number: "15+", label: "Années d'expérience" },
    { number: "2000+", label: "Clients satisfaits" },
    { number: "98%", label: "Taux de satisfaction" },
    { number: "24h", label: "Délai de réponse" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Xpercuir Pro
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Experts en restauration et réparation du cuir haut de gamme
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Depuis plus de 15 ans, nous redonnons vie à vos sièges auto, meubles et accessoires en cuir 
            avec un savoir-faire artisanal et des techniques de pointe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold text-lg px-8 py-3" asChild>
              <Link to="/contact">
                <Phone className="w-5 h-5 mr-2" />
                Devis Gratuit
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-3" asChild>
              <a href="https://wa.me/212663183984" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection 
        fallbackSrc="/videos/hero-video.mp4"
        title="Découvrez notre savoir-faire"
        description="Plongez dans l'univers de la restauration du cuir avec Xpercuir Pro"
      />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Nos Services d'Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez notre gamme complète de services de restauration du cuir, 
              adaptés à tous vos besoins avec un niveau de qualité irréprochable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayServices.map((service, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-leather transition-all duration-300 hover:-translate-y-1 group"
              >
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${service.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-leather opacity-70 group-hover:opacity-50 transition-opacity"></div>
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-2xl">
                      {service.icon}
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Link to={service.link}>
                    <Button className="w-full bg-gradient-leather group">
                      En savoir plus
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Award className="w-16 h-16 mx-auto mb-6 text-accent" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Garantie Qualité Premium
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tous nos travaux sont garantis et réalisés par des artisans experts. 
            Devis gratuit sous 24h.
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

      {/* Testimonials Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Ils nous font confiance
            </h2>
            <div className="flex justify-center items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-accent text-accent" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5</span>
              <span className="text-muted-foreground ml-1">(248 avis)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(reviews.length > 0 
              ? reviews.filter(r => 
                  r.client_name === "Juls Mens" || 
                  r.client_name === "Anouar Ghrib" || 
                  r.client_name === "Youssef M"
                ).slice(0, 3)
              : [
              {
                client_name: "Juls Mens",
                message: "J'ai fait réparer le cuir du tableau de bord et rénover mon volant, impeccable 👌🏻 ! Des personnes gentilles, professionnelles, un très bon résultat ! Merci je recommande.",
                rating: 5
              },
              {
                client_name: "Anouar Ghrib",
                message: "Un service et un résultat exceptionnels ! Un vrai professionnel du cuir et du plastique, pour voiture ou mobilier. Résultat époustouflant 🥰 Je recommande vivement !",
                rating: 5
              },
              {
                client_name: "Youssef M",
                message: "Très content avec le résultats sur le volant de ma BMW, rapide, efficace et professionnel, je recommande vivement",
                rating: 5
              }
            ]).map((review, index) => (
              <Card key={index} className="shadow-elegant">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{review.message}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-leather rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {review.client_name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">{review.client_name}</p>
                      <p className="text-sm text-muted-foreground">Client vérifié</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/avis-clients">
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                Voir tous les avis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <ClientsSection />
    </div>
  );
};

export default Index;