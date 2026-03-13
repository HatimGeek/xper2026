import { useState } from "react";  
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicMediaPairs } from '@/hooks/usePublicData';
import carSeatImage from "@/assets/car-seat-before-after.jpg";
import furnitureImage from "@/assets/furniture-restoration.jpg";
import aviationImage from "@/assets/aviation-leather.jpg";

const AvantApres = () => {
  const [activeFilter, setActiveFilter] = useState("tous");
  const { data: mediaPairs = [], isLoading } = usePublicMediaPairs();

  // Helper function to get media URL
  const getMediaUrl = (filePath: string) => {
    return `https://cssixjhhrvtnzsrzsjsf.supabase.co/storage/v1/object/public/media/${filePath}`;
  };

  // Create filters based on available sectors
  const filters = [
    { id: "tous", label: "Tous", count: mediaPairs.length },
    ...mediaPairs.reduce((acc, pair) => {
      const sectorName = pair.sectors?.name;
      if (sectorName) {
        const existing = acc.find(f => f.id === sectorName.toLowerCase());
        if (existing) {
          existing.count++;
        } else {
          acc.push({ 
            id: sectorName.toLowerCase(), 
            label: sectorName, 
            count: 1 
          });
        }
      }
      return acc;
    }, [] as { id: string; label: string; count: number }[])
  ];

  // Filter media pairs based on active filter
  const filteredGallery = activeFilter === "tous" 
    ? mediaPairs 
    : mediaPairs.filter(pair => pair.sectors?.name.toLowerCase() === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <section className="py-20 bg-gradient-warm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
                Galerie Avant/Après
              </h1>
              <p className="text-lg text-muted-foreground">
                Chargement des réalisations...
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Galerie Avant/Après
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez nos réalisations récentes et la transformation spectaculaire 
              de vos articles en cuir entre les mains de nos experts.
            </p>
          </div>

          {/* Filtres */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-2 p-2 bg-card rounded-2xl shadow-elegant">
              <Filter className="w-5 h-5 text-muted-foreground self-center ml-2" />
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "ghost"}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`transition-all ${
                    activeFilter === filter.id 
                      ? "bg-gradient-leather text-primary-foreground shadow-leather" 
                      : "hover:bg-accent/10"
                  }`}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Galerie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGallery.map((pair) => (
              <Card key={pair.id} className="overflow-hidden hover:shadow-leather transition-all duration-300 hover:-translate-y-1 group">
                <div className="grid grid-cols-2 h-64">
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="secondary" className="text-xs">
                        AVANT
                      </Badge>
                    </div>
                    {pair.before ? (
                      <img
                        src={getMediaUrl(pair.before.file_path)}
                        alt={pair.before.alt_text || `${pair.title} - Avant`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="text-xs">
                        APRÈS
                      </Badge>
                    </div>
                    {pair.after ? (
                      <img
                        src={getMediaUrl(pair.after.file_path)}
                        alt={pair.after.alt_text || `${pair.title} - Après`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Aucune image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {pair.title}
                  </h3>
                  {pair.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {pair.description}
                    </p>
                  )}
                  {pair.services?.title && (
                    <Badge variant="outline" className="text-xs">
                      {pair.services.title}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredGallery.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {mediaPairs.length === 0 
                  ? "Aucune réalisation disponible pour le moment." 
                  : "Aucune réalisation trouvée pour cette catégorie."
                }
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Réalisations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">Ans d'expérience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Satisfaction client</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">2 ans</div>
                <div className="text-muted-foreground">Garantie</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-leather text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Votre projet sera le prochain ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contactez-nous pour transformer vos articles en cuir et rejoindre notre galerie de réussites.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
              Demander un devis gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AvantApres;