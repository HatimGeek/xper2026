import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

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

const MarketplaceManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    status: "active",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const getViewport = () => scrollAreaRef.current;
  const scrollToBottom = () => {
    const vp = getViewport();
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
  };
  const scrollToTop = () => {
    const vp = getViewport();
    if (vp) vp.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-marketplace-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("marketplace_products").insert({
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        category: formData.category,
        status: formData.status,
        images: uploadedImages, // Array of file paths (strings)
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produit créé avec succès" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Impossible de publier l'annonce",
        description: error?.message || "Vérifiez les champs puis réessayez.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("marketplace_products")
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          category: formData.category,
          status: formData.status,
          images: uploadedImages, // Array of file paths (strings)
        })
        .eq("id", selectedProduct);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produit mis à jour avec succès" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Mise à jour impossible",
        description: error?.message || "Réessayez plus tard.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Produit supprimé avec succès" });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", price: "", category: "", status: "active" });
    setSelectedProduct(null);
    setIsDialogOpen(false);
    setUploadedImages([]);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      status: product.status,
    });
    setUploadedImages(product.images || []);
    setSelectedProduct(product.id);
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadedFilePaths: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save media record to database  
        await supabase
          .from('media')
          .insert([{
            filename: fileName,
            original_filename: file.name,
            file_path: filePath,
            mime_type: file.type,
            file_size: file.size,
            alt_text: file.name.split('.')[0],
          }]);

        uploadedFilePaths.push(filePath);
      }

      setUploadedImages([...uploadedImages, ...uploadedFilePaths]);
      toast({ title: `${files.length} image(s) uploadée(s) avec succès` });
    } catch (error: any) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast({ title: "Le titre est requis", variant: "destructive" });
      return;
    }
    if (selectedProduct) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Gestion Marketplace</h2>
          <p className="text-muted-foreground">Gérez les produits à vendre</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => {
          const getMediaUrl = (filePath: string) => {
            return `https://cssixjhhrvtnzsrzsjsf.supabase.co/storage/v1/object/public/media/${filePath}`;
          };

          return (
            <Card key={product.id} className="overflow-hidden">
              {product.images && product.images.length > 0 && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img 
                    src={getMediaUrl(product.images[0])} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold text-accent mb-4">
                  {product.price ? `${product.price.toFixed(2)} MAD` : "Prix sur demande"}
                </p>
                {product.images && product.images.length > 1 && (
                  <p className="text-xs text-muted-foreground mb-4">+{product.images.length - 1} photo(s)</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            <DialogDescription className="sr-only">Formulaire pour publier une annonce</DialogDescription>
          </DialogHeader>
          <div ref={scrollAreaRef} className="h-[70vh] overflow-y-auto pr-4">
            <div className="sticky top-0 z-10 flex justify-end gap-2 py-2 bg-background/80 backdrop-blur-sm">
              <Button size="sm" variant="outline" onClick={scrollToBottom}>
                <ChevronDown className="w-4 h-4 mr-1" /> Descendre en bas
              </Button>
              <Button size="sm" variant="ghost" onClick={scrollToTop}>
                <ChevronUp className="w-4 h-4 mr-1" /> Haut
              </Button>
            </div>
            <div className="space-y-4 pb-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Titre du produit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description du produit"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="price">Prix (MAD)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Prix en dirhams"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  placeholder="Ex: Mobilier, Accessoires, etc."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="sold">Vendu</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Photos du produit</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button type="button" disabled={uploading} size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Upload..." : "Upload"}
                    </Button>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {uploadedImages.map((filePath, index) => {
                        const getMediaUrl = (path: string) => {
                          return `https://cssixjhhrvtnzsrzsjsf.supabase.co/storage/v1/object/public/media/${path}`;
                        };
                        
                        return (
                          <div key={index} className="relative group aspect-square">
                            <img 
                              src={getMediaUrl(filePath)} 
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "En cours..." : (selectedProduct ? "Mettre à jour" : "Publier l'annonce")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProduct && deleteMutation.mutate(selectedProduct)}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MarketplaceManagement;
