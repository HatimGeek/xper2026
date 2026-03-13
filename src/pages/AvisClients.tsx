import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Send, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePublicReviews, useSubmitReview } from "@/hooks/usePublicData";
import { supabase } from "@/integrations/supabase/client";
import { getPublicMediaUrl } from "@/lib/utils";

const ReviewPhoto = ({ photoId }: { photoId: string }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const { data, error } = await supabase
          .from('media')
          .select('file_path')
          .eq('id', photoId)
          .single();

        if (error) throw error;
        if (data) {
          setPhotoUrl(getPublicMediaUrl(data.file_path));
        }
      } catch (error) {
        console.error('Error fetching photo:', error);
      }
    };
    fetchPhoto();
  }, [photoId]);

  if (!photoUrl) return null;

  return (
    <img 
      src={photoUrl} 
      alt="Photo client" 
      className="w-full h-24 object-cover rounded-lg"
    />
  );
};

const AvisClients = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    message: ""
  });
  const { toast } = useToast();
  
  const { data: reviews, isLoading } = usePublicReviews();
  const submitReview = useSubmitReview();

  const averageRating = reviews && reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "5.0";
  
  const totalReviews = reviews?.length || 0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotoIds: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `reviews/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create media record
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .insert([{
            filename: file.name,
            file_path: filePath,
            original_filename: file.name,
            mime_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (mediaError) throw mediaError;
        if (mediaData) newPhotoIds.push(mediaData.id);
      }

      setUploadedPhotos([...uploadedPhotos, ...newPhotoIds]);
      toast({
        title: "Photos téléchargées",
        description: `${newPhotoIds.length} photo(s) ajoutée(s) avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les photos: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    setUploadedPhotos(uploadedPhotos.filter(id => id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !formData.name || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner une note.",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitReview.mutateAsync({
        client_name: formData.name,
        message: formData.message,
        rating: rating,
        service_id: null,
        sector_id: null,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      });

      toast({
        title: "Avis envoyé !",
        description: "Merci pour votre retour, il sera publié après validation.",
      });
      
      // Reset form
      setFormData({ name: "", service: "", message: "" });
      setRating(0);
      setUploadedPhotos([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre avis. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

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
              Avis Clients
            </h1>
            <div className="flex justify-center items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-accent text-accent" />
              ))}
              <span className="ml-3 text-2xl font-bold">{averageRating}/5</span>
              <span className="text-muted-foreground ml-2 text-lg">({totalReviews} avis vérifiés)</span>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              La satisfaction de nos clients est notre priorité. Découvrez leurs témoignages 
              et partagez votre expérience avec Xpercuir Pro.
            </p>
          </div>

          {/* Formulaire d'avis */}
          <div className="max-w-2xl mx-auto mb-20">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Laisser un avis</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom *</label>
                      <Input 
                        placeholder="Votre nom" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service utilisé</label>
                      <Input 
                        placeholder="Ex: Réparation siège auto"
                        value={formData.service}
                        onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Note</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredRating || rating) 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Votre avis *</label>
                    <Textarea 
                      placeholder="Partagez votre expérience avec Xpercuir Pro..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Photos (optionnel)</label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <p className="text-sm text-muted-foreground">Téléchargement en cours...</p>
                      )}
                      {uploadedPhotos.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {uploadedPhotos.map((photoId) => (
                            <div key={photoId} className="relative">
                              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <button
                                type="button"
                                onClick={() => removePhoto(photoId)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-leather" disabled={uploading}>
                    <Send className="w-5 h-5 mr-2" />
                    Publier mon avis
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Liste des avis */}
          <div className="grid gap-6">
            <h2 className="text-3xl font-bold text-primary text-center mb-8">
              Témoignages clients
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement des avis...</p>
              </div>
            ) : reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="shadow-elegant hover:shadow-leather transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-leather rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4">
                          {review.client_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{review.client_name}</h3>
                          {review.services && (
                            <Badge variant="secondary" className="text-xs">
                              {review.services.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      "{review.message}"
                    </p>
                    
                    {review.photos && review.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {review.photos.map((photoId, idx) => (
                          <ReviewPhoto key={idx} photoId={photoId} />
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        ✓ Avis vérifié
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Aucun avis pour le moment. Soyez le premier à partager votre expérience !
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">{totalReviews}</div>
                <div className="text-muted-foreground">Avis clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">{averageRating}/5</div>
                <div className="text-muted-foreground">Note moyenne</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalReviews > 0 ? Math.round((reviews!.filter(r => (r.rating || 0) >= 4).length / totalReviews) * 100) : 100}%
                </div>
                <div className="text-muted-foreground">Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Avis vérifiés</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AvisClients;