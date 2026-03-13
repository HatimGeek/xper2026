import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: string;
  images: string[];
  created_at: string;
}

interface Comment {
  id: string;
  product_id: string;
  user_name: string;
  comment: string;
  rating: number;
  created_at: string;
}

const Marketplace = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({
    user_name: "",
    user_email: "",
    comment: "",
    rating: 5,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["marketplace-comments", selectedProduct],
    queryFn: async () => {
      if (!selectedProduct) return [];
      const { data, error } = await supabase
        .from("marketplace_comments")
        .select("*")
        .eq("product_id", selectedProduct)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!selectedProduct,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("marketplace_comments").insert({
        product_id: productId,
        ...commentForm,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès",
      });
      setCommentForm({ user_name: "", user_email: "", comment: "", rating: 5 });
      queryClient.invalidateQueries({ queryKey: ["marketplace-comments"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (productId: string) => {
    if (!commentForm.user_name || !commentForm.user_email || !commentForm.comment) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    addCommentMutation.mutate(productId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-warm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Achat et Vente
          </h1>
          <p className="text-lg text-muted-foreground">
            Découvrez nos produits en cuir disponibles à la vente
          </p>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => {
              const getMediaUrl = (filePath: string) => {
                return `https://whsxgofhinunbcotwnro.supabase.co/storage/v1/object/public/media/${filePath}`;
              };

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-leather transition-smooth group cursor-pointer">
                  {/* Carousel d'images */}
                  {product.images && product.images.length > 0 ? (
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {product.images.length > 1 ? (
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {product.images.map((filePath, idx) => (
                              <CarouselItem key={idx}>
                                <img 
                                  src={getMediaUrl(filePath)} 
                                  alt={`${product.title} ${idx + 1}`}
                                  className="w-full h-full object-cover aspect-square"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                            {product.images.length} photos
                          </div>
                        </Carousel>
                      ) : (
                        <img 
                          src={getMediaUrl(product.images[0])} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Pas d'image</p>
                    </div>
                  )}

                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-heading line-clamp-1">{product.title}</CardTitle>
                      {product.category && (
                        <CardDescription className="text-sm mt-1">{product.category}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-xl font-bold text-accent">
                    {product.price ? `${product.price.toFixed(2)} MAD` : "Prix sur demande"}
                  </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {selectedProduct === product.id ? "Masquer" : "Commentaires"}
                  </Button>

                  {selectedProduct === product.id && (
                    <div className="w-full space-y-4 border-t pt-4">
                      {/* Commentaires existants */}
                      <div className="space-y-3">
                        {comments && comments.length > 0 ? (
                          comments.map((comment) => (
                            <div key={comment.id} className="bg-muted p-3 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">{comment.user_name}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < comment.rating ? "fill-accent text-accent" : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-foreground">{comment.comment}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">Aucun commentaire</p>
                        )}
                      </div>

                      {/* Formulaire de commentaire */}
                      <div className="space-y-3 border-t pt-4">
                        <h4 className="font-semibold text-sm">Laisser un avis</h4>
                        <Input
                          placeholder="Votre nom"
                          value={commentForm.user_name}
                          onChange={(e) => setCommentForm({ ...commentForm, user_name: e.target.value })}
                          className="text-sm"
                        />
                        <Input
                          type="email"
                          placeholder="Votre email"
                          value={commentForm.user_email}
                          onChange={(e) => setCommentForm({ ...commentForm, user_email: e.target.value })}
                          className="text-sm"
                        />
                        <Textarea
                          placeholder="Votre commentaire"
                          value={commentForm.comment}
                          onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Note:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 cursor-pointer transition-colors ${
                                star <= commentForm.rating ? "fill-accent text-accent" : "text-muted-foreground"
                              }`}
                              onClick={() => setCommentForm({ ...commentForm, rating: star })}
                            />
                          ))}
                        </div>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleSubmitComment(product.id)}
                          disabled={addCommentMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
